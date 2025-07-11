import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Save,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
  FileText,
  Clock,
  User,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/ui/formfield";
import { useJobs } from "@/hooks/JobContext";
import { jobTypes, statuses, sources } from "@/constants";
import FileUpload from "@/components/pages/Jobs/FileUpload";

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, updateJob } = useJobs();

  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const jobToEdit = jobs.find((j) => j.id === id);
    if (jobToEdit) setFormData(jobToEdit);
  }, [id, jobs]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company) {
      toast.error("Missing required fields");
      return;
    }
    setIsSaving(true);
    try {
      await updateJob(id!, formData);
      toast.success("Job updated successfully!");
      navigate("/jobs");
    } catch (err) {
      toast.error("Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="mx-auto">
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-lg bg-[--card] text-[--card-foreground]">
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-[--foreground] flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Job Title *"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Software Engineer"
              />
              <FormField
                label="Company Name *"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="e.g. Google"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, Country"
                icon={MapPin}
              />
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) => handleChange("jobType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormField
                label="Application Date"
                type="date"
                value={formData.applicationDate}
                onChange={(e) =>
                  handleChange("applicationDate", e.target.value)
                } 
                icon={Calendar}
              />
              <FormField
                label="Application Deadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) =>
                  handleChange("applicationDeadline", e.target.value)
                } 
                icon={Calendar}
              />
            </div>
            <Separator />
            <h3 className="text-lg font-semibold text-[--foreground] flex items-center gap-2">
              <FileText className="h-4 w-4" /> Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleChange("source", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where did you find it?" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where did you find it?" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(({id,name}) => (
                      <SelectItem key={id} value={name}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FormField
              label="Job Posting URL"
              value={formData.jobPostingUrl || ""}
              onChange={(e) => handleChange("jobPostingUrl", e.target.value)}
              placeholder="https://..."
              icon={LinkIcon}
            />
            <Separator />
            <h3 className="text-lg font-semibold text-[--foreground] flex items-center gap-2">
              <User className="h-4 w-4" /> Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Contact Person"
                value={formData.contactPerson || ""}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
              />
              <FormField
                label="Email"
                type="email"
                value={formData.contactEmail || ""}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                icon={Mail}
              />
              <FormField
                label="Phone"
                type="tel"
                value={formData.contactPhone || ""}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                icon={Phone}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-[--card] text-[--card-foreground]">
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-[--foreground] flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documents & Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="Resume Used"
                accept=".pdf,.doc,.docx"
                value={formData.resumeFile}
                onChange={(file) => handleChange("resumeFile", file)}
              />
              <FileUpload
                label="Cover Letter (Optional)"
                accept=".pdf,.doc,.docx"
                value={formData.coverLetterFile}
                onChange={(file) => handleChange("coverLetterFile", file)}
              />
            </div>
            <FormField
              label="Salary Range"
              value={formData.salaryRange || ""}
              onChange={(e) => handleChange("salaryRange", e.target.value)}
              placeholder="e.g. Kes 80,000 - Kes 100,000"
            />
            <FormField
              label="Next Steps / Reminder"
              type="date"
              value={formData.nextStepsDate || ""}
              onChange={(e) => handleChange("nextStepsDate", e.target.value)}
              icon={Clock}
            />
            <FormField
              label="Notes / Journal"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              textarea
            />
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 text-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-5 w-5" />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditJob;
