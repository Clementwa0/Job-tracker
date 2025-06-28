// src/pages/EditJob.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Calendar, MapPin, Phone, Mail, Link as LinkIcon, FileText, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/ui/formfield';
import { useJobs } from '@/hooks/JobContext';
import { jobTypes, statuses, sources } from '@/constants';
import FileUpload from '@/components/pages/Jobs/FileUpload';

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
      toast.error('Missing required fields');
      return;
    }
    setIsSaving(true);
    try {
      await updateJob(id!, formData);
      toast.success('Job updated successfully!');
      navigate('/jobs');
    } catch (err) {
      toast.error('Failed to update job');
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) return <div className="text-center py-10">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto animate-fade-in">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="pb-0">
          <h2 className="text-2xl font-bold text-gray-800">Edit Job Application</h2>
          <p className="text-sm text-gray-500 mt-1">Update your job application details</p>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          {/* Basic Information Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Job Title *" 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)}
              />
              <FormField 
                label="Company Name *" 
                value={formData.company} 
                onChange={(e) => handleChange('company', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField 
                label="Location" 
                value={formData.location} 
                onChange={(e) => handleChange('location', e.target.value)} 
                icon={MapPin}
              />
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Job Type</Label>
                <Select value={formData.jobType} onValueChange={(value) => handleChange('jobType', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((t) => (
                      <SelectItem key={t} value={t} className="py-3">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormField 
                label="Application Date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => handleChange('date', e.target.value)} 
                icon={Calendar}
              />
            </div>
          </section>

          <Separator className="my-4" />

          {/* Status Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">Status & Source</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s} className="py-3">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Source</Label>
                <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => (
                      <SelectItem key={s} value={s} className="py-3">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <FormField 
              label="Job Posting URL" 
              value={formData.jobPostingUrl || ''} 
              onChange={(e) => handleChange('jobPostingUrl', e.target.value)} 
              icon={LinkIcon}
              placeholder="https://example.com/job-posting"
            />
          </section>

          <Separator className="my-4" />

          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField 
                label="Contact Person" 
                value={formData.contactPerson || ''} 
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder="Name"
              />
              <FormField 
                label="Email" 
                type="email" 
                value={formData.contactEmail || ''} 
                onChange={(e) => handleChange('contactEmail', e.target.value)} 
                icon={Mail}
                placeholder="contact@company.com"
              />
              <FormField 
                label="Phone" 
                type="tel" 
                value={formData.contactPhone || ''} 
                onChange={(e) => handleChange('contactPhone', e.target.value)} 
                icon={Phone}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </section>

          <Separator className="my-4" />

          {/* Documents & Notes */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" /> Documents & Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload 
                label="Resume Used" 
                accept=".pdf,.doc,.docx" 
                value={formData.resumeFile} 
                onChange={(file) => handleChange('resumeFile', file)}
              />
              <FileUpload 
                label="Cover Letter (Optional)" 
                accept=".pdf,.doc,.docx" 
                value={formData.coverLetterFile} 
                onChange={(file) => handleChange('coverLetterFile', file)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label="Salary Range" 
                value={formData.salaryRange || ''} 
                onChange={(e) => handleChange('salaryRange', e.target.value)} 
                placeholder="e.g. Kes 80,000 - Kes 100,000"
              />
              <FormField 
                label="Next Steps / Reminder" 
                type="date" 
                value={formData.nextStepsDate || ''} 
                onChange={(e) => handleChange('nextStepsDate', e.target.value)} 
                icon={Clock}
              />
            </div>
            
            <FormField 
              label="Notes / Journal" 
              value={formData.notes || ''} 
              onChange={(e) => handleChange('notes', e.target.value)} 
              textarea
              placeholder="Add your notes about this application..."
            />
          </section>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg transition-all"
            >
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default EditJob;