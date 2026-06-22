import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import {
  Calendar,
  Dashboard,
  Jobs,
  Home,
  Layout,
  AddJob,
  Analytics,
  EditJob,
  Profile,
  ForgotPassword,
  ResetPassword,
  Terms,
  Login,
  Register,
  Interviews,
  CvReview,
  ResumesDashboard,
  OAuthCallback,
} from "@/components/index";
import ResumeBuilder from "@/pages/resumeBuilder/ResumeBuilder";
import VerifyEmail from "@/pages/Auth/VerifyEmail";
import PublicLayout from "@/components/layout/PublicLayout";
import JobBoardList from "@/pages/jobBoard/JobBoardList";
import JobBoardDetail from "@/pages/jobBoard/JobBoardDetail";
import EmployerLayout from "@/components/layout/EmployerLayout";
import EmployerDashboard from "@/pages/employer/EmployerDashboard";
import EmployerJobsList from "@/pages/employer/EmployerJobsList";
import EmployerJobCreate from "@/pages/employer/EmployerJobCreate";
import EmployerJobEdit from "@/pages/employer/EmployerJobEdit";
import EmployerLoginPage from "@/pages/employer/auth/EmployerLogin";
import EmployerRegisterPage from "@/pages/employer/auth/EmployerRegister";
import EmployerForgotPasswordPage from "@/pages/employer/auth/EmployerForgotPassword";
import EmployerResetPasswordPage from "@/pages/employer/auth/EmployerResetPassword";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminCompanies from "@/pages/admin/AdminCompanies";
import AdminEmployers from "@/pages/admin/AdminEmployers";
import AdminAuditLogs from "@/pages/admin/AdminAuditLogs";
import AdminApplications from "@/pages/admin/AdminApplications";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminLoginPage from "@/pages/admin/auth/AdminLogin";
import { UserRoute, EmployerRoute, AdminRoute } from "@/components/routing/RoleGuards";
import { UserAuthPage, EmployerAuthPage, AdminAuthPage } from "@/features/user/auth/AuthPageShell";
import { legacyRedirectRoutes } from "@/components/routing/LegacyRedirects";
import { Skeleton } from "@/components/ui/skeleton";

import { JobProvider } from "@/hooks/JobContext";
import { AuthProvider } from "@/hooks/AuthContext";
import { ThemeProvider } from "./constants/theme-provider";

const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AdminAnalytics"));

function AdminAnalyticsFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <JobProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                path="/login"
                element={
                  <UserAuthPage>
                    <Login />
                  </UserAuthPage>
                }
              />
              <Route
                path="/register"
                element={
                  <UserAuthPage>
                    <Register />
                  </UserAuthPage>
                }
              />
              <Route path="/forget-password" element={<ForgotPassword />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Employer auth (unified JWT, separate UI) */}
              <Route
                path="/employer/login"
                element={
                  <EmployerAuthPage>
                    <EmployerLoginPage />
                  </EmployerAuthPage>
                }
              />
              <Route
                path="/employer/register"
                element={
                  <EmployerAuthPage>
                    <EmployerRegisterPage />
                  </EmployerAuthPage>
                }
              />
              <Route path="/employer/forgot-password" element={<EmployerForgotPasswordPage />} />
              <Route path="/employer/reset-password/:token" element={<EmployerResetPasswordPage />} />

              {/* Admin auth */}
              <Route
                path="/admin/login"
                element={
                  <AdminAuthPage>
                    <AdminLoginPage />
                  </AdminAuthPage>
                }
              />

              {/* Public job board */}
              <Route element={<PublicLayout />}>
                <Route path="/jobs" element={<JobBoardList />} />
                <Route path="/jobs/:slug" element={<JobBoardDetail />} />
              </Route>

              {/* Job seeker dashboard (user role only) */}
              <Route
                element={
                  <UserRoute>
                    <Layout />
                  </UserRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/applications" element={<Jobs />} />
                <Route path="/applications/add" element={<AddJob />} />
                <Route path="/applications/edit/:id" element={<EditJob />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cv-review" element={<CvReview />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/resumes" element={<ResumesDashboard />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/resume-builder/:id" element={<ResumeBuilder />} />
              </Route>

              {legacyRedirectRoutes}

              {/* Employer portal */}
              <Route
                element={
                  <EmployerRoute>
                    <EmployerLayout />
                  </EmployerRoute>
                }
              >
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/employer/jobs" element={<EmployerJobsList />} />
                <Route path="/employer/jobs/create" element={<EmployerJobCreate />} />
                <Route path="/employer/jobs/edit/:id" element={<EmployerJobEdit />} />
              </Route>

              {/* Admin portal */}
              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/employers" element={<AdminEmployers />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/companies" element={<AdminCompanies />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
                <Route
                  path="/admin/analytics"
                  element={
                    <Suspense fallback={<AdminAnalyticsFallback />}>
                      <AdminAnalyticsPage />
                    </Suspense>
                  }
                />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              </Route>
            </Routes>
          </JobProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
