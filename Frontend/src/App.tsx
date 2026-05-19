import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
  CvReview,
  Interviews,
} from "@/components/index";

import { JobProvider } from "@/hooks/JobContext";
import { AuthProvider } from "@/hooks/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "./constants/theme-provider";

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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forget-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected App Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >

                {/* Core Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Jobs Flow */}
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/add-job" element={<AddJob />} />
                <Route path="/edit-job/:id" element={<EditJob />} />

                {/* Productivity Modules */}
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/cv-review" element={<CvReview />} />
                <Route path="/profile" element={<Profile />} />

                {/* Interviews (GLOBAL VIEW) */}
                <Route path="/interviews" element={<Interviews />} />

              </Route>

            </Routes>
          </JobProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;