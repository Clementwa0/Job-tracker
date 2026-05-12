import {
  Mail,
  Phone,
  Contact2,
  FileText,
  Save,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/ui/formfield";

import FileUpload from "./FileUpload";
import InterviewSection from "./InterviewSection";

import type { JobApplication, Interview } from "@/types";

interface Props {
  formData: JobApplication;

  handleInputChange: (
    field: keyof JobApplication,
    value: string
  ) => void;

  handleFileChange: (
    field: "resumeFile",
    file: File | null
  ) => void;

  addInterview: () => void;

  removeInterview: (index: number) => void;

  updateInterview: (
    index: number,
    field: keyof Interview,
    value: string
  ) => void;

  isSubmitting: boolean;
}

const DocumentsNotesCard = ({
  formData,
  handleInputChange,
  handleFileChange,
  addInterview,
  removeInterview,
  updateInterview,
  isSubmitting,
}: Props) => {
  return (
    <Card className="shadow-sm sm:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents & Notes
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          <FormField
            label="Contact Person"
            value={formData.contactPerson}
            onChange={(e) =>
              handleInputChange("contactPerson", e.target.value)
            }
            icon={Contact2}
            placeholder="Recruiter or Hiring Manager"
          />

          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <FormField
              label="Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
              icon={Mail}
              placeholder="example@email.com"
            />

            <FormField
              label="Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) =>
                handleInputChange("contactPhone", e.target.value)
              }
              icon={Phone}
              placeholder="+254..."
            />
          </div>
        </div>

        <Separator className="my-4 sm:my-6" />

        {/* Resume Upload */}
        <FileUpload
          label="Resume Used"
          accept=".pdf,.doc,.docx"
          value={formData.resumeFile}
          onChange={(file) =>
            handleFileChange("resumeFile", file)
          }
        />

        {/* Salary Range */}
        <FormField
          label="Salary Range"
          value={formData.salaryRange}
          onChange={(e) =>
            handleInputChange("salaryRange", e.target.value)
          }
          placeholder="e.g. KES 80,000 - 120,000"
        />

        {/* Notes */}
        <FormField
          label="Notes / Journal"
          value={formData.notes}
          onChange={(e) =>
            handleInputChange("notes", e.target.value)
          }
          textarea
          placeholder="Add follow-up notes, impressions, reminders..."
        />

        <Separator className="my-4 sm:my-6" />

        {/* Interview Section */}
        <InterviewSection
          interviews={formData.interviews}
          addInterview={addInterview}
          removeInterview={removeInterview}
          updateInterview={updateInterview}
        />

        {/* Submit Button */}
        <div className="pt-4 sm:pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Save className="h-5 w-5" />

            {isSubmitting
              ? "Adding Application..."
              : "Add Application"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsNotesCard;