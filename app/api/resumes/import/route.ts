import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { RESUME_IMPORT_SYSTEM_PROMPT, buildRetryFeedback } from "@/lib/ai/prompts/resumeImport";
import { aiFailure, authorizeAiRequest } from "@/lib/ai/route";
import { extractDocumentText } from "@/lib/document/documentExtract";
import { guardAgainstFabrication, hasUsableContent, sanitizeImportedResume, type GuardResult, type ImportedResume } from "@/lib/resume/importGuard";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_TEXT_LENGTH = 30_000;
const MAX_ATTEMPTS = 2;

type Message = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request);
  if ("response" in access) return access.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "Choose a resume file to import." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ success: false, message: "Resume files must be smaller than 3 MB." }, { status: 400 });
  }
  if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
    return NextResponse.json({ success: false, message: "Use a PDF, DOCX, or TXT file." }, { status: 400 });
  }

  try {
    const text = await extractDocumentText(file);
    if (text.trim().length < 40) {
      return NextResponse.json({ success: false, message: "We couldn't find enough readable text in that file." }, { status: 422 });
    }

    // Split on paragraph/line boundaries so long resumes are processed in full.
    // Every chunk is validated against its own source; no tail content is discarded.
    const chunks: string[] = [];
    let remaining = text.trim();
    while (remaining.length > MAX_TEXT_LENGTH) {
      const candidate = remaining.slice(0, MAX_TEXT_LENGTH);
      let split = candidate.lastIndexOf("\n\n");
      if (split < MAX_TEXT_LENGTH / 2) split = candidate.lastIndexOf("\n");
      if (split < MAX_TEXT_LENGTH / 2) split = candidate.lastIndexOf(" ");
      if (split < MAX_TEXT_LENGTH / 2) split = MAX_TEXT_LENGTH;
      chunks.push(remaining.slice(0, split).trim());
      remaining = remaining.slice(split).trimStart();
    }
    if (remaining) chunks.push(remaining);

    const parts: ImportedResume[] = [];
    const warnings: string[] = [];
    for (const chunk of chunks) {
      const messages: Message[] = [
        { role: "system", content: RESUME_IMPORT_SYSTEM_PROMPT },
        { role: "user", content: chunk },
      ];
      let guarded: GuardResult | null = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const parsed = await chat({ model: MODEL_FALLBACKS.parsing, temperature: TEMPERATURE.EXTRACTION, messages });
        guarded = guardAgainstFabrication(sanitizeImportedResume(parsed), chunk);
        if (!guarded.problems.length) break;
        messages.push(
          { role: "assistant", content: JSON.stringify(parsed) },
          { role: "user", content: buildRetryFeedback(guarded.problems) },
        );
      }
      if (!guarded || guarded.fatal || guarded.problems.length) {
        warnings.push(`Section ${parts.length + warnings.length + 1} could not be fully verified; review imported information carefully.`);
        if (guarded && !guarded.fatal && hasUsableContent(guarded.resume)) parts.push(guarded.resume);
        continue;
      }
      parts.push(guarded.resume);
    }

    // Merge structured fields, deduplicating overlapping sections without
    // dropping distinct jobs, education, skills, projects or credentials.
    if (!parts.length) {
      return NextResponse.json({ success: false, message: "No resume information could be extracted reliably." }, { status: 422 });
    }
    const first = parts[0];
    const unique = <T>(items: T[], key: (item: T) => string): T[] => {
      const seen = new Set<string>();
      return items.filter((item) => {
        const id = key(item).trim().toLowerCase();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    };
    const resume: ImportedResume = {
      contact: { ...first.contact },
      summary: parts.map((p) => p.summary).find(Boolean) || "",
      experience: unique(parts.flatMap((p) => p.experience), (e) => `${e.company}|${e.role}|${e.startDate}|${e.endDate}`),
      education: unique(parts.flatMap((p) => p.education), (e) => `${e.school}|${e.degree}|${e.field}|${e.startDate}`),
      projects: unique(parts.flatMap((p) => p.projects), (e) => `${e.name}|${e.url}`),
      skills: [],
      certifications: unique(parts.flatMap((p) => p.certifications), (e) => `${e.name}|${e.issuer}`),
      languages: unique(parts.flatMap((p) => p.languages), (e) => e.name),
    };
    for (const part of parts.slice(1)) {
      for (const key of Object.keys(resume.contact) as (keyof typeof resume.contact)[]) {
        if (!resume.contact[key] && part.contact[key]) resume.contact[key] = part.contact[key];
      }
    }
    const skills = new Map<string, string[]>();
    for (const part of parts) for (const group of part.skills) {
      const category = group.category || "Other";
      const existing = skills.get(category) || [];
      skills.set(category, unique([...existing, ...group.items], (item) => item));
    }
    resume.skills = [...skills].map(([category, items]) => ({ category, items }));
    if (!hasUsableContent(resume)) {
      return NextResponse.json({ success: false, message: "We couldn't identify usable resume content." }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: resume,
      warnings,
      partial: warnings.length > 0,
      improvements: {
        experience: resume.experience.some((entry) => entry.bullets.length > 0),
        summary: resume.summary.length > 0,
        skills: resume.skills.length > 0,
      },
    });
  } catch (error) {
    return aiFailure(error, "We couldn't import this resume. Please try another file.");
  }
}
