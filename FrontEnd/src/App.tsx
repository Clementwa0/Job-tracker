import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { JobProvider } from "@/hooks/JobContext";
import { AuthProvider } from "@/hooks/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "./constants/theme-provider";
import {Landing,Layout, Login, Register, Dashboard, Calendar, Jobs, Analytics, AddJob, EditJob, Resume, Profile, Terms, ForgotPassword, ResetPassword} from "@/components";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <JobProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/forgetPassword" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected routes */}
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
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/add-job" element={<AddJob />} />
                  <Route path="/edit-job/:id" element={<EditJob />} />
                  <Route path="/cvCreator" element={<Resume />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<div>404 - Page Not Found</div>} />
                </Route>
              </Routes>
          </JobProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;