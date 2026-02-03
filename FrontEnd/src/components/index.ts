// Auth
export { default as Login } from './Login';
export { default as Register } from './Register';
export { default as ForgotPassword } from '@/components/forgetPassword';
export { default as ResetPassword } from '@/components/resetPassword';

// Layout & Navigation
export { default as Layout } from './layout/Layout';
export { default as Header } from './layout/Header';
export { ProtectedRoute } from './ProtectedRoute';

// Pages
export { default as Terms } from './pages/Terms'
export { default as Homepage } from './HomePage/Homepage';
export { default as Dashboard } from './pages/Dashboard/Dashboard';
export { default as Calendar } from './pages/Calendar/Calendar';
export { default as Analytics } from './pages/Analytics/Analytics';
export { default as Resume } from './pages/AI/Resume';
export { default as Profile } from '@/components/pages/Profile';

// Jobs
export { default as Jobs } from '@/components/pages/Jobs/Jobs';
export { default as AddJob } from '@/components/pages/Jobs/AddJob';
export { default as EditJob } from '@/components/pages/Jobs/EditJob';
