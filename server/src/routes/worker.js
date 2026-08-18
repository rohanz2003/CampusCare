import { Router } from "express";
import { readDb, writeDb } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { pushNotification } from "./issues.js";

const router = Router();
router.use(requireAuth, requireRole("worker"));

const STATUSES = ["Pending", "In Progress", "Resolved"];

router.get("/stats", (req, res) => {
  const db = readDb();
  const mine = db.issues.filter((i) => i.assignedToId === req.user.id);
  res.json({
    assigned: mine.length,
    inProgress: mine.filter((i) => i.status === "In Progress").length,
    resolved: mine.filter((i) => i.status === "Resolved").length,
    pending: mine.filter((i) => i.status === "Pending").length,
    total: mine.length,
  });
});

router.get("/issues", (req, res) => {
  const db = readDb();
  const { status } = req.query;
  let mine = db.issues
    .filter((i) => i.assignedToId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (status) mine = mine.filter((i) => i.status === status);
  res.json({ issues: mine });
});

router.get("/issues/:id", (req, res) => {
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (issue.assignedToId !== req.user.id) return res.status(403).json({ message: "This task is not assigned to you" });
  res.json({ issue });
});

router.post("/issues/:id/progress", upload.array("images", 4), (req, res) => {
  const { status, note } = req.body || {};
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (issue.assignedToId !== req.user.id) return res.status(403).json({ message: "This task is not assigned to you" });
  if (status && !STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const now = new Date().toISOString();
  const actions = [];
  const files = req.files.map((f) => `/uploads/${f.filename}`);

  if (status && status !== issue.status) {
    if (status === "Resolved" && issue.status === "Pending") {
      return res.status(400).json({ message: "Set the status to In Progress before resolving" });
    }
    issue.status = status;
    if (status === "In Progress") {
      actions.push({ action: "Worker started the repair work", at: now, by: req.user.name });
      pushNotification(db, issue.reporterId, "progress", `Work started on ${issue.id}`, `Worker ${req.user.name} has started work on "${issue.title}".`, issue.id);
    }
    if (status === "Resolved") {
      issue.resolvedAt = now;
      actions.push({ action: "Worker completed the repair and marked it Resolved", at: now, by: req.user.name });
      pushNotification(db, issue.reporterId, "resolved", `Issue ${issue.id} resolved`, `"${issue.title}" has been resolved by ${req.user.name}. Thank you for reporting!`, issue.id);
    }
    if (status === "Pending") {
      actions.push({ action: "Worker reopened the task (Pending)", at: now, by: req.user.name });
    }
  }

  if (note && note.trim().length > 1) {
    actions.push({ action: `Progress update: ${note.trim()}`, at: now, by: req.user.name });
  }

  if (files.length) {
    issue.progressImages = [...(issue.progressImages || []), ...files];
    actions.push({ action: `Added ${files.length} progress photo${files.length > 1 ? "s" : ""}`, at: now, by: req.user.name });
  }

  if (actions.length) {
    issue.timeline.push(...actions);
    issue.updatedAt = now;
    writeDb(db);
  }
  res.json({ issue });
});

export default router;