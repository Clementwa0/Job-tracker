import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { deleteJob, getJob, updateJob } from "@/lib/jobs/queries";
import { JobInputError, sanitizeJobInput } from "@/lib/jobs/sanitizeJobInput";
import { serializeJob } from "@/lib/jobs/serializeJob";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION, pgErrorCode } from "@/lib/db/errors";
import { isUuid } from "@/lib/uuid";

type RouteParams = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ success: false, message: "Application not found." }, { status: 404 });

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    const job = await getJob(auth.payload.sub, id);
    if (!job) return notFound();

    return NextResponse.json({ success: true, data: serializeJob(job) });
  } catch (error) {
    console.error("Failed to load job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load this application." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  try {
    const input = sanitizeJobInput(body as Record<string, unknown>);

    const { jobTitle, companyName } = input.values;
    if (
      (jobTitle !== undefined && !jobTitle.trim()) ||
      (companyName !== undefined && !companyName.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "Job title and company name are required." },
        { status: 400 },
      );
    }

    const job = await updateJob(auth.payload.sub, id, input);
    if (!job) return notFound();

    return NextResponse.json({ success: true, data: serializeJob(job) });
  } catch (error) {
    if (error instanceof JobInputError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    if (pgErrorCode(error) === PG_UNIQUE_VIOLATION) {
      return NextResponse.json(
        { success: false, message: "You're already tracking this job." },
        { status: 409 },
      );
    }
    if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
      return NextResponse.json(
        { success: false, message: "The referenced job posting doesn't exist." },
        { status: 400 },
      );
    }
    console.error("Failed to update job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update this application." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!isUuid(id)) return notFound();

  try {
    const deleted = await deleteJob(auth.payload.sub, id);
    if (!deleted) return notFound();

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete this application." },
      { status: 500 },
    );
  }
}
