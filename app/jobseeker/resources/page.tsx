import PageHeader from "@/components/shared/dashboard/PageHeader";
import ResourceLibrary from "@/features/public/resources/ResourceLibrary";

export default function JobseekerResourcesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Guides, templates and checklists to support your job search. Save the ones you want to come back to."
      />
      <ResourceLibrary mode="jobseeker" basePath="/jobseeker/resources" />
    </div>
  );
}
