export type SavedJob = {
  slug: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  savedAt: string;
};

export type SaveJobInput = Omit<SavedJob, "savedAt">;
