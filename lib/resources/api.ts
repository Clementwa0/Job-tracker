import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { fieldErrors } from "./schema";
import { validateResourceFileRef } from "./files";
import type { ResourceInput } from "./schema";

/** 422 body in the project's error shape, plus `errors` for per-field display. */
export function validationFail(
  errors: ZodError | Record<string, string>,
  message = "Please fix the highlighted fields.",
) {
  const map = errors instanceof ZodError ? fieldErrors(errors) : errors;
  return NextResponse.json(
    {
      success: false,
      message,
      errors: Object.entries(map).map(([field, msg]) => ({ field, message: msg })),
    },
    { status: 422 },
  );
}

/** Checks that file references point at our own resources-folder uploads. */
export function fileRefErrors(input: Pick<ResourceInput, "coverImage" | "attachment">): Record<string, string> | null {
  const errors: Record<string, string> = {};
  if (input.coverImage) {
    const e = validateResourceFileRef(input.coverImage, "Cover image");
    if (e) errors.coverImage = e;
  }
  if (input.attachment) {
    const e = validateResourceFileRef(input.attachment, "Attachment");
    if (e) errors.attachment = e;
  }
  return Object.keys(errors).length ? errors : null;
}
