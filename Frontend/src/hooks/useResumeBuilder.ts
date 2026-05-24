import { useCallback, useEffect, useState } from "react";
import { EMPTY_RESUME, uid, type ResumeData, type ResumeExperience, type ResumeEducation, type ResumeProject, type ResumeSkillsGroup } from "@/types/resume-builder";

const STORAGE_KEY = "resume-builder.v1";

function load(): ResumeData {
  if (typeof window === "undefined") return EMPTY_RESUME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_RESUME;
    return { ...EMPTY_RESUME, ...JSON.parse(raw) };
  } catch {
    return EMPTY_RESUME;
  }
}

export function useResumeBuilder() {
  const [data, setData] = useState<ResumeData>(() => load());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota */
    }
  }, [data]);

  const patch = useCallback(<K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const updateContact = useCallback(<K extends keyof ResumeData["contact"]>(k: K, v: ResumeData["contact"][K]) => {
    setData((d) => ({ ...d, contact: { ...d.contact, [k]: v } }));
  }, []);

  // Experience
  const addExperience = useCallback(() => {
    const item: ResumeExperience = {
      id: uid(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    setData((d) => ({ ...d, experience: [...d.experience, item] }));
  }, []);
  const updateExperience = useCallback((id: string, patch: Partial<ResumeExperience>) => {
    setData((d) => ({
      ...d,
      experience: d.experience.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);
  const removeExperience = useCallback((id: string) => {
    setData((d) => ({ ...d, experience: d.experience.filter((x) => x.id !== id) }));
  }, []);

  // Education
  const addEducation = useCallback(() => {
    const item: ResumeEducation = {
      id: uid(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      notes: "",
    };
    setData((d) => ({ ...d, education: [...d.education, item] }));
  }, []);
  const updateEducation = useCallback((id: string, patch: Partial<ResumeEducation>) => {
    setData((d) => ({
      ...d,
      education: d.education.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);
  const removeEducation = useCallback((id: string) => {
    setData((d) => ({ ...d, education: d.education.filter((x) => x.id !== id) }));
  }, []);

  // Projects
  const addProject = useCallback(() => {
    const item: ResumeProject = { id: uid(), name: "", url: "", description: "", tech: [] };
    setData((d) => ({ ...d, projects: [...d.projects, item] }));
  }, []);
  const updateProject = useCallback((id: string, patch: Partial<ResumeProject>) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);
  const removeProject = useCallback((id: string) => {
    setData((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== id) }));
  }, []);

  // Skills
  const addSkillGroup = useCallback(() => {
    const item: ResumeSkillsGroup = { id: uid(), category: "", items: [] };
    setData((d) => ({ ...d, skills: [...d.skills, item] }));
  }, []);
  const updateSkillGroup = useCallback((id: string, patch: Partial<ResumeSkillsGroup>) => {
    setData((d) => ({
      ...d,
      skills: d.skills.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);
  const removeSkillGroup = useCallback((id: string) => {
    setData((d) => ({ ...d, skills: d.skills.filter((x) => x.id !== id) }));
  }, []);

  const reset = useCallback(() => setData(EMPTY_RESUME), []);
  const importJSON = useCallback((d: ResumeData) => setData({ ...EMPTY_RESUME, ...d }), []);

  return {
    data,
    patch,
    updateContact,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addSkillGroup,
    updateSkillGroup,
    removeSkillGroup,
    reset,
    importJSON,
  };
}
