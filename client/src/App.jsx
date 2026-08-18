import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "./components/Layout.jsx";
import WorkerLayout from "./components/WorkerLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
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
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-7xl font-extrabold text-gradient">
        404
      </motion.p>
      <p className="font-semibold text-slate-500 dark:text-slate-400">This page seems to have gone missing — like a lost school report.</p>
      <a href="/" className="btn-primary mt-2">Back to dashboard</a>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
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
    </ToastProvider>
  );
}