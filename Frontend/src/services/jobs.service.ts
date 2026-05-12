import { api } from "@/lib/api/api-wrapper";

/** Backend wraps lists as `{ success, data: Job[] }`. */
type JobsEnvelope = { success?: boolean; data?: unknown };

export const fetchJobs = async () => {
  const res = await api.get<JobsEnvelope | unknown[]>("/jobs");
  const body = res.data;
  if (Array.isArray(body)) return body;
  const list = (body as JobsEnvelope)?.data;
  return Array.isArray(list) ? list : [];
};

export const createJob = async (job: unknown) => {
  const res = await api.post<any>("/jobs", job);
  return res.data;
};

export const updateJob = async (id: string, job: unknown) => {
  const res = await api.put<any>(`/jobs/${id}`, job);
  return res.data;
};

export const deleteJob = async (id: string) => {
  const res = await api.delete<any>(`/jobs/${id}`);
  return res.data;
};
