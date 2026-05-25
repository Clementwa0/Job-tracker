import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, RefreshCw, File, X, Loader2, Zap } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface UploadSectionProps {
  cvText: string;
  setCvText: (text: string) => void;
  maxCvLength: number;
  isValidCV: boolean;
  loading: boolean;
  parsingFile: boolean;
  uploadedFile: UploadedFile | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  hasFeedback: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  cvText,
  setCvText,
  maxCvLength,
  isValidCV,
  loading,
  parsingFile,
  uploadedFile,
  fileInputRef,
  hasFeedback,
  handleFileUpload,
  handleSubmit,
  resetForm,
}) => {
  return (
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
          {hasFeedback && (
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
                      <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
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
                  {cvText.length}/{maxCvLength}
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
            <Button type="submit" size="lg" className="px-8" disabled={!isValidCV || loading || parsingFile}>
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
  );
};