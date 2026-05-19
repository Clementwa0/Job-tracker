// Landing Page
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
export { default as Calendar } from './pages/Calendar/Calendar';
export { default as Analytics } from './pages/Analytics/Analytics';
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

// cv-review
export {default as ActionsPanel } from '@/features/cvReview/ActionsPanel'
export {default as FeedbackTabs} from '@/features/cvReview/FeedbackTabs'
export {default as QuickTips } from '@/features/cvReview/QuickTips';
export {default as ScoreOverview} from '@/features/cvReview/ScoreOverview';
export {default as UploadSection} from '@/features/cvReview/UploadSection';
export {default as RecommendedJobs} from '@/features/cvReview/RecommendedJobs';
export {default as CvReview} from '@/pages/cvreview/cvReview';