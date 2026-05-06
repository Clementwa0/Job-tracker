import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RequireAuth, RedirectIfAuthed } from "@/app/routes/guards";
import { RouteFallback } from "@/shared/components/loaders/RouteFallback";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";

// Public routes
const Landing = lazy(() => import("@/components/landing/Landing"));
const Terms = lazy(() => import("@/components/pages/Terms"));
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/features/auth/pages/ResetPassword"));

// Auth routes (public but redirect away if already authed)
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));

// Protected routes
const Dashboard = lazy(() => import("@/components/pages/Dashboard/Dashboard"));
const Calendar = lazy(() => import("@/components/pages/Calendar/Calendar"));
const Jobs = lazy(() => import("@/components/pages/Jobs/Jobs"));
const Analytics = lazy(() => import("@/components/pages/Analytics/Analytics"));
const AddJob = lazy(() => import("@/components/pages/Jobs/AddJob"));
const EditJob = lazy(() => import("@/components/pages/Jobs/EditJob"));
const Resume = lazy(() => import("@/components/pages/AI/Resume"));
const Profile = lazy(() => import("@/components/pages/Profile"));

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <Login />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthed>
                <Register />
              </RedirectIfAuthed>
            }
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/forgetPassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ---------------- PROTECTED ROUTES ---------------- */}
          <Route
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/add-job" element={<AddJob />} />
            <Route path="/edit-job/:id" element={<EditJob />} />
            <Route path="/cvCreator" element={<Resume />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ---------------- 404 PAGE ---------------- */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

