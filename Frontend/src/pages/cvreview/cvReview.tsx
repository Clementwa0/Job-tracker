"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

import API from "@/lib/axios";

import mammoth from "mammoth";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

import { toast } from "sonner";

import {
  FileText,
  AlertCircle,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  ActionsPanel,
  FeedbackTabs,
  QuickTips,
  RecommendedJobs,
  ScoreOverview,
  UploadSection,
} from "@/components";
import { getScoreMetrics } from "@/features/cvReview/scoreMetrics";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorker;

/* ---------------- TYPES ---------------- */

interface CVFeedback {
  formatting_and_structure: string;
  grammar_and_clarity: string;
  skills_match: string;
  achievements_and_impact: string;
  ats_compatibility: string;
  ats_score: number;
  recommended_jobs: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}


/* ---------------- CONSTANTS ---------------- */

const MIN_CV_LENGTH = 50;

const MAX_CV_LENGTH = 90000;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* ---------------- COMPONENT ---------------- */

const CVReview: React.FC = () => {
  /* ---------------- STATE ---------------- */

  const [cvText, setCvText] =
    useState("");

  const [feedback, setFeedback] =
    useState<CVFeedback | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [parsingFile, setParsingFile] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("formatting");

  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* ---------------- SCORE METRICS ---------------- */

 

  const scoreMetrics = useMemo(
    () =>
      feedback
        ? getScoreMetrics(
            feedback.ats_score
          )
        : null,
    [feedback, getScoreMetrics]
  );

  /* ---------------- VALIDATION ---------------- */

  const isValidCV = useMemo(() => {
    const text = cvText.trim();

    return (
      text.length >= MIN_CV_LENGTH &&
      text.length <= MAX_CV_LENGTH
    );
  }, [cvText]);

  /* ---------------- FILE EXTRACTION ---------------- */

  const extractTextFromPDF =
    async (
      file: File
    ): Promise<string> => {
      try {
        const buffer =
          await file.arrayBuffer();

        const pdf =
          await pdfjsLib
            .getDocument({
              data: buffer,
            })
            .promise;

        let text = "";

        for (
          let i = 1;
          i <= pdf.numPages;
          i++
        ) {
          const page =
            await pdf.getPage(i);

          const content =
            await page.getTextContent();

          const strings = content.items.map(
            (item: any) => item.str
          );

          text +=
            strings.join(" ") + "\n";
        }

        return text.trim();
      } catch {
        throw new Error(
          "Cannot read PDF file."
        );
      }
    };

  const extractTextFromDOCX =
    async (
      file: File
    ): Promise<string> => {
      try {
        const buffer =
          await file.arrayBuffer();

        const result =
          await mammoth.extractRawText({
            arrayBuffer: buffer,
          });

        return result.value.trim();
      } catch {
        throw new Error(
          "Failed to read DOCX file."
        );
      }
    };

  const extractTextFromDOC =
    async (
      file: File
    ): Promise<string> => {
      try {
        const text = await file.text();

        if (
          text.trim().length >
          MIN_CV_LENGTH
        ) {
          return text.trim();
        }

        throw new Error();
      } catch {
        throw new Error(
          "DOC format not supported."
        );
      }
    };

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFileUpload = useCallback(
  async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        "Maximum file size is 5MB."
      );

      return;
    }

    const allowed =
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".txt");

    if (!allowed) {
      toast.error(
        "Upload PDF, DOCX, DOC or TXT files only."
      );

      return;
    }

    setParsingFile(true);

    setError(null);

    try {
      let text = "";

      if (file.name.endsWith(".pdf")) {
        text =
          await extractTextFromPDF(file);
      } else if (
        file.name.endsWith(".docx")
      ) {
        text =
          await extractTextFromDOCX(
            file
          );
      } else if (
        file.name.endsWith(".doc")
      ) {
        text =
          await extractTextFromDOC(
            file
          );
      } else {
        text = await file.text();
      }

      const cleaned = text
        .replace(/\s+/g, " ")
        .trim();

      if (
        cleaned.length <
        MIN_CV_LENGTH
      ) {
        throw new Error(
          "Too little readable text found."
        );
      }

      const finalText = cleaned.slice(
        0,
        MAX_CV_LENGTH
      );

      setCvText(finalText);

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      toast.success(
        "CV parsed successfully."
      );

      /* ---------------- AUTO ANALYZE ---------------- */

      setLoading(true);

      try {
        const res =
          await API.post<CVFeedback>(
            "/cv",
            {
              cvText: finalText,
            }
          );

        setFeedback(res.data);

        toast.success(
          "CV analysis complete."
        );
      } catch (err: any) {
        const errorMsg =
          err?.response?.data
            ?.error ||
          "Failed to analyze CV.";

        setError(errorMsg);

        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } catch (err: any) {
      toast.error(
        err.message ||
          "Upload failed"
      );
    } finally {
      setParsingFile(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  },
  []
);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!isValidCV) {
      toast.error(
        "Invalid CV length."
      );

      return;
    }

    try {
      setLoading(true);

      setError(null);

      const res =
        await API.post<CVFeedback>(
          "/cv",
          {
            cvText:
              cvText.trim(),
          }
        );

      setFeedback(res.data);

      toast.success(
        "CV analysis complete."
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data
          ?.error ||
        "Failed to analyze CV.";

      setError(errorMsg);

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- COPY ---------------- */

  const copyFeedback =
    async () => {
      if (!feedback) return;

      const text = `
ATS Score: ${feedback.ats_score}/100

Formatting:
${feedback.formatting_and_structure}

Grammar:
${feedback.grammar_and_clarity}

Skills:
${feedback.skills_match}

Achievements:
${feedback.achievements_and_impact}

ATS:
${feedback.ats_compatibility}

Recommended Jobs:
${feedback.recommended_jobs}
`;

      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      toast.success(
        "Copied successfully."
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    };

  /* ---------------- RESET ---------------- */

  const resetForm = () => {
    setCvText("");

    setFeedback(null);

    setUploadedFile(null);

    setError(null);

    setActiveTab("formatting");
  };

  /* ---------------- FEEDBACK CATEGORIES ---------------- */

  const feedbackCategories = [
    {
      id: "formatting",

      key: "formatting_and_structure",

      title:
        "Formatting & Structure",

      icon: (
        <FileText className="h-5 w-5" />
      ),

      color: "text-blue-600",

      bgColor:
        "bg-blue-50 dark:bg-blue-900/20",
    },

    {
      id: "grammar",

      key: "grammar_and_clarity",

      title: "Grammar & Clarity",

      icon: (
        <CheckCircle className="h-5 w-5" />
      ),

      color: "text-green-600",

      bgColor:
        "bg-green-50 dark:bg-green-900/20",
    },

    {
      id: "skills",

      key: "skills_match",

      title: "Skills Match",

      icon: (
        <Target className="h-5 w-5" />
      ),

      color: "text-purple-600",

      bgColor:
        "bg-purple-50 dark:bg-purple-900/20",
    },

    {
      id: "achievements",

      key:
        "achievements_and_impact",

      title:
        "Achievements & Impact",

      icon: (
        <TrendingUp className="h-5 w-5" />
      ),

      color: "text-amber-600",

      bgColor:
        "bg-amber-50 dark:bg-amber-900/20",
    },

    {
      id: "compatibility",

      key: "ats_compatibility",

      title:
        "ATS Compatibility",

      icon: (
        <ShieldCheck className="h-5 w-5" />
      ),

      color: "text-red-600",

      bgColor:
        "bg-red-50 dark:bg-red-900/20",
    },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Resume Review &
            Analysis
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get AI-powered
            resume feedback and
            ATS optimization
            insights.
          </p>
        </div>

        <UploadSection
          cvText={cvText}
          setCvText={setCvText}
          maxCvLength={
            MAX_CV_LENGTH
          }
          isValidCV={isValidCV}
          loading={loading}
          parsingFile={parsingFile}
          uploadedFile={
            uploadedFile
          }
          fileInputRef={
            fileInputRef
          }
          hasFeedback={
            !!feedback
          }
          handleFileUpload={
            handleFileUpload
          }
          handleSubmit={
            handleSubmit
          }
          resetForm={resetForm}
        />

        {feedback && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ScoreOverview
                score={
                  feedback.ats_score
                }
                scoreMetrics={
                  scoreMetrics
                }
              />

              <ActionsPanel
                copied={copied}
                onCopy={
                  copyFeedback
                }
              />
            </div>

            <RecommendedJobs
              recommendedJobsText={
                feedback.recommended_jobs
              }
            />

            <FeedbackTabs
              activeTab={
                activeTab
              }
              setActiveTab={
                setActiveTab
              }
              feedbackCategories={
                feedbackCategories
              }
              feedbackData={
                feedback
              }
            />

            <QuickTips />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />

                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400">
                    Analysis Error
                  </h3>

                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
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