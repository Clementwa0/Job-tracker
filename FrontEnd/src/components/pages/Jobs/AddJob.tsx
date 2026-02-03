import { useState } from "react";
import {
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Link as LinkIcon,
  FileText,
  Save,
  Contact2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FileUpload from "./FileUpload";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { jobTypes, sources, statuses } from "@/constants";
import { FormField } from "@/components/ui/formfield";
import { useJobs } from "@/hooks/JobContext";
import API from "@/lib/axios";

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
  interviews: Interview[];
}

interface Interview {
  date: string;
  notes: string;
  type: string;
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
    interviews: [],
  });

  const [pastedDescription, setPastedDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: "resumeFile", file: File | null) => {
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

  const addInterview = () => {
    setFormData((prev) => ({
      ...prev,
      interviews: [...prev.interviews, { date: today, type: "", notes: "" }],
    }));
  };

  const removeInterview = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interviews: prev.interviews.filter((_, i) => i !== index),
    }));
  };

  const updateInterview = (index: number, field: keyof Interview, value: string) => {
    const updated = [...formData.interviews];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, interviews: updated }));
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
        source: formData.source,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        jobPostingUrl: formData.jobPostingUrl,
        notes: formData.notes,
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
        interviews: [],
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
    <div className="flex flex-col bg-background px-3 sm:px-6 py-4 sm:py-8 min-h-[100vh]">
      <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">

        {/* Job Description Analyzer */}
        <Card className="shadow-sm sm:shadow-md">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analyze Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Paste Job Description"
              value={pastedDescription}
              onChange={(e) => setPastedDescription(e.target.value)}
              textarea
              placeholder="Paste any job description here..."
            />
            <Button
              onClick={analyzeDescription}
              disabled={isAnalyzing || !pastedDescription}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? "Analyzing..." : "Auto-Fill"}
            </Button>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            {/* Job Details Card */}
            <Card className="shadow-sm sm:shadow-md">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="space-y-4">
                  <FormField
                    label="Job Title"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                  <FormField
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="e.g. Google"
                    required
                  />
                </div>

                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <FormField
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Country"
                    icon={MapPin}
                  />
                  <div>
                    <Label className="text-sm font-medium">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) => handleInputChange("jobType", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <FormField
                    label="Application Date"
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => handleInputChange("applicationDate", e.target.value)}
                  />
                  <FormField
                    label="Application Deadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange("applicationDeadline", e.target.value)}
                  />
                </div>

                <Separator className="my-4 sm:my-6" />

                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <div>
                    <Label className="text-sm font-medium">Source</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => handleInputChange("source", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Where did you find it?" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Application Status</Label>
                    <Select
                      value={formData.applicationStatus}
                      onValueChange={(value) => handleInputChange("applicationStatus", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <FormField
                  label="Job Posting URL"
                  value={formData.jobPostingUrl}
                  onChange={(e) => handleInputChange("jobPostingUrl", e.target.value)}
                  placeholder="https://..."
                  icon={LinkIcon}
                />
              </CardContent>
            </Card>

            {/* Documents & Notes Card */}
            <Card className="shadow-sm sm:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Contact Info */}
                <div className="space-y-3">
                  <FormField
                    label="Contact Person"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    icon={Contact2}
                  />
                  <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                    <FormField
                      label="Email"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      icon={Mail}
                    />
                    <FormField
                      label="Phone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      icon={Phone}
                    />
                  </div>
                </div>

                <Separator className="my-4 sm:my-6" />

                {/* File Upload */}
                <FileUpload
                  label="Resume Used"
                  accept=".pdf,.doc,.docx"
                  value={formData.resumeFile}
                  onChange={(file) => handleFileChange("resumeFile", file)}
                />

                <FormField
                  label="Salary Range"
                  value={formData.salaryRange}
                  onChange={(e) => handleInputChange("salaryRange", e.target.value)}
                  placeholder="e.g. $80,000 - $100,000"
                />

                <FormField
                  label="Notes / Journal"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  textarea
                />

                <Separator className="my-4 sm:my-6" />

                {/* Interviews */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Interview Schedule</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addInterview}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Interview</span>
                    </Button>
                  </div>

                  {formData.interviews.map((interview, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-sm">Interview {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInterview(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                          <FormField
                            label="Interview Date"
                            type="date"
                            value={interview.date}
                            onChange={(e) => updateInterview(index, "date", e.target.value)}
                          />
                          <FormField
                            label="Interview Type"
                            value={interview.type}
                            onChange={(e) => updateInterview(index, "type", e.target.value)}
                            placeholder="e.g. Technical"
                          />
                        </div>
                        <FormField
                          label="Notes"
                          value={interview.notes}
                          onChange={(e) => updateInterview(index, "notes", e.target.value)}
                          placeholder="Interview notes..."
                          textarea
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="pt-4 sm:pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Save className="h-5 w-5" />
                    {isSubmitting ? "Adding Application..." : "Add Application"}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
