import React, { useState, useCallback, useMemo, useRef } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  FileText,
  Star,
  Copy,
  CheckCircle2,
  Briefcase,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  File,
  X,
  Target,
  Lightbulb,
  Zap,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface CVFeedback {
  formatting_and_structure: string;
  grammar_and_clarity: string;
  skills_match: string;
  achievements_and_impact: string;
  ats_compatibility: string;
  ats_score: number;
  recommended_jobs: string;
}

interface ScoreMetrics {
  color: string;
  label: string;
  badgeClass: string;
  progressClass: string;
  icon: React.ReactNode;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

const MIN_CV_LENGTH = 50;
const MAX_CV_LENGTH = 90000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const CVReview: React.FC = () => {
  const [cvText, setCvText] = useState("");
  const [feedback, setFeedback] = useState<CVFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("formatting");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getScoreMetrics = useCallback((score: number): ScoreMetrics => {
    if (score >= 90)
      return {
        color: "text-green-600",
        label: "Excellent",
        badgeClass: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
        progressClass: "bg-gradient-to-r from-green-500 to-emerald-500",
        icon: <Star className="h-4 w-4" />,
      };
    if (score >= 75)
      return {
        color: "text-blue-600",
        label: "Good",
        badgeClass: "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200",
        progressClass: "bg-gradient-to-r from-blue-500 to-sky-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    if (score >= 60)
      return {
        color: "text-amber-600",
        label: "Average",
        badgeClass: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
        progressClass: "bg-gradient-to-r from-amber-500 to-yellow-500",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    return {
      color: "text-red-600",
      label: "Needs Work",
      badgeClass: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
      progressClass: "bg-gradient-to-r from-red-500 to-rose-500",
      icon: <AlertCircle className="h-4 w-4" />,
    };
  }, []);

  const scoreMetrics = useMemo(
    () => (feedback ? getScoreMetrics(feedback.ats_score) : null),
    [feedback, getScoreMetrics]
  );

  const isValidCV = useMemo(() => {
    const t = cvText.trim();
    return t.length >= MIN_CV_LENGTH && t.length <= MAX_CV_LENGTH;
  }, [cvText]);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: { str?: string }) => item.str ?? "");
        text += strings.join(" ") + "\n";
      }

      return text.trim();
    } catch (err) {
      console.error("PDF error:", err);
      throw new Error("Cannot read this PDF. If it's scanned, upload DOCX or paste text.");
    }
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value.trim();
    } catch (err) {
      console.error("DOCX error:", err);
      throw new Error("Failed to read DOCX file.");
    }
  };

  const extractTextFromDOC = async (file: File): Promise<string> => {
    try {
      const text = await file.text();
      if (text.trim().length > MIN_CV_LENGTH) return text.trim();
      throw new Error();
    } catch {
      throw new Error("Old DOC format not supported. Please upload DOCX or PDF.");
    }
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 5MB.",
      });
      return;
    }

    const isAllowed =
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".txt");

    if (!isAllowed) {
      toast.error("Invalid file type", {
        description: "Please upload PDF, DOCX, DOC or TXT files.",
      });
      return;
    }

    setParsingFile(true);
    setError(null);

    try {
      let text = "";

      if (file.name.endsWith(".pdf")) text = await extractTextFromPDF(file);
      else if (file.name.endsWith(".docx")) text = await extractTextFromDOCX(file);
      else if (file.name.endsWith(".doc")) text = await extractTextFromDOC(file);
      else text = await file.text();

      const cleaned = text.replace(/\s+/g, " ").trim();

      if (cleaned.length < MIN_CV_LENGTH)
        throw new Error("Too little readable text found in file.");

      setCvText(cleaned.slice(0, MAX_CV_LENGTH));
      setUploadedFile({ name: file.name, size: file.size, type: file.type });

      toast.success("File uploaded successfully", {
        description: `"${file.name}" has been loaded.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Upload failed", { description: msg });
    } finally {
      setParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCV) {
      toast.error("Invalid CV length", {
        description: `CV must be between ${MIN_CV_LENGTH} and ${MAX_CV_LENGTH} characters.`,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<CVFeedback>("/cv", { cvText: cvText.trim() });
      setFeedback(data);
      toast.success("CV Analysis Complete!", {
        description: "Your CV has been analyzed successfully.",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze CV. Please try again.";
      setError(errorMsg);
      toast.error("Analysis Failed", { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const copyFeedback = async () => {
    if (!feedback) return;
    const feedbackText = `CV Analysis Results:
    
ATS Score: ${feedback.ats_score}/100

Formatting & Structure:
${feedback.formatting_and_structure}

Grammar & Clarity:
${feedback.grammar_and_clarity}

Skills Match:
${feedback.skills_match}

Achievements & Impact:
${feedback.achievements_and_impact}

ATS Compatibility:
${feedback.ats_compatibility}

Recommended Jobs:
${feedback.recommended_jobs}`;

    await navigator.clipboard.writeText(feedbackText);
    setCopied(true);
    toast.success("Feedback copied!", {
      description: "Analysis results copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setCvText("");
    setFeedback(null);
    setUploadedFile(null);
    setError(null);
    setActiveTab("formatting");
  };

  const renderFeedbackContent = (content: string, icon?: React.ReactNode) => {
    if (!content.trim()) {
      return <p className="text-sm text-muted-foreground italic">No feedback available.</p>;
    }

    const points = content
      .split("\n")
      .filter(line => line.trim())
      .map(line => line.replace(/^[•\-*\s]+/, "").trim());

    return (
      <div className="space-y-2">
        {points.map((point, index) => (
          <div key={index} className="flex items-start gap-3">
            {icon || <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{point}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderRecommendedJobs = () => {
    if (!feedback?.recommended_jobs) return null;
    
    const jobs = feedback.recommended_jobs
      .split("\n")
      .filter(job => job.trim())
      .map(job => job.replace(/^[•\-*\s]+/, "").trim());

    if (jobs.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.slice(0, 6).map((job, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on your skills and experience
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const feedbackCategories = [
    {
      id: "formatting",
      key: "formatting_and_structure",
      title: "Formatting & Structure",
      icon: <FileText className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "grammar",
      key: "grammar_and_clarity",
      title: "Grammar & Clarity",
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "skills",
      key: "skills_match",
      title: "Skills Match",
      icon: <Target className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "achievements",
      key: "achievements_and_impact",
      title: "Achievements & Impact",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "compatibility",
      key: "ats_compatibility",
      title: "ATS Compatibility",
      icon: <ShieldCheck className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="min-h-screen  dark:bg-gray-900  p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Resume Review & Analysis
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get comprehensive AI-powered feedback to optimize your CV and improve your ATS score
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Upload or Paste Your CV
                </CardTitle>
                <CardDescription>
                  Upload PDF, DOCX, DOC, or TXT files, or paste your CV content directly
                </CardDescription>
              </div>
              {feedback && (
                <Button variant="outline" onClick={resetForm} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Analyze Another
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <Label htmlFor="cv-upload">Upload CV File</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <Input
                      id="cv-upload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <File className="h-4 w-4" />
                      Choose File
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      Supported: PDF, DOCX, DOC, TXT • Max 5MB
                    </p>
                  </div>
                  
                  {uploadedFile && (
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{uploadedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetForm}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Text Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cv-text">Or Paste CV Text</Label>
                    <span className={`text-sm font-medium ${!isValidCV ? "text-amber-600" : "text-green-600"}`}>
                      {cvText.length}/{MAX_CV_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="cv-text"
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Paste your CV content here..."
                    className="min-h-[200px] resize-y font-mono"
                    disabled={parsingFile}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8"
                  disabled={!isValidCV || loading || parsingFile}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : parsingFile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing File...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Analyze CV with AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {feedback && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Score Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ATS Score Card */}
              <Card className="lg:col-span-2 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    ATS Compatibility Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className={`text-6xl font-bold ${scoreMetrics?.color}`}>
                          {feedback.ats_score}
                          <span className="text-3xl text-muted-foreground">/100</span>
                        </div>
                        <Badge className={`mt-4 text-lg py-2 px-6 ${scoreMetrics?.badgeClass}`}>
                          <span className="flex items-center gap-2">
                            {scoreMetrics?.icon}
                            {scoreMetrics?.label}
                          </span>
                        </Badge>
                      </div>
                      <div className="w-full max-w-md">
                        <Progress value={feedback.ats_score} className={`h-3 ${scoreMetrics?.progressClass}`} />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          {[0, 25, 50, 75, 100].map((value) => (
                            <span key={value}>{value}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={copyFeedback} className="w-full gap-2">
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Feedback
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Save Report
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="h-4 w-4" />
                    Export as PDF
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Jobs Grid */}
            {renderRecommendedJobs() && (
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Recommended Job Opportunities
                  </CardTitle>
                  <CardDescription>
                    Based on your CV analysis, here are roles that match your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRecommendedJobs()}
                </CardContent>
              </Card>
            )}

            {/* Feedback Tabs Grid */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-muted/50 p-1">
                {feedbackCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      {cat.icon}
                      {cat.title.split(" ")[0]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {feedbackCategories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className={cat.color}>{cat.icon}</span>
                        {cat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`p-6 rounded-lg ${cat.bgColor}`}>
                        {renderFeedbackContent(feedback[cat.key as keyof CVFeedback] as string, cat.icon)}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Quick Tips Grid */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  Quick Improvement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                      ✓ Use Action Verbs
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Start bullet points with strong action verbs like "Led", "Managed", "Increased"
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                      ✓ Quantify Achievements
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Include numbers and metrics to show impact (e.g., "Increased sales by 25%")
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                      ✓ Keywords Optimization
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Include relevant keywords from job descriptions to improve ATS matching
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400">Analysis Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CVReview;