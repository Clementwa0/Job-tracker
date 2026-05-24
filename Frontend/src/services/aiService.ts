import axiosInstance from "@/lib/axiosInstance";
import type { ResumeData } from "@/types/resume-builder";

export interface MatchResult {
  matchScore: number;
  summary?: string;
  strengths?: string[];
  gaps?: string[];
  keywords?: { matched?: string[]; missing?: string[] };
  suggestions?: string[];
}

export interface ParseResult {
  confidence: number;
  warnings: string[];
  resume: Partial<ResumeData>;
}

export type ImproveKind = "summary" | "bullet" | "achievement" | "tailor";

export const aiService = {
  async matchResume(resumeText: string, jobDescription: string): Promise<MatchResult> {
    const { data } = await axiosInstance.post<MatchResult>("/ai/match", {
      resumeText,
      jobDescription,
    });
    return data;
  },

  async rewriteBullet(bullet: string, context?: string): Promise<{ variants: string[] }> {
    const { data } = await axiosInstance.post<{ variants: string[] }>("/ai/rewrite", {
      bullet,
      context,
    });
    return data;
  },

  async parseResume(text: string): Promise<ParseResult> {
    const { data } = await axiosInstance.post<ParseResult>("/ai/parse", { text });
    return data;
  },

  async improve(kind: ImproveKind, text: string, context?: string): Promise<{ variants: string[] }> {
    const { data } = await axiosInstance.post<{ variants: string[] }>("/ai/improve", {
      kind,
      text,
      context,
    });
    return data;
  },
};
