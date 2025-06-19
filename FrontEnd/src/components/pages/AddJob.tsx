import { useState } from "react";
import {
  Calendar,
  MapPin,
  Briefcase,
  User,
  Mail,
  Phone,
  Link,
  FileText,
  Clock,
  Save,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface JobApplication {
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  applicationDate: string;
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
  const [formData, setFormData] = useState<JobApplication>({
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "",
    applicationDate: new Date().toISOString().split("T")[0],
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

  const [applications, setApplications] = useState<JobApplication[]>([]);

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (
    field: "resumeFile" | "coverLetterFile",
    file: File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.companyName) {
      toast.error("Missing Required Fields", {
        description: "Please fill in Job Title and Company Name.",
      });
      return;
    }

    // Prepare form data for sending (handle files if needed)
    const dataToSend = { ...formData };
    // If you want to send files, use FormData and multipart/form-data

    try {
      const response = await fetch('http://localhost:3000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Application Added!", {
          description: `Successfully added application for ${formData.jobTitle} at ${formData.companyName}.`,
        });
        setFormData({
          jobTitle: "",
          companyName: "",
          location: "",
          jobType: "",
          applicationDate: new Date().toISOString().split("T")[0],
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
      } else {
        toast.error("Failed to add application", {
          description: result.message || "Unknown error",
        });
      }
    } catch (error: any) {
      toast.error("Network error", {
        description: error.message,
      });
    }
  };

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Remote",
  ];
  const sources = [
    "LinkedIn",
    "Indeed",
    "Company Website",
    "Referral",
    "Glassdoor",
    "AngelList",
    "Other",
  ];
  const statuses = [
    "Applied",
    "Interviewing",
    "Offer",
    "Rejected",
    "Waiting Response",
  ];

  return (
    <div className="h-screen mx-auto">
      <Card className="h-5 mb-1 justify-center">
        <CardHeader >
        <CardTitle className="flex items-center">
         <Plus className="h-5 w-5" />
            Add New Application
          </CardTitle>
          </CardHeader>
      </Card>
      <div>
        <form
          onSubmit={handleSubmit}
          className="sm:grid-cols-1 gap-2  md:grid  md:grid-cols-2 gap-4"
        >
          <div>
            <Card className="shadow-lg">
              <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Job Title *
                    </label>
                    <Input
                      placeholder="e.g. Software Engineer"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        handleInputChange("jobTitle", e.target.value)
                      }
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Company Name *
                    </label>
                    <Input
                      placeholder="e.g. Google"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="City, Country or Remote"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Job Type
                    </label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) =>
                        handleInputChange("jobType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Application Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={formData.applicationDate}
                        onChange={(e) =>
                          handleInputChange("applicationDate", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Application Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Application Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Source
                    </label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) =>
                        handleInputChange("source", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Where did you find this job?" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Application Status
                    </label>
                    <Select
                      value={formData.applicationStatus}
                      onValueChange={(value) =>
                        handleInputChange("applicationStatus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Job Posting URL
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={formData.jobPostingUrl}
                      onChange={(e) =>
                        handleInputChange("jobPostingUrl", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                   <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Contact Person</label>
                      <Input
                        placeholder="Recruiter or hiring manager"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="contact@company.com"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="shadow-lg">
              <CardContent>
                {/* Files and Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents & Additional Info
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUpload
                      label="Resume Used"
                      accept=".pdf,.doc,.docx"
                      value={formData.resumeFile}
                      onChange={(file) => handleFileChange('resumeFile', file)}
                    />

                    <FileUpload
                      label="Cover Letter (Optional)"
                      accept=".pdf,.doc,.docx"
                      value={formData.coverLetterFile}
                      onChange={(file) => handleFileChange('coverLetterFile', file)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Salary Range</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. Kes 80,000 - Kes 100,000"
                          value={formData.salaryRange}
                          onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Next Steps / Reminder Date</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={formData.nextStepsDate}
                          onChange={(e) => handleInputChange('nextStepsDate', e.target.value)}
                          className="flex justify-end"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes / Journal</label>
                    <Textarea
                      placeholder="Personal notes about the job, interview process, company culture, etc..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Add Application
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

