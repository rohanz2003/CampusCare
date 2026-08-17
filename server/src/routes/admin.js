import { Router } from "express";
import { readDb, writeDb } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pushNotification } from "./issues.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Pending", "In Progress", "Resolved"];
const STAFF = [
  "Ramesh Kumar (Maintenance)",
  "Sunita Devi (Electrician)",
  "Mohammad Ali (Plumber)",
  "Prakash Joshi (Carpenter)",
  "Deepa Rao (Sanitation Staff)",
  "Anil Yadav (General Helper)",
];

router.get("/stats", (req, res) => {
  const db = readDb();
  const all = db.issues;
  const resolved = all.filter((i) => i.status === "Resolved");
  const inProgress = all.filter((i) => i.status === "In Progress");
  const pending = all.filter((i) => i.status === "Pending");

  const byCategory = {};
  for (const c of db.categories || []) byCategory[c.id] = { label: c.label, icon: c.icon, count: 0 };
  for (const i of all) if (byCategory[i.category]) byCategory[i.category].count += 1;

  const byStatus = { Pending: pending.length, "In Progress": inProgress.length, Resolved: resolved.length };
  const byPriority = {};
  for (const p of PRIORITIES) byPriority[p] = all.filter((i) => i.priority === p).length;

  const avgResolutionDays = resolved.length
    ? +(resolved.reduce((s, i) => s + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 86400000, 0) / resolved.length).toFixed(1)
    : 0;

  res.json({
    total: all.length,
    resolved: resolved.length,
    inProgress: inProgress.length,
    pending: pending.length,
    resolutionRate: all.length ? Math.round((resolved.length / all.length) * 100) : 0,
    avgResolutionDays,
    byCategory,
    byStatus,
    byPriority,
    totalUsers: db.users.filter((u) => u.role !== "admin").length,
  });
});

router.patch("/:id", (req, res) => {
  const { status, priority, assignedTo, estimatedResolution, note } = req.body || {};
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (status && !STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ message: "Invalid priority" });

  const now = new Date().toISOString();
  const actions = [];
  const notifyTo = [issue.reporterId];

  if (status && status !== issue.status) {
    issue.status = status;
    if (status === "Resolved") {
      issue.resolvedAt = now;
      actions.push({ action: "Issue closed and marked as Resolved", at: now, by: req.user.name });
      pushNotification(db, issue.reporterId, "resolved", `Issue ${issue.id} resolved`, `"${issue.title}" has been resolved. Thank you for reporting!`, issue.id);
    } else if (status === "In Progress") {
      actions.push({ action: "Repair work has started", at: now, by: req.user.name });
      pushNotification(db, issue.reporterId, "progress", `Work started on ${issue.id}`, `Maintenance team is now working on "${issue.title}".`, issue.id);
    } else {
      actions.push({ action: "Issue reopened and set to Pending", at: now, by: req.user.name });
    }
  }
  if (priority && priority !== issue.priority) {
    issue.priority = priority;
    actions.push({ action: `Priority changed to ${priority}`, at: now, by: req.user.name });
  }
  if (assignedTo && assignedTo !== issue.assignedTo) {
    if (!STAFF.includes(assignedTo)) return res.status(400).json({ message: "Invalid repair staff member" });
    issue.assignedTo = assignedTo;
    actions.push({ action: `Assigned to ${assignedTo}`, at: now, by: req.user.name });
  }
  if (estimatedResolution && /^\d+\s*(days?|hours?|weeks?)$/i.test(estimatedResolution)) {
    issue.estimatedResolution = estimatedResolution;
  }
  if (note && note.trim().length > 1) {
    actions.push({ action: note.trim(), at: now, by: req.user.name });
  }

  if (actions.length) {
    issue.timeline.push(...actions);
    issue.updatedAt = now;
  }
  writeDb(db);
  res.json({ issue });
});

router.post("/:id/assign", (req, res) => {
  const { assignedTo } = req.body || {};
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (!assignedTo || !STAFF.includes(assignedTo)) return res.status(400).json({ message: "Please select a valid repair staff member" });

  issue.assignedTo = assignedTo;
  const now = new Date().toISOString();
  issue.timeline.push({ action: `Assigned to ${assignedTo}`, at: now, by: req.user.name });
  issue.updatedAt = now;
  if (issue.status === "Pending") {
    issue.status = "In Progress";
    issue.timeline.push({ action: "Repair work has started", at: now, by: req.user.name });
    pushNotification(db, issue.reporterId, "progress", `Work started on ${issue.id}`, `Maintenance team is now working on "${issue.title}".`, issue.id);
  }
  writeDb(db);
  res.json({ issue });
});

router.get("/reports/summary", (req, res) => {
  const db = readDb();
  const all = db.issues;
  const bySchool = {};
  for (const s of db.schools || []) bySchool[s.id] = { name: s.name, total: 0, resolved: 0, pending: 0, inProgress: 0 };
  for (const i of all) {
    if (!bySchool[i.schoolId]) bySchool[i.schoolId] = { name: i.school, total: 0, resolved: 0, pending: 0, inProgress: 0 };
    const row = bySchool[i.schoolId];
    row.total += 1;
    row[i.status === "Resolved" ? "resolved" : i.status === "In Progress" ? "inProgress" : "pending"] += 1;
  }

  const recentActivity = [...db.notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((n) => ({ title: n.title, message: n.message, at: n.createdAt, type: n.type }));

  const staffWorkload = {};
  for (const i of all.filter((x) => x.assignedTo)) {
    staffWorkload[i.assignedTo] = (staffWorkload[i.assignedTo] || 0) + 1;
  }

  res.json({ bySchool: Object.values(bySchool), staffWorkload, recentActivity, total: all.length });
});

export default router;