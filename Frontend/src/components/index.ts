// Landing Page
export {default as Nav} from '@/features/home/Nav';
export {default as HeroSection} from '@/features/home/HeroSection';
export {default as TypingText} from '@/features/home/TypingText';
export {default as DashboardPreview} from '@/features/home/DashboardPreview';
export {default as CTASection} from '@/features/home/CTASection';
export {default as FeaturesSection} from '@/features/home/FeaturesSection';
export {default as Footer} from '@/features/home/Footer';
export { default as Home } from '@/pages/Home/Home';
// Auth
export { LoginForm } from '@/features/auth/login/LoginForm';
export { RegisterForm } from '@/features/auth/register/RegisterForm';
export { LoginFeatures } from '@/features/auth/login/LoginFeatures';
export { RegisterFeatures } from '@/features/auth/register/RegisterFeatures';

export { default as ForgotPassword } from '@/features/auth/forgetPassword';
export { default as ResetPassword } from '@/features/auth/resetPassword';
export { default as Login } from '@/pages/Auth/Login';
export { default as Register } from '@/pages/Auth/Register';

// Layout & Navigation
export { default as Layout } from './layout/Layout';
export { default as Header } from './layout/Header';
export { ProtectedRoute } from './ProtectedRoute';

// Pages
export { default as Terms } from './pages/Terms'
export { default as Profile } from '@/components/pages/Profile';

// Jobs
export {default as ContactSection } from '@/features/jobs/ContactSection';
export {default as InterviewSection} from '@/features/interviews/InterviewSection';
export {default as JobDescriptionAnalyzer} from '@/features/jobs/JobDescriptionAnalyzer';
export {default as JobDetailsSection} from '@/features/jobs/JobDetailsSection';
export {default as NotesSection} from '@/features/jobs/NotesSection';

export { default as Jobs } from '@/components/pages/Jobs/Jobs';
export { default as AddJob } from '@/pages/jobs/AddJob';
export { default as EditJob } from '@/pages/jobs/EditJob';

export { default as Interviews } from '@/pages/Interviews/Interviews'
// Dashboard Components
export { default as DashboardStats } from '@/features/dashboard/components/DashboardStats';
export { default as RecentApplications } from '@/features/dashboard/components/RecentApplications';
export { default as UpcomingInterviews } from '@/features/dashboard/components/UpcomingInterviews';
export { default as TipCard } from '@/features/dashboard/components/TipCard';
export { default as StatCard } from '@/features/dashboard/components/StatCard';
export { default as DashboardMood } from '@/features/dashboard/components/DashboardMood';
export { default as Dashboard} from '@/pages/Dashboard/Dashboard';

//cvreview
export {ActionsPanel } from '@/features/cvReview/ActionsPanel'
export {FeedbackTabs} from '@/features/cvReview/FeedbackTabs'
export {QuickTips } from '@/features/cvReview/QuickTips';
export {ScoreOverview} from '@/features/cvReview/ScoreOverview';
export {UploadSection} from '@/features/cvReview/UploadSection';
export {RecommendedJobs} from '@/features/cvReview/RecommendedJobs';
export {default as CvReview} from '@/pages/cvreview/cvReview';

//resumes
export { default as ResumesDashboard } from '@/pages/resumeBuilder/ResumesDashboard';
export { default as ResumeBuilder } from '@/pages/resumeBuilder/ResumeBuilder';
export { default as ResumePreview } from '@/features/resume/ResumePreview';
export { default as ResumeToolbar } from '@/features/resume/ResumeToolbar';
export { default as ExperienceEditor } from '@/features/resume/ExperienceEditor';
export { default as SectionCard } from '@/features/resume/SectionCard';

// Calendar
export { default as CalendarLegend } from '@/features/calendar/CalendarLegend';
export { default as AgendaSidebar } from '@/features/calendar/AgendaSidebar';
export { default as EventDetailsDrawer } from '@/features/calendar/EventDetailsDrawer';
export { default as Calendar } from '@/pages/calendar/Calendar';

// Analytics
export { default as AnalyticsHeader } from '@/features/analytics/AnalyticsHeader';
export { default as OverviewCharts } from '@/features/analytics/OverviewCharts';
export { default as TimelineChart } from '@/features/analytics/TimelineChart';
export { default as MetricsGrid } from '@/features/analytics/MetricsGrid';
export {default as CompaniesChart} from '@/features/analytics/CompaniesChart';
export {default as LocationsChart} from '@/features/analytics/LocationsChart';

export { default as TopCompaniesChart } from '@/features/analytics/charts/TopCompaniesChart';
export { default as TopLocationsChart } from '@/features/analytics/charts/TopLocationsChart';

export {default as Analytics } from "@/pages/analytics/Analytics"
export { default as OAuthCallback } from '@/pages/Auth/OAuthCallback';
