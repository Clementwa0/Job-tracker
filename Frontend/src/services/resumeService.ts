import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { ResumeData, ResumeMeta } from "@/types/resume-builder";

type ResumeListResponse = ApiSuccessResponse<ResumeMeta[]>;
type ResumeResponse = ApiSuccessResponse<ResumeData>;

function toPayload(data: ResumeData) {
  return {
    title: data.meta?.name || "Untitled resume",
    template: data.template,
    accent: data.accent,
    contact: data.contact,
    summary: data.summary,
    experience: data.experience,
    education: data.education,
    projects: data.projects,
    skills: data.skills,
    certifications: data.certifications,
    languages: data.languages,
  };
}

export const resumeService = {
  async list(): Promise<ResumeMeta[]> {
    const { data } = await axiosInstance.get<ResumeListResponse>("/resumes");
    return data.data;
  },

  async get(id: string): Promise<ResumeData> {
    const { data } = await axiosInstance.get<ResumeResponse>(`/resumes/${id}`);
    return data.data;
  },

  async create(resume: ResumeData): Promise<ResumeData> {
    const { data } = await axiosInstance.post<ResumeResponse>("/resumes", toPayload(resume));
    return data.data;
  },

  async update(id: string, resume: ResumeData): Promise<ResumeData> {
    const { data } = await axiosInstance.put<ResumeResponse>(`/resumes/${id}`, toPayload(resume));
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`/resumes/${id}`);
  },
};
