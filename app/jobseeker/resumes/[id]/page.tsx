import ResumeBuilder from "@/features/jobseeker/resumes/components/ResumeBuilderPage";

type ResumeBuilderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResumeBuilderRoute({ params }: ResumeBuilderPageProps) {
  const { id } = await params;
  return <ResumeBuilder id={id} />;
}