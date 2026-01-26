import React, { useState, useCallback, useMemo } from 'react';
import API from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  FileText, 
  Star, 
  Copy, 
  CheckCircle2, 
  Briefcase, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  File,
  X
} from 'lucide-react';
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

interface ScoreMetrics {
  color: string;
  label: string;
  badgeClass: string;
  progressClass: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content?: string;
}

const MIN_CV_LENGTH = 50;
const MAX_CV_LENGTH = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const CVReview: React.FC = () => {
  const [cvText, setCvText] = useState('');
  const [feedback, setFeedback] = useState<CVFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('formatting');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getScoreMetrics = useCallback((score: number): ScoreMetrics => {
    if (score >= 90) return {
      color: 'text-green-600',
      label: 'Excellent',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
      progressClass: 'bg-green-500'
    };
    if (score >= 75) return {
      color: 'text-blue-600',
      label: 'Good',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      progressClass: 'bg-blue-500'
    };
    if (score >= 60) return {
      color: 'text-yellow-600',
      label: 'Average',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      progressClass: 'bg-yellow-500'
    };
    return {
      color: 'text-red-600',
      label: 'Needs Work',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      progressClass: 'bg-red-500'
    };
  }, []);

  const isValidCV = useMemo(() => {
    const trimmedText = cvText.trim();
    return trimmedText.length >= MIN_CV_LENGTH && trimmedText.length <= MAX_CV_LENGTH;
  }, [cvText]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, MAX_CV_LENGTH);
    setCvText(text);
    if (uploadedFile) {
      setUploadedFile(null);
    }
  }, [uploadedFile]);

  const parsePDFFile = async (file: File): Promise<string> => {
    // 这里需要实现PDF解析逻辑
    // 实际项目中你可能需要使用像pdf-parse、pdf.js或发送到后端解析
    // 这里只是一个示例，实际使用时需要替换为真实的PDF解析逻辑
    
    // 示例：使用FileReader读取为文本（仅对文本PDF有效）
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // 这里可以添加更复杂的PDF文本提取逻辑
        resolve(text || '');
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsText(file);
    });
  };

  const parseDOCXFile = async (file: File): Promise<string> => {
    // DOCX解析通常需要后端处理或使用专门的库
    // 这里返回一个占位符，实际项目中需要实现
    return new Promise((resolve) => {
      // 对于演示，我们假设用户上传了文本文件
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      });
      return;
    }

    // 验证文件类型
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOC, DOCX, or TXT files only.",
      });
      return;
    }

    setParsingFile(true);
    setError(null);

    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await parsePDFFile(file);
      } else if (file.type.includes('word') || file.type.includes('document')) {
        text = await parseDOCXFile(file);
      } else if (file.type === 'text/plain') {
        text = await file.text();
      }

      // 清理文本，移除多余的空格和换行
      const cleanedText = text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      if (cleanedText.length < MIN_CV_LENGTH) {
        throw new Error('File does not contain enough text. Please ensure it contains CV content.');
      }

      setCvText(cleanedText.slice(0, MAX_CV_LENGTH));
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });

      toast({
        title: "✅ File Uploaded",
        description: `${file.name} has been successfully loaded.`,
      });

    } catch (err: any) {
      console.error('File parsing error:', err);
      toast({
        title: "Parsing Failed",
        description: err.message || 'Failed to parse file. Please try again or paste text directly.',
      });
    } finally {
      setParsingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null);
    setCvText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidCV) {
      toast({
        title: "Invalid CV",
        description: `CV must be between ${MIN_CV_LENGTH} and ${MAX_CV_LENGTH} characters.`,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post<CVFeedback>('/cv', { cvText: cvText.trim() });
      const data = response.data;

      // Validate response structure
      const requiredFields: (keyof CVFeedback)[] = [
        'formatting_and_structure',
        'grammar_and_clarity',
        'skills_match',
        'achievements_and_impact',
        'ats_compatibility',
        'ats_score',
        'recommended_jobs',
      ];

      const missingFields = requiredFields.filter(field => !(field in data));
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }

      if (typeof data.ats_score !== 'number' || data.ats_score < 0 || data.ats_score > 100) {
        throw new Error('Invalid ATS score received');
      }

      setFeedback(data);
      toast({
        title: "✅ CV Analysis Complete!",
        description: "Your CV has been successfully analyzed.",
      });

    } catch (err: any) {
      console.error('CV analysis error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze CV';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyFeedback = useCallback(async () => {
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
      toast({ 
        title: "📋 Feedback Copied!", 
        description: "CV feedback has been copied to your clipboard." 
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy feedback. Please try again.",
      });
    }
  }, [feedback]);

  const resetForm = useCallback(() => {
    setCvText('');
    setFeedback(null);
    setError(null);
    setActiveTab('formatting');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const renderFeedbackContent = useCallback((content: string) => {
    if (!content.trim()) {
      return <p className="text-sm text-muted-foreground italic">No feedback available.</p>;
    }

    return content.split('\n').filter(line => line.trim()).map((line, index) => (
      <div key={index} className="flex items-start gap-2 py-1">
        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm leading-relaxed">{line.trim()}</p>
      </div>
    ));
  }, []);

  const renderRecommendedJobs = useMemo(() => {
    if (!feedback?.recommended_jobs) return null;
    
    const jobs = feedback.recommended_jobs
      .split('\n')
      .filter(job => job.trim())
      .map(job => job.replace(/^[•\-*\s]+/, '').trim());

    if (jobs.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-4">
          No specific job recommendations available.
        </p>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 
                       border border-primary/10 hover:border-primary/30 transition-all 
                       duration-200 hover:shadow-sm backdrop-blur-sm"
          >
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 font-medium">
              {job}
            </p>
          </div>
        ))}
      </div>
    );
  }, [feedback?.recommended_jobs]);

  const scoreMetrics = useMemo(() => 
    feedback ? getScoreMetrics(feedback.ats_score) : null, 
    [feedback, getScoreMetrics]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI CV Review
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get professional AI-powered feedback to optimize your CV and land your dream job.
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* CV Input Section */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-100/50 dark:from-primary/20 dark:to-blue-900/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-primary">
                <FileText className="h-6 w-6" />
                Upload or Paste Your CV
              </CardTitle>
              <CardDescription>
                Upload a PDF, DOC, DOCX, or TXT file, or paste your CV content directly ({MIN_CV_LENGTH}-{MAX_CV_LENGTH} characters).
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label htmlFor="cv-upload" className="text-base font-medium">
                    Upload CV File
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        id="cv-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={handleFileUpload}
                        disabled={loading || parsingFile}
                        ref={fileInputRef}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Supported formats: PDF, DOC, DOCX, TXT (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted-foreground/30"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white dark:bg-gray-800 px-4 text-sm text-muted-foreground">
                          OR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Input Section */}
                <div className="space-y-3">
                  <Label htmlFor="cv-text" className="text-base font-medium">
                    Paste CV Text Directly
                  </Label>
                  <Textarea
                    id="cv-text"
                    placeholder="Paste your CV content here..."
                    value={cvText}
                    onChange={handleTextChange}
                    className="min-h-[250px] max-h-[350px] resize-y border-2 
                             border-muted-foreground/20 focus:border-primary/50 
                             focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={loading || parsingFile}
                    aria-label="CV text input"
                  />
                  
                  {/* Uploaded File Info */}
                  {uploadedFile && (
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeUploadedFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Character Count */}
                  <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                    <span className={`font-medium ${!isValidCV ? 'text-amber-600' : 'text-green-600'}`}>
                      {cvText.length}/{MAX_CV_LENGTH} characters
                    </span>
                    <div className="flex items-center gap-2">
                      {parsingFile && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-muted-foreground">Parsing file...</span>
                        </div>
                      )}
                      {!parsingFile && !isValidCV && cvText.length > 0 && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-muted-foreground">
                        {isValidCV ? '✓ Ready to analyze' : `Minimum ${MIN_CV_LENGTH} characters`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    className="flex-1 min-w-[200px]"
                    disabled={loading || parsingFile || !isValidCV}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing CV...
                      </>
                    ) : parsingFile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Parsing File...
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
                      className="min-w-[120px]"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {feedback && (
            <section className="space-y-6 animate-in fade-in duration-500">
              {/* ATS Score Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 
                             dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Star className="h-7 w-7 text-primary" />
                      <span>ATS Compatibility Score</span>
                    </CardTitle>
                    <Button 
                      onClick={copyFeedback} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy All Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="flex flex-col items-center">
                        <div className={`text-7xl font-bold ${scoreMetrics?.color}`}>
                          {feedback.ats_score}
                          <span className="text-3xl text-muted-foreground">/100</span>
                        </div>
                        <Badge className={`mt-3 text-base font-semibold py-1.5 px-4 
                                        ${scoreMetrics?.badgeClass}`}>
                          {scoreMetrics?.label}
                        </Badge>
                      </div>
                      
                      <div className="max-w-md mx-auto space-y-2">
                        <Progress 
                          value={feedback.ats_score} 
                          className={`h-3 ${scoreMetrics?.progressClass}`} 
                        />
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                          {[0, 25, 50, 75, 100].map((value) => (
                            <span key={value}>{value}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Jobs Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-sky-50 to-blue-100 
                             dark:from-sky-900/30 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Recommended Jobs for Your Profile
                  </CardTitle>
                  <CardDescription>
                    Based on your CV analysis, here are the best job matches for your skills and experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRecommendedJobs}
                </CardContent>
              </Card>

              {/* Feedback Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 
                                   bg-muted/50 dark:bg-gray-800/50 p-1">
                  {[
                    { id: 'formatting', label: 'Formatting' },
                    { id: 'grammar', label: 'Grammar' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'achievements', label: 'Achievements' },
                    { id: 'compatibility', label: 'Compatibility' },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {[
                  { id: 'formatting', key: 'formatting_and_structure', label: 'Formatting & Structure' },
                  { id: 'grammar', key: 'grammar_and_clarity', label: 'Grammar & Clarity' },
                  { id: 'skills', key: 'skills_match', label: 'Skills Match' },
                  { id: 'achievements', key: 'achievements_and_impact', label: 'Achievements & Impact' },
                  { id: 'compatibility', key: 'ats_compatibility', label: 'ATS Compatibility' },
                ].map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="animate-in fade-in">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          {tab.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 bg-muted/20 p-4 rounded-lg">
                          {renderFeedbackContent(feedback[tab.key as keyof CVFeedback] as string)}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10 shadow-lg animate-in fade-in">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-destructive">Analysis Error</p>
                    <p className="text-sm text-destructive/90">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default CVReview;