import React, { useState } from 'react';
import API from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, Star, Copy, CheckCircle2, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CVFeedback {
  formatting_and_structure: string;
  grammar_and_clarity: string;
  skills_match: string;
  achievements_and_impact: string;
  ats_compatibility: string;
  ats_score: number;
  recommended_jobs: string;
}

const CVReview: React.FC = () => {
  const [cvText, setCvText] = useState('');
  const [feedback, setFeedback] = useState<CVFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvText.trim()) {
      toast({
        title: "CV Text Required",
        description: "Please paste your CV text before submitting.",
      });
      return;
    }

    if (cvText.length < 50) {
      toast({
        title: "CV Too Short",
        description: "CV must be at least 50 characters long.",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/cv', { cvText });
      const data: CVFeedback = response.data;

      // Validate response
      const requiredFields = [
        'formatting_and_structure',
        'grammar_and_clarity',
        'skills_match',
        'achievements_and_impact',
        'ats_compatibility',
        'ats_score',
        'recommended_jobs',
      ];

      for (const field of requiredFields) {
        if (!(field in data)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      setFeedback(data);
      toast({
        title: "CV Analysis Complete!",
        description: "Your CV has been successfully analyzed.",
      });

    } catch (err: any) {
      console.error('CV analysis error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze CV');
      toast({
        title: "Analysis Failed",
        description: err.response?.data?.error || err.message || 'Failed to analyze CV',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', className: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 75) return { label: 'Good', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 60) return { label: 'Average', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Needs Work', className: 'bg-red-100 text-red-800 border-red-200' };
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const copyFeedback = async () => {
    if (!feedback) return;

    const feedbackText = `CV Review Results:

ATS Score: ${feedback.ats_score}/100

Formatting & Structure:
${feedback.formatting_and_structure}

Grammar & Clarity:
${feedback.grammar_and_clarity}

Skills Match:
${feedback.skills_match}

Achievements & Impact:
${feedback.achievements_and_impact}

ATS Compatibility:
${feedback.ats_compatibility}

Recommended Jobs:
${feedback.recommended_jobs}`;

    try {
      await navigator.clipboard.writeText(feedbackText);
      setCopied(true);
      toast({ title: "Feedback Copied!", description: "CV feedback has been copied to your clipboard." });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy feedback. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setCvText('');
    setFeedback(null);
    setError(null);
  };
  const renderFeedbackContent = (content: unknown) => {
  if (typeof content === 'string') {
    return content.split('\n').map((line, index) => (
      <p key={index} className="text-sm leading-relaxed">
        {line}
      </p>
    ));
  } else if (Array.isArray(content)) {
    return content.map((line, index) => (
      <p key={index} className="text-sm leading-relaxed">
        {typeof line === 'string' ? line : JSON.stringify(line)}
      </p>
    ));
  } else {
    return <p className="text-sm text-muted-foreground">No feedback available.</p>;
  }
};

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-2">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get professional AI-powered feedback on your CV to improve your chances of landing your dream job.
          </p>
        </div>

        {/* CV Input Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary/6 to-blue-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              Paste Your CV Text
            </CardTitle>
            <CardDescription>
              Copy and paste your CV content below for AI analysis (minimum 50 characters, maximum 5000 characters).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste your CV content here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value.slice(0, 5000))}
                  className="max-h-[300px] min-h-[300px] resize-none border-muted-foreground/20 focus:border-primary/50"
                  disabled={loading}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className={`${cvText.length < 50 ? 'text-amber-600' : 'text-green-600'}`}>
                    Characters: {cvText.length}/5000
                  </span>
                  <span>Minimum: 50 characters</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || cvText.length < 50}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing CV...
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Analyze CV
                    </>
                  )}
                </Button>
                {feedback && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {feedback && (
          <div className="space-y-6">
            {/* ATS Score */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Star className="h-5 w-5" />
                    ATS Compatibility Score
                  </CardTitle>
                  <Button onClick={copyFeedback} variant="outline" size="sm">
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? 'Copied!' : 'Copy All Feedback'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center">
                    <div className={`text-6xl font-bold ${getScoreColor(feedback.ats_score)}`}>
                      {feedback.ats_score}
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                    <Badge className={`mt-2 text-sm font-medium py-1 px-3 ${getScoreBadge(feedback.ats_score).className}`}>
                      {getScoreBadge(feedback.ats_score).label}
                    </Badge>
                  </div>
                  <div className="w-full max-w-md mx-auto space-y-2">
                    <Progress value={feedback.ats_score} className={`h-3 ${getProgressColor(feedback.ats_score)}`} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>50</span>
                      <span>75</span>
                      <span>90</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-sky-900 to-gray-950 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Briefcase className="h-6 w-6" />
                  Recommended Jobs for Your Profile
                </CardTitle>
                <CardDescription>
                  Based on your CV analysis, here are the best job matches for your skills and experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {feedback.recommended_jobs.split('\n')
                    .filter(job => job.trim())
                    .map((job, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg bg-white border border-primary/10  dark:bg-gray-800 hover:border-primary/30 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                        <p className="text-sm leading-relaxed text-gray-900 dark:text-white font-medium">{job.replace('• ', '').trim()}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Sections */}
            <Tabs defaultValue="formatting" className="w-full">
              <TabsList className="grid dark:bg-gray-800 sm:grid-cols-5 md:grid-cols-5 mb-6">
                <TabsTrigger value="formatting">Formatting</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              </TabsList>

              <TabsContent value="formatting">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Formatting & Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      {renderFeedbackContent(feedback.formatting_and_structure)}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grammar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Grammar & Clarity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      {renderFeedbackContent(feedback.grammar_and_clarity)}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Skills Match
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      {renderFeedbackContent(feedback.skills_match)}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Achievements & Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      {renderFeedbackContent(feedback.achievements_and_impact)}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compatibility">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      ATS Compatibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                      {renderFeedbackContent(feedback.ats_compatibility)}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/10 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CVReview;