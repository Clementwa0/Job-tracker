import type { Metadata } from "next";
import { ResourceGuide } from "@/features/public/resources/ResourceGuide";

export const metadata: Metadata = {
  title: "Interview Guide",
  description: "Prepare for interviews with clear examples, useful questions, and thoughtful follow-up.",
};

export default function InterviewGuidePage() {
  return <ResourceGuide guide="interview" />;
}
