import axiosInstance from "@/lib/axiosInstance";

import type {
  ResumeData,
} from "@/types/resume-builder";

/* =========================
   Shared Types
========================= */

export type ImproveKind =
  | "title"
  | "summary"
  | "bullet"
  | "achievement"
  | "tailor";

export interface AIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MatchResult {
  matchScore: number;

  summary?: string;

  strengths?: string[];

  gaps?: string[];

  keywords?: {
    matched?: string[];
    missing?: string[];
  };

  suggestions?: string[];
}

export interface ParseResult {
  confidence: number;

  warnings: string[];

  resume: Partial<ResumeData>;
}

export interface VariantsResult {
  variants: string[];
}

/* =========================
   Generic Request Helper
========================= */

async function post<T>(
  url: string,
  payload?: unknown,
): Promise<T> {
  try {
    const response =
      await axiosInstance.post<T>(
        url,
        payload,
      );

    return response.data;
  } catch (error: any) {
    console.error(
      `[AI Service Error]: ${url}`,
      error,
    );

    throw new Error(
      error?.response?.data?.message ||
        "Something went wrong",
    );
  }
}

/* =========================
   AI Service
========================= */

export const aiService = {
  /* ======================
     Match Resume
  ====================== */

  async matchResume(
    resumeText: string,
    jobDescription: string,
  ): Promise<MatchResult> {
    return post<MatchResult>(
      "/ai/match",
      {
        resumeText,
        jobDescription,
      },
    );
  },

  /* ======================
     Rewrite Bullet
  ====================== */

  async rewriteBullet(
    bullet: string,
    context?: string,
  ): Promise<VariantsResult> {
    return post<VariantsResult>(
      "/ai/rewrite",
      {
        bullet,
        context,
      },
    );
  },

  /* ======================
     Parse Resume
  ====================== */

  async parseResume(
    text: string,
  ): Promise<ParseResult> {
    return post<ParseResult>(
      "/ai/parse",
      {
        text,
      },
    );
  },
  /* ======================
     Improve Text
  ====================== */
  async improve(
    kind: ImproveKind,
    text: string,
    context?: string,
  ): Promise<VariantsResult> {
    return post<VariantsResult>(
      "/ai/improve",
      {
        kind,
        text,
        context,
      },
    );
  },
};