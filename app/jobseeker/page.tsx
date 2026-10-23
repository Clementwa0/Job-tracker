import { redirect } from "next/navigation";

/** The dashboard lives at one URL: /jobseeker/dashboard (also where sign-in lands). */
export default function JobseekerIndex() {
  redirect("/jobseeker/dashboard");
}
