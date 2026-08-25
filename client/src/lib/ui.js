// Centralized UI constants shared across pages (charts, labels, category meta).
// Keeps color maps and worker-type labels in one place instead of duplicated per page.

export const STATUS_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#0ea5e9",
  Resolved: "#10b981",
};

export const PRIORITY_COLORS = {
  Low: "#94a3b8",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#f43f5e",
};

// Recharts palette drawn from the brand + accent scales.
export const CHART_COLORS = ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#0ea5e9"];

export const WORKER_TYPE_LABELS = {
  carpenter: "Carpenter",
  electrician: "Electrician",
  plumber: "Plumber",
  sanitation: "Sanitation Staff",
  general: "General Maintenance",
};

export const workerTypeLabel = (t) => WORKER_TYPE_LABELS[t] || t || "Staff";

// Where each role should land after login / when hitting a public route while signed in.
export const homeFor = (user) => (user?.role === "worker" ? "/worker" : "/dashboard");
