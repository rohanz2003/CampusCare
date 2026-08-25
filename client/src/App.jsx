import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Layout.jsx";
import WorkerLayout from "./components/WorkerLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { homeFor } from "./lib/ui.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import Tracking from "./pages/Tracking.jsx";
import IssueDetail from "./pages/IssueDetail.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Profile from "./pages/Profile.jsx";
import WorkerDashboard from "./pages/WorkerDashboard.jsx";
import WorkerWork from "./pages/WorkerWork.jsx";
import WorkerWorkDetail from "./pages/WorkerWorkDetail.jsx";

function NotFound() {
  const { user } = useAuth();
  const home = user ? homeFor(user) : "/";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.p
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display text-8xl font-extrabold text-gradient"
      >
        404
      </motion.p>
      <p className="max-w-sm font-semibold text-slate-500 dark:text-slate-400">
        This page seems to have gone missing — like a lost school report.
      </p>
      <Link to={home} className="btn-primary mt-2">
        {user ? "Back to dashboard" : "Back to home"}
      </Link>
    </div>
  );
}

// Renders a public route (landing / auth). Signed-in visitors are bounced to their role home.
function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor(user)} replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split("/")[1] || "home"}>
          <Route
            path="/"
            element={
              <PublicOnly>
                <Landing />
              </PublicOnly>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnly>
                <Register />
              </PublicOnly>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/report"
              element={
                <ProtectedRoute roles={["parent", "teacher"]}>
                  <ReportIssue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute roles={["parent", "teacher"]}>
                  <Tracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/:id"
              element={
                <ProtectedRoute>
                  <IssueDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/worker"
              element={
                <ProtectedRoute roles={["worker"]}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/work"
              element={
                <ProtectedRoute roles={["worker"]}>
                  <WorkerWork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/work/:id"
              element={
                <ProtectedRoute roles={["worker"]}>
                  <WorkerWorkDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/notifications"
              element={
                <ProtectedRoute roles={["worker"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/profile"
              element={
                <ProtectedRoute roles={["worker"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </ToastProvider>
  );
}
