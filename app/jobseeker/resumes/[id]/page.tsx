import ResumeBuilderPage from "@/features/jobseeker/resumes/ResumeBuilderPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResumeBuilderPage key={id} id={id} />;
}
