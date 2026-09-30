import { NextResponse } from "next/server";

import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import {
  chat,
  MODEL_FALLBACKS,
  TEMPERATURE,
} from "@/lib/ai/groq";
import { CV_PARSE_SYSTEM_PROMPT } from "@/lib/ai/prompts/cvParsePrompt";
import { extractDocumentText } from "@/lib/document/documentExtract";
import {
  storeUploadedFile,
  UploadValidationError,
} from "@/lib/storage/upload.server";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MIN_TEXT_LENGTH = 80;
const MAX_TEXT_LENGTH = 18_000;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const CV_EXTENSIONS = /\.(pdf|docx)$/i;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/* -------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* -------------------------------------------------------------------------- */

const fail = (message: string, status: number) =>
  NextResponse.json({ success: false, message }, { status });

/* -------------------------------------------------------------------------- */
/* Sanitizers                                                                 */
/* -------------------------------------------------------------------------- */

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown, limit = 50): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" && Boolean(item.trim()),
    )
    .map((item) => item.trim())
    .slice(0, limit);
}

function objectValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/* -------------------------------------------------------------------------- */
/* Prompt-injection hardening                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Best-effort sanitization of CV text before sending it to the AI.
 *
 * The goal is not to make injection impossible (that's the model's job
 * given a strict system prompt) but to remove the most common forms of
 * accidental instruction leakage:
 *   - code fences (which are often used to hide JSON/prompt payloads)
 *   - role prefixes anywhere in the text ("system:", "user:", etc.)
 *   - whole lines that start with an instruction-style verb
 */
function sanitizeCvText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\b(system|assistant|user|tool)\s*:/gi, " ")
    .replace(
      /^\s*(ignore|disregard|forget|override|new instructions?)\b.*$/gim,
      "",
    )
    .replace(/[ \t]+/g, " ")
    .slice(0, MAX_TEXT_LENGTH)
    .trim();
}

/* -------------------------------------------------------------------------- */
/* AI result validation + normalization                                       */
/* -------------------------------------------------------------------------- */

/**
 * Guard against malformed AI responses reaching the normalizer.
 */
function ensureObjectResult(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error("AI returned an invalid resume structure.");
}

function normalizeParsedResume(result: Record<string, unknown>) {
  const resume = objectValue(result.resume);
  const contact = objectValue(resume.contact);

  const experience = Array.isArray(resume.experience)
    ? resume.experience.slice(0, 30).map((item) => {
        const entry = objectValue(item);
        return {
          company: stringValue(entry.company),
          role: stringValue(entry.role),
          location: stringValue(entry.location),
          startDate: stringValue(entry.startDate),
          endDate: stringValue(entry.endDate),
          current: entry.current === true,
          bullets: stringArray(entry.bullets, 10),
        };
      })
    : [];

  const education = Array.isArray(resume.education)
    ? resume.education.slice(0, 20).map((item) => {
        const entry = objectValue(item);
        return {
          school: stringValue(entry.school),
          degree: stringValue(entry.degree),
          field: stringValue(entry.field),
          startDate: stringValue(entry.startDate),
          endDate: stringValue(entry.endDate),
          notes: stringValue(entry.notes),
        };
      })
    : [];

  const certifications = Array.isArray(resume.certifications)
    ? resume.certifications.slice(0, 20).map((item) => {
        const entry = objectValue(item);
        return {
          name: stringValue(entry.name),
          issuer: stringValue(entry.issuer),
          date: stringValue(entry.date),
          url: stringValue(entry.url),
        };
      })
    : [];

  const skills = Array.isArray(resume.skills)
    ? resume.skills
        .flatMap((item) => {
          const entry = objectValue(item);
          return stringArray(entry.items, 20);
        })
        .slice(0, 40)
    : [];

  const rawConfidence = Number(result.confidence);
  const confidence = Number.isFinite(rawConfidence)
    ? Math.max(0, Math.min(1, rawConfidence))
    : 0.5;

  return {
    confidence,
    warnings: stringArray(result.warnings, 20),
    fileName: "",
    contact: {
      fullName: stringValue(contact.fullName),
      title: stringValue(contact.title),
      email: stringValue(contact.email),
      phone: stringValue(contact.phone),
      location: stringValue(contact.location),
      website: stringValue(contact.website),
      linkedin: stringValue(contact.linkedin),
      github: stringValue(contact.github),
    },
    summary: stringValue(resume.summary),
    skills,
    experience,
    education,
    certifications,
  };
}

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  /* ---- Auth ------------------------------------------------------------- */

  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return fail(auth.message, auth.status);
  }

  /* ---- Parse form data -------------------------------------------------- */

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[CV IMPORT] Failed to read multipart form data:", error);
    return fail(
      "The CV upload could not be read. Please try uploading the file again.",
      400,
    );
  }

  const fileValue = formData.get("file");
  if (!fileValue || !(fileValue instanceof File)) {
    return fail("No CV file provided.", 400);
  }
  const file = fileValue;

  /* ---- Validate BEFORE touching storage or AI --------------------------- */

  if (!file.name || !CV_EXTENSIONS.test(file.name)) {
    return fail("Upload a PDF or DOCX CV.", 400);
  }

  if (file.size === 0) {
    return fail(
      "The uploaded CV is empty. Please choose another file.",
      400,
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return fail("Your CV must be 5 MB or smaller.", 400);
  }

  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return fail(
      "Unsupported CV format. Please upload a PDF or DOCX file.",
      400,
    );
  }

  /* ---- Step 1: extract text (most failure-prone; nothing stored yet) --- */

  let extractedText: string;
  try {
    extractedText = await extractDocumentText(file);
  } catch (error) {
    console.error("[CV IMPORT] Document extraction failed:", error);
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.toLowerCase().includes("not installed") ||
      message.toLowerCase().includes("module not found")
    ) {
      return fail(
        "The CV document parser is not available on the server. Please contact support.",
        500,
      );
    }

    return fail(
      "We could not read the text from this CV. Please upload a text-based PDF or DOCX file.",
      422,
    );
  }

  const rawText = extractedText.trim();

  if (rawText.length < MIN_TEXT_LENGTH) {
    return fail(
      "Could not extract enough text from this CV. Please upload a clearer or text-based PDF/DOCX file.",
      422,
    );
  }

  const clean = sanitizeCvText(rawText);
  if (!clean) {
    return fail("No readable CV content was found.", 422);
  }

  /* ---- Step 2: store file (only after extraction succeeds) -------------- */

  let stored: Awaited<ReturnType<typeof storeUploadedFile>>;
  try {
    stored = await storeUploadedFile(file, auth.payload.sub);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return fail(error.message, 400);
    }
    console.error("[CV IMPORT] Storage failed:", error);
    return fail("We couldn't save your CV. Please try again.", 500);
  }

  /* ---- Step 3: AI parse -------------------------------------------------- */

  let aiResult: unknown;
  try {
    aiResult = await chat({
      model: MODEL_FALLBACKS.parsing,
      temperature: TEMPERATURE.PARSING,
      messages: [
        { role: "system", content: CV_PARSE_SYSTEM_PROMPT },
        { role: "user", content: clean },
      ],
    });
  } catch (error) {
    console.error("[CV IMPORT] AI parsing failed:", error);
    return fail(
      "The CV was read successfully, but we could not analyze it right now. Please try again.",
      502,
    );
  }

  /* ---- Step 4: validate + normalize ------------------------------------- */

  let result: Record<string, unknown>;
  try {
    result = ensureObjectResult(aiResult);
  } catch (error) {
    console.error("[CV IMPORT] Invalid AI response:", error);
    return fail(
      "The CV was read, but the extracted information was invalid. Please try again.",
      502,
    );
  }

  const normalized = normalizeParsedResume(result);

  return NextResponse.json({
    success: true,
    data: {
      ...normalized,
      fileName: file.name,
      storedUrl: stored.url,
    },
  });
}