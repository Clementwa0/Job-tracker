import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { JobProvider } from "@/hooks/JobContext";
import { AuthProvider } from "@/hooks/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "./constants/theme-provider";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";

// Lazy-loaded route components for code splitting
const Homepage = lazy(() => import("@/components/HomePage/Homepage"));
const Terms = lazy(() => import("@/components/pages/Terms"));
const Login = lazy(() => import("@/components/Login"));
const Register = lazy(() => import("@/components/Register"));
const ForgotPassword = lazy(() => import("@/components/forgetPassword"));
const ResetPassword = lazy(() => import("@/components/resetPassword"));
const Layout = lazy(() => import("@/components/layout/Layout").then((m) => ({ default: m.default })));
const Dashboard = lazy(() => import("@/components/pages/Dashboard/Dashboard"));
const Calendar = lazy(() => import("@/components/pages/Calendar/Calendar"));
const Jobs = lazy(() => import("@/components/pages/Jobs/Jobs"));
const Analytics = lazy(() => import("@/components/pages/Analytics/Analytics"));
const AddJob = lazy(() => import("@/components/pages/Jobs/AddJob"));
const EditJob = lazy(() => import("@/components/pages/Jobs/EditJob"));
const Resume = lazy(() => import("@/components/pages/AI/Resume"));
const Profile = lazy(() => import("@/components/pages/Profile"));

const RouteFallback = () => <FullPageLoader message="Loading..." />;

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <JobProvider>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgetPassword" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="add-job" element={<AddJob />} />
                  <Route path="/edit-job/:id" element={<EditJob />} />
                  <Route path="/cvCreator" element={<Resume />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Routes>
            </JobProvider>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
