import type { Metadata } from "next";
import { ResourceGuide } from "@/features/public/resources/ResourceGuide";

export const metadata: Metadata = {
  title: "Career Resources",
  description: "Practical guidance for planning your career and managing a focused job search.",
};

export default function ResourcesPage() {
  return <ResourceGuide guide="career" />;
}
