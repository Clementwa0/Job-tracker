import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "@/components/HomePage/Homepage";
import {
  Calendar,
  Profile,
  Dashboard,
  Jobs,
  Layout,
  Login,
  Register,
  AddJob,
  Analytics,
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
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
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
              <Route path="/edit-job/:id" element={<AddJob />} />
              <Route path="/Profile" element={<Profile />} />
            </Route>
          </Routes>
        </JobProvider>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;