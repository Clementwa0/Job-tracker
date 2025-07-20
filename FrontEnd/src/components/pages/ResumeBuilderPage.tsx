import { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Copy, 
  Edit2, 
  Save, 
  X,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Building,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeFormData {
  fullName: string;
  jobTitle: string;
  skills: string[];
  education: string;
  workExperience: string;
  additionalInfo: string;
  targetCompany: string;
}

interface GeneratedContent {
  cv: string;
  coverLetter: string;
}

const ResumeBuilderPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const [formData, setFormData] = useState<ResumeFormData>({
    fullName: user?.name || '',
    jobTitle: '',
    skills: [],
    education: '',
    workExperience: '',
    additionalInfo: '',
    targetCompany: ''
  });

  const [skillInput, setSkillInput] = useState('');

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle skill input
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !formData.skills.includes(skill)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
        setSkillInput('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(skill => skill !== skillToRemove) 
    }));
  };

  // Generate CV
  const handleGenerateCV = async () => {
    if (!formData.jobTitle || !formData.education || !formData.workExperience) {
      toast({
        title: "Missing Information",
        description: "Please fill in Job Title, Education, and Work Experience fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'cv',
          data: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
      }

      const data = await response.json();
      setGeneratedContent(prev => ({ 
        ...prev, 
        cv: data.cv 
      }));

      toast({
        title: "CV Generated",
        description: "Your professional CV has been generated successfully!",
      });
    } catch (error) {
      console.error('Error generating CV:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate CV. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Cover Letter
  const handleGenerateCoverLetter = async () => {
    if (!formData.jobTitle || !formData.targetCompany) {
      toast({
        title: "Missing Information",
        description: "Please fill in Job Title and Target Company fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'coverLetter',
          data: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter');
      }

      const data = await response.json();
      setGeneratedContent(prev => ({ 
        ...prev, 
        coverLetter: data.coverLetter 
      }));

      toast({
        title: "Cover Letter Generated",
        description: "Your professional cover letter has been generated successfully!",
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} has been copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Download as PDF (placeholder)
  const handleDownloadPDF = (content: string, filename: string) => {
    // This would integrate with a PDF generation library
    toast({
      title: "Download Feature",
      description: "PDF download feature coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              AI Resume Builder
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Generate professional CVs and cover letters using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title / Career Goal</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Backend Developer, Data Scientist"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skillInput">Add Skills</Label>
                  <Input
                    id="skillInput"
                    value={skillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder="Type a skill and press Enter or comma"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Press Enter or comma to add skills
                  </p>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="education">Education Details</Label>
                  <Textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Include your degree, school, graduation year, GPA, relevant coursework, etc."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="workExperience">Work Experience</Label>
                  <Textarea
                    id="workExperience"
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                    placeholder="Include your positions, companies, dates, key achievements, and responsibilities"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Include certifications, awards, languages, hobbies, volunteer work, etc."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Target Company (for Cover Letter)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="targetCompany">Target Company</Label>
                  <Input
                    id="targetCompany"
                    name="targetCompany"
                    value={formData.targetCompany}
                    onChange={handleInputChange}
                    placeholder="Company name for tailored cover letter"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGenerateCV}
                disabled={isLoading}
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate CV
              </Button>
              <Button
                onClick={handleGenerateCoverLetter}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Cover Letter
              </Button>
            </div>
          </div>

          {/* Right Column - Generated Content */}
          <div className="space-y-6">
            {/* CV Preview */}
            {generatedContent?.cv && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generated CV
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(generatedContent.cv, 'CV')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(generatedContent.cv, 'cv.pdf')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedContent.cv}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cover Letter Preview */}
            {generatedContent?.coverLetter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Generated Cover Letter
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(generatedContent.coverLetter, 'Cover Letter')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(generatedContent.coverLetter, 'cover-letter.pdf')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedContent.coverLetter}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!generatedContent?.cv && !generatedContent?.coverLetter && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Generated Content Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Fill out the form on the left and click "Generate CV" or "Generate Cover Letter" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage; 