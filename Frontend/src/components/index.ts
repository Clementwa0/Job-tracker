
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
export { default as Homepage } from './HomePage/Homepage';
export { default as Calendar } from './pages/Calendar/Calendar';
export { default as Analytics } from './pages/Analytics/Analytics';
export { default as Resume } from './pages/AI/Resume';
export { default as Profile } from '@/components/pages/Profile';

// Jobs
export { default as Jobs } from '@/components/pages/Jobs/Jobs';
export { default as AddJob } from '@/components/pages/Jobs/AddJob';
export { default as EditJob } from '@/components/pages/Jobs/EditJob';


// Dashboard Components
export { default as DashboardStats } from '@/features/dashboard/components/DashboardStats';
export { default as RecentApplications } from '@/features/dashboard/components/RecentApplications';
export { default as UpcomingInterviews } from '@/features/dashboard/components/UpcomingInterviews';
export { default as TipCard } from '@/features/dashboard/components/TipCard';
export { default as StatCard } from '@/features/dashboard/components/StatCard';
export { default as DashboardMood } from '@/features/dashboard/components/DashboardMood';
export {default as Dashboard} from '@/pages/Dashboard/Dashboard';