import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "@/components/HomePage/Homepage";
import {
  Calendar,
  Dashboard,
  Jobs,
  Layout,
  Login,
  Register,
  AddJob,
  Analytics,
  EditJob,
  CvCreator,
  Profile, ForgotPassword, ResetPassword
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
            <Route path="/forgetPassword" element={<ForgotPassword/>}/>
            <Route path="/reset-password/:token" element={<ResetPassword/>}/>
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
              <Route path="/cvCreator" element={<CvCreator/>}/>
              <Route path="/profile" element={<Profile/>} />
            </Route>
          </Routes>
        </JobProvider>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;