export interface CVFeedback {
  formatting_and_structure: string;
  grammar_and_clarity: string;
  skills_match: string;
  achievements_and_impact: string;
  ats_compatibility: string;
  ats_score: number;
  recommended_jobs: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export interface ReviewCvDto {
  cvText: string;
  jobDescription?: string;
}