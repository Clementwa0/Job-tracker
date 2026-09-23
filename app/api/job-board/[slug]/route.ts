import { fail, ok } from "@/lib/api/http";
import { publicPostingBySlug } from "@/lib/jobPostings/queries";
type Context = { params: Promise<{ slug: string }> };
export async function GET(_: Request, { params }: Context) {
  const job = await publicPostingBySlug((await params).slug);
  return job ? ok(job) : fail("Job posting not found.", 404);
}
