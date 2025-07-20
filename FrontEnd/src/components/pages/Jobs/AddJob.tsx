import { useState } from "react";
import {
  MapPin,
  Briefcase,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
  FileText,
  Save,
  Contact2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FileUpload from "./FileUpload";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { jobTypes, sources, statuses } from "@/constants";
import { FormField } from "@/components/ui/formfield";
import { useJobs } from "@/hooks/JobContext";
import API from "@/lib/axios"

interface JobApplication {
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  applicationDate: string;
  applicationDeadline: string;
  source: string;
  applicationStatus: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  resumeFile: File | null;
  coverLetterFile: File | null;
  jobPostingUrl: string;
  salaryRange: string;
  notes: string;
  nextStepsDate: string;
}

const AddJob = () => {
  const { addJob } = useJobs();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<JobApplication>({
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "",
    applicationDate: today,
    applicationDeadline: today,
    source: "",
    applicationStatus: "Applied",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    resumeFile: null,
    coverLetterFile: null,
    jobPostingUrl: "",
    salaryRange: "",
    notes: "",
    nextStepsDate: "",
  });

  const [pastedDescription, setPastedDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    field: "resumeFile" | "coverLetterFile",
    file: File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const analyzeDescription = async () => {
  if (!pastedDescription.trim()) return;
  setIsAnalyzing(true);
  try {
    const res = await API.post("/analyze-job", { description: pastedDescription });
    setFormData((prev) => ({ ...prev, ...res.data }));
    toast.success("Fields auto-filled from job description!");
  } catch (err: any) {
    toast.error("Failed to analyze", { description: err.response?.data?.message || err.message });
  } finally {
    setIsAnalyzing(false);
  }
};
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.companyName) {
      toast.error("Missing Required Fields", {
        description: "Please fill in Job Title and Company Name.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addJob({
        title: formData.jobTitle,
        company: formData.companyName,
        location: formData.location,
        jobType: formData.jobType,
        applicationDate: formData.applicationDate,
        applicationDeadline: formData.applicationDeadline,
        status: formData.applicationStatus.toLowerCase(),
        salaryRange: formData.salaryRange,
        resumeFile: null,
        coverLetterFile: null,
        source: formData.source,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        jobPostingUrl: formData.jobPostingUrl,
        notes: formData.notes,
        nextStepsDate: formData.nextStepsDate,
        interviews: [],
      });
      toast.success("Job Saved Successfully!", {
        description: `${formData.jobTitle} at ${formData.companyName} has been saved.`,
      });
      setFormData({
        jobTitle: "",
        companyName: "",
        location: "",
        jobType: "",
        applicationDate: today,
        applicationDeadline: today,
        source: "",
        applicationStatus: "Applied",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        resumeFile: null,
        coverLetterFile: null,
        jobPostingUrl: "",
        salaryRange: "",
        notes: "",
        nextStepsDate: "",
      });
      setPastedDescription("");
    } catch (error: any) {
      toast.error("Failed to add job", {
        description: error.message || "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto bg-white dark:bg-gray-900 px-2 py-6 transition-colors duration-300 min-h-screen flex flex-col gap-8">
      <Card className="shadow-lg bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Analyze Job Description</h3>
          <div>
            <FormField
              label="Paste Job Description"
              value={pastedDescription}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => setPastedDescription(e.target.value)}
              textarea
              placeholder="Paste any job description here..."
            />
          </div>
          <Button
            onClick={analyzeDescription}
            disabled={isAnalyzing || !pastedDescription}
          >
            {isAnalyzing ? "Analyzing..." : "Auto-Fill From Description"}
          </Button>
        </CardContent>
      </Card>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 pb-10">
        <Card className="shadow-lg bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Job Title *"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="e.g. Software Engineer"
              />
              <FormField
                label="Company Name *"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder="e.g. Google"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
                icon={MapPin}
              />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Type</Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) => handleInputChange("jobType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900">
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
                  handleInputChange("applicationDate", e.target.value)
                }
              />
              <FormField
                label="Application Deadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) =>
                  handleInputChange("applicationDeadline", e.target.value)
                }
              />
            </div>

            <Separator />

            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleInputChange("source", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where did you find it?" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900">
                    {sources.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Application Status</Label>
                <Select
                  value={formData.applicationStatus}
                  onValueChange={(value) =>
                    handleInputChange("applicationStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900">
                    {statuses.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <FormField
              label="Job Posting URL"
              value={formData.jobPostingUrl}
              onChange={(e) =>
                handleInputChange("jobPostingUrl", e.target.value)
              }
              placeholder="https://..."
              icon={LinkIcon}
            />

            <Separator />

            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                icon={Contact2}
              />
              <FormField
                label="Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  handleInputChange("contactEmail", e.target.value)
                }
                icon={Mail}
              />
              <FormField
                label="Phone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  handleInputChange("contactPhone", e.target.value)
                }
                icon={Phone}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents & Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="Resume Used"
                accept=".pdf,.doc,.docx"
                value={formData.resumeFile}
                onChange={(file) => handleFileChange("resumeFile", file)}
              />
              <FileUpload
                label="Cover Letter (Optional)"
                accept=".pdf,.doc,.docx"
                value={formData.coverLetterFile}
                onChange={(file) => handleFileChange("coverLetterFile", file)}
              />
            </div>
            <FormField
              label="Salary Range"
              value={formData.salaryRange}
              onChange={(e) => handleInputChange("salaryRange", e.target.value)}
              placeholder="e.g. Kes 80,000 - Kes 100,000"
            />
            <FormField
              label="Next Steps / Reminder"
              type="date"
              value={formData.nextStepsDate}
              onChange={(e) =>
                handleInputChange("nextStepsDate", e.target.value)
              }
            />
            <FormField
              label="Notes / Journal"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              textarea
            />
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? "Adding Application..." : "Add Application"}
              </Button>
            </div>
          </CardContent>
        </Card>{" "}
      </form>
    </div>
  );
};

export default AddJob;
