import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { RESUME_IMPORT_SYSTEM_PROMPT, buildRetryFeedback } from "@/lib/ai/prompts/resumeImport";
import { aiFailure, authorizeAiRequest } from "@/lib/ai/route";
import { extractDocumentText } from "@/lib/document/documentExtract";
import { guardAgainstFabrication, hasUsableContent, sanitizeImportedResume, type GuardResult } from "@/lib/resume/importGuard";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
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
    return NextResponse.json({ success: false, message: "Resume files must be smaller than 5 MB." }, { status: 400 });
  }
  if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
    return NextResponse.json({ success: false, message: "Use a PDF, DOCX, or TXT file." }, { status: 400 });
  }

  try {
    const text = (await extractDocumentText(file)).slice(0, MAX_TEXT_LENGTH);
    if (text.trim().length < 40) {
      return NextResponse.json({ success: false, message: "We couldn't find enough readable text in that file." }, { status: 422 });
    }

    // Groq rebuilds the resume from the CV (structure + improved wording). The original text stays the
    // source of truth: every result is checked against it, with one corrective retry before giving up.
    const messages: Message[] = [
      { role: "system", content: RESUME_IMPORT_SYSTEM_PROMPT },
      { role: "user", content: text },
    ];
    let guarded: GuardResult | null = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const parsed = await chat({ model: MODEL_FALLBACKS.parsing, temperature: TEMPERATURE.EXTRACTION, messages });
      guarded = guardAgainstFabrication(sanitizeImportedResume(parsed), text);
      if (!guarded.problems.length) break;
      console.warn(`Resume import attempt ${attempt} had unsupported content:`, guarded.problems);
      messages.push(
        { role: "assistant", content: JSON.stringify(parsed) },
        { role: "user", content: buildRetryFeedback(guarded.problems) },
      );
    }

    if (!guarded || guarded.fatal || !hasUsableContent(guarded.resume)) {
      return NextResponse.json(
        { success: false, message: "We couldn't reliably rebuild this resume from your file. Please try again." },
        { status: 422 },
      );
    }

    const { resume } = guarded;
    return NextResponse.json({
      success: true,
      data: resume,
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
