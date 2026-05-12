import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";

import { RequireAuth, RedirectIfAuthed } from "@/app/routes/guards";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { Analytics, JobCalendar, Landing, Resume } from "@/components";
import {
  AddJob,
  Dashboard,
  EditJob,
  ForgotPassword,
  Jobs,
  Login,
  Profile,
  Register,
  ResetPassword,
  Terms,
} from "@/pages";

const RouteFallback = () => <div>Loading...</div>;

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------------- PUBLIC ROUTES ---------------- */}

        <Route
          path="/"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Landing />
            </Suspense>
          }
        />
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

        {/* <Route
          path="/terms"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Terms />
            </Suspense>
          }
        /> */}

        <Route
          path="/forgetPassword"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ForgotPassword />
            </Suspense>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ResetPassword />
            </Suspense>
          }
        />

        {/* ---------------- PROTECTED ROUTES ---------------- */}

        <Route
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path="/calendar"
            element={
              <Suspense fallback={<RouteFallback />}>
                <JobCalendar />
              </Suspense>
            }
          />

          <Route
            path="/jobs"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Jobs />
              </Suspense>
            }
          />

          <Route
            path="/analytics"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Analytics />
              </Suspense>
            }
          />

          <Route
            path="/add-job"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AddJob />
              </Suspense>
            }
          />

          <Route
            path="/edit-job/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <EditJob />
              </Suspense>
            }
          />

          <Route
            path="/cvCreator"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Resume />
              </Suspense>
            }
          />

          <Route
            path="/profile"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Profile />
              </Suspense>
            }
          />
        </Route>

        {/* ---------------- 404 PAGE ---------------- */}

        <Route path="*" element={<div>404 - Page Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}