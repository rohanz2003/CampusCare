import { Router } from "express";
import { readDb, writeDb, nextId, publicUser } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const CATEGORIES = ["furniture", "electrical", "sanitation", "plumbing", "safety", "infrastructure", "other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Pending", "In Progress", "Resolved"];

export function pushNotification(db, userId, type, title, message, issueId) {
  const n = {
    id: `N${nextId(db, "notification")}`,
    userId,
    type,
    title,
    message,
    issueId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(n);
  return n;
}

router.get("/meta", requireAuth, (req, res) => {
  const db = readDb();
  res.json({
    schools: db.schools || [],
    categories: db.categories || [],
    priorities: PRIORITIES,
    statuses: STATUSES,
  });
});

router.get("/stats", requireAuth, (req, res) => {
  const db = readDb();
  const isAdmin = req.user.role === "admin";
  const scope = isAdmin ? db.issues : db.issues.filter((i) => i.reporterId === req.user.id);

  const resolved = scope.filter((i) => i.status === "Resolved");
  const byStatus = { Pending: 0, "In Progress": 0, Resolved: 0 };
  const byPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  for (const i of scope) {
    byStatus[i.status] += 1;
    byPriority[i.priority] += 1;
  }

  const byCategory = {};
  for (const c of db.categories || []) byCategory[c.id] = { label: c.label, icon: c.icon, count: 0 };
  for (const i of scope) if (byCategory[i.category]) byCategory[i.category].count += 1;

  res.json({
    total: scope.length,
    resolved: resolved.length,
    inProgress: byStatus["In Progress"],
    pending: byStatus.Pending,
    resolutionRate: scope.length ? Math.round((resolved.length / scope.length) * 100) : 0,
    avgResolutionDays: resolved.length
      ? +(resolved.reduce((s, i) => s + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 86400000, 0) / resolved.length).toFixed(1)
      : 0,
    byCategory,
    byStatus,
    byPriority,
    totalUsers: isAdmin ? db.users.filter((u) => u.role !== "admin").length : null,
  });
});

router.get("/", requireAuth, (req, res) => {
  const db = readDb();
  const { status, priority, category, q, reporter, assigned } = req.query;
  const isAdmin = req.user.role === "admin";

  let items = db.issues.filter((i) => (isAdmin ? true : i.reporterId === req.user.id));
  if (status) items = items.filter((i) => i.status === status);
  if (priority) items = items.filter((i) => i.priority === priority);
  if (category) items = items.filter((i) => i.category === category);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(needle) || i.location.toLowerCase().includes(needle) || i.id.toLowerCase().includes(needle));
  }
  if (reporter && isAdmin) items = items.filter((i) => i.reporterId === reporter);
  if (assigned && isAdmin) items = items.filter((i) => i.assignedTo === assigned);

  items = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ issues: items });
});

router.get("/:id", requireAuth, (req, res) => {
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (req.user.role !== "admin" && issue.reporterId !== req.user.id) {
    return res.status(403).json({ message: "You can only view your own reports" });
  }
  res.json({ issue });
});

router.post("/", requireAuth, (req, res) => {
  const { title, description, category, location, priority } = req.body || {};
  if (!title || title.trim().length < 8) return res.status(400).json({ message: "Title must be at least 8 characters" });
  if (!description || description.trim().length < 10) return res.status(400).json({ message: "Description must be at least 10 characters" });
  if (!CATEGORIES.includes(category)) return res.status(400).json({ message: "Please choose a valid category" });
  if (!location || location.trim().length < 3) return res.status(400).json({ message: "Please specify a location within the school" });
  if (!PRIORITIES.includes(priority)) return res.status(400).json({ message: "Please choose a valid priority level" });

  const db = readDb();
  const issueId = `ISS-${nextId(db, "issue")}`;
  const now = new Date().toISOString();

  const issue = {
    id: issueId,
    title: title.trim(),
    description: description.trim(),
    category,
    location: location.trim(),
    priority,
    status: "Pending",
    assignedTo: null,
    reporterId: req.user.id,
    reporterName: req.user.name,
    reporterRole: req.user.role,
    school: req.user.school,
    schoolId: req.user.schoolId,
    images: [],
    estimatedResolution: "3 days",
    resolvedAt: null,
    timeline: [{ action: "Issue reported and logged in the system", at: now, by: req.user.name }],
    createdAt: now,
    updatedAt: now,
  };
  db.issues.push(issue);
  pushNotification(db, req.user.id, "pending", `Issue ${issueId} logged`, `Your report "${issue.title}" was received and is pending review.`, issueId);
  writeDb(db);

  res.status(201).json({ issue });
});

router.post("/:id/comments", requireAuth, (req, res) => {
  const { text } = req.body || {};
  if (!text || text.trim().length < 2) return res.status(400).json({ message: "Comment text is required" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only administrators can post updates on issues" });
  }

  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  const entry = { action: text.trim(), at: new Date().toISOString(), by: req.user.name };
  issue.timeline.push(entry);
  issue.updatedAt = entry.at;
  writeDb(db);
  res.status(201).json({ issue });
});

router.post("/:id/remind", requireAuth, (req, res) => {
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (req.user.role !== "admin" && issue.reporterId !== req.user.id) {
    return res.status(403).json({ message: "You can only remind about your own reports" });
  }
  if (issue.status === "Resolved") return res.status(400).json({ message: "This issue is already resolved" });

  const lastReminder = [...issue.timeline]
    .filter((t) => /^Reminder sent/.test(t.action))
    .sort((a, b) => new Date(b.at) - new Date(a.at))[0];
  if (lastReminder && Date.now() - new Date(lastReminder.at).getTime() < 24 * 3600 * 1000) {
    return res.status(429).json({ message: "A reminder was already sent in the last 24 hours" });
  }

  const now = new Date().toISOString();
  issue.timeline.push({ action: `Reminder sent to administration for pending repair`, at: now, by: req.user.name });
  issue.updatedAt = now;

  for (const admin of db.users.filter((u) => u.role === "admin")) {
    pushNotification(
      db,
      admin.id,
      "pending",
      `Reminder: ${issue.id} still pending`,
      `${req.user.name} reminded about "${issue.title}" (${issue.priority} priority, reported ${new Date(issue.createdAt).toLocaleDateString()}).`,
      issue.id
    );
  }
  writeDb(db);
  res.json({ issue, reminded: true });
});

export default router;