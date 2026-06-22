import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobPostingForm, { emptyJobPostingForm } from "@/features/employer/JobPostingForm";
import JobPostingAiAssist from "@/features/employer/JobPostingAiAssist";
import { employerService } from "@/services/employerService";
import type { EmployerJobPayload } from "@/types/employer";
import { getApiErrorMessage } from "@/lib/apiError";

export default function EmployerJobCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<EmployerJobPayload>(emptyJobPostingForm);
  const [saving, setSaving] = useState(false);
  const [companyLocation, setCompanyLocation] = useState("");

  useEffect(() => {
    employerService.getCompany().then((c) => {
      if (c.location) setCompanyLocation(c.location);
    }).catch(() => { /* optional */ });
  }, []);

  const patch = (p: Partial<EmployerJobPayload>) => setForm((prev) => ({ ...prev, ...p }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      setSaving(true);
      const created = await employerService.createJob(form);
      toast.success("Draft created");
      navigate(`/employer/jobs/edit/${created.id}`);
    } catch (err) {
      toast.error("Failed to create job", { description: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/employer/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to jobs
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Create job posting</h1>
        <p className="text-muted-foreground">Saved as draft until you publish.</p>
      </div>

      <JobPostingAiAssist onApply={patch} defaultLocation={companyLocation} />

      <JobPostingForm
        value={form}
        onChange={patch}
        onSubmit={handleSubmit}
        submitLabel={saving ? "Saving…" : "Save draft"}
        isSubmitting={saving}
      />
    </div>
  );
}
