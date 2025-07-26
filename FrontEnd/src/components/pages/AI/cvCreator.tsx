import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, ClipboardPaste, Sparkles } from "lucide-react";

const CvReview = () => {
  const [cvText, setCvText] = useState("");
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const extractText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string).slice(0, 5000));
      reader.onerror = () => reject("Failed to read file");
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError("File too large");

    setError("");
    setIsLoading(true);
    setProgress(30);

    try {
      const content = await extractText(file);
      setCvText(content);
      setProgress(60);
    } catch {
      setError("Could not extract file text");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const analyzeCv = async () => {
    if (!cvText.trim()) {
      setError("Please provide your CV");
      return;
    }

    setIsLoading(true);
    setError("");
    setReview("");
    setProgress(20);

    try {
      const response = await fetch("http://localhost:3000/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText }),
      });

      if (!response.ok || !response.body) throw new Error("Failed stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setReview((prev) => prev + chunk);
        setProgress((p) => Math.min(p + 5, 95));
      }

      setProgress(100);
    } catch (err) {
      setError("Failed to analyze CV.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="text-indigo-600" />
        AI CV Review
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 border-b-2 ${
            activeTab === "paste" ? "border-indigo-600 text-indigo-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("paste")}
        >
          <ClipboardPaste className="inline w-4 h-4 mr-2" />
          Paste
        </button>
        <button
          className={`px-4 py-2 border-b-2 ${
            activeTab === "upload" ? "border-indigo-600 text-indigo-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          <Upload className="inline w-4 h-4 mr-2" />
          Upload
        </button>
      </div>

      {activeTab === "paste" ? (
        <Textarea
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          rows={12}
          placeholder="Paste your CV here..."
          disabled={isLoading}
        />
      ) : (
        <div onClick={() => !isLoading && fileInputRef.current?.click()} className="cursor-pointer p-8 border-dashed border-2 text-center">
          <Upload className="w-10 h-10 mx-auto mb-2" />
          Click to upload .txt file (max 2MB)
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <Button onClick={analyzeCv} disabled={isLoading || !cvText.trim()} className="mt-4 w-full">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Review My CV
      </Button>

      {isLoading && <Progress value={progress} className="mt-2" />}

      <div className="mt-6 bg-gray-100 p-4 rounded-md min-h-[200px] whitespace-pre-wrap text-sm dark:bg-gray-900  border">
        {review || "Your AI review will appear here."}
      </div>
    </div>
  );
};

export default CvReview;
