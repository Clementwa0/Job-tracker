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
} from "@/components/index";
import { JobProvider } from "@/hooks/JobContext";
import { AuthProvider } from "@/hooks/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const App = () => {
  return (
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
              <Route path="add-job" element={<AddJob />} />
              <Route path="/Profile" element={<Profile />} />
            </Route>
          </Routes>
        </JobProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
