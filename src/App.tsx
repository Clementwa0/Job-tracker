
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { JobsProvider } from "./context/JobsContext";
import ProtectedRoute from "./components/ProtectedRoute";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobForm from "./pages/JobForm";
import JobDetail from "./pages/JobDetail";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <JobsProvider>
            <Routes>
              <Route path="/landing" element={<Landing/>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs/new" element={
                <ProtectedRoute>
                  <JobForm />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Redirect root to login or dashboard */}
              <Route path="/" element={<Navigate to="/landing" replace />} />
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </JobsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
