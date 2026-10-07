import type { Metadata } from "next";
import { ResourceGuide } from "@/features/public/resources/ResourceGuide";

export const metadata: Metadata = {
  title: "Resume Tips",
  description: "Practical tips to make your resume clear, relevant, and easy to review.",
};

export default function ResumeTipsPage() {
  return <ResourceGuide guide="resume" />;
}
