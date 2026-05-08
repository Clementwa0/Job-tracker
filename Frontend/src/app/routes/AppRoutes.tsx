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
      <Routes>
        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route path="/" element={<Suspense fallback={null}><Landing /></Suspense>} />
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RedirectIfAuthed>
                <Login />
              </RedirectIfAuthed>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RedirectIfAuthed>
                <Register />
              </RedirectIfAuthed>
            </Suspense>
          }
        />
        <Route path="/terms" element={<Suspense fallback={<RouteFallback />}><Terms /></Suspense>} />
        <Route
          path="/forgetPassword"
          element={<Suspense fallback={<RouteFallback />}><ForgotPassword /></Suspense>}
        />
        <Route
          path="/reset-password/:token"
          element={<Suspense fallback={<RouteFallback />}><ResetPassword /></Suspense>}
        />

        {/* ---------------- PROTECTED ROUTES ---------------- */}
        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
          <Route path="/calendar" element={<Suspense fallback={<RouteFallback />}><Calendar /></Suspense>} />
          <Route path="/jobs" element={<Suspense fallback={<RouteFallback />}><Jobs /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<RouteFallback />}><Analytics /></Suspense>} />
          <Route path="/add-job" element={<Suspense fallback={<RouteFallback />}><AddJob /></Suspense>} />
          <Route path="/edit-job/:id" element={<Suspense fallback={<RouteFallback />}><EditJob /></Suspense>} />
          <Route path="/cvCreator" element={<Suspense fallback={<RouteFallback />}><Resume /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<RouteFallback />}><Profile /></Suspense>} />
        </Route>

        {/* ---------------- 404 PAGE ---------------- */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

