import { Router } from "express";
import { collections } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { pushNotification } from "./issues.js";

const router = Router();
router.use(requireAuth, requireRole("worker"));

const STATUSES = ["Pending", "In Progress", "Resolved"];

router.get("/stats", async (req, res) => {
  try {
    const issues = collections.issues();
    const mine = await issues.find({ assignedToId: req.user.id }).toArray();
    res.json({
      assigned: mine.length,
      inProgress: mine.filter((i) => i.status === "In Progress").length,
      resolved: mine.filter((i) => i.status === "Resolved").length,
      pending: mine.filter((i) => i.status === "Pending").length,
      total: mine.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/issues", async (req, res) => {
  try {
    const issues = collections.issues();
    const { status } = req.query;
    let query = { assignedToId: req.user.id };
    if (status) query.status = status;
    const mine = await issues.find(query).sort({ createdAt: -1 }).toArray();
    res.json({ issues: mine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/issues/:id", async (req, res) => {
  try {
    const issues = collections.issues();
    const issue = await issues.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (issue.assignedToId !== req.user.id) return res.status(403).json({ message: "This task is not assigned to you" });
    res.json({ issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/issues/:id/progress", upload.array("images", 4), async (req, res) => {
  try {
    const { status, note } = req.body || {};
    const issues = collections.issues();
    const issue = await issues.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (issue.assignedToId !== req.user.id) return res.status(403).json({ message: "This task is not assigned to you" });
    if (status && !STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const now = new Date().toISOString();
    const actions = [];
    const files = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const updateFields = {};

    if (status && status !== issue.status) {
      if (status === "Resolved" && issue.status === "Pending") {
        return res.status(400).json({ message: "Set the status to In Progress before resolving" });
      }
      updateFields.status = status;
      if (status === "In Progress") {
        actions.push({ action: "Worker started the repair work", at: now, by: req.user.name });
        await pushNotification(null, issue.reporterId, "progress", `Work started on ${issue.id}`, `Worker ${req.user.name} has started work on "${issue.title}".`, issue.id);
        // Notify all admins
        await pushNotification(null, null, "progress", `Issue ${issue.id} in progress`, `Worker ${req.user.name} started work on "${issue.title}".`, issue.id, { targetRole: "admin" });
      }
      if (status === "Resolved") {
        updateFields.resolvedAt = now;
        actions.push({ action: "Worker completed the repair and marked it Resolved", at: now, by: req.user.name });
        await pushNotification(null, issue.reporterId, "resolved", `Issue ${issue.id} resolved`, `"${issue.title}" has been resolved by ${req.user.name}. Thank you for reporting!`, issue.id);
        // Notify all admins
        await pushNotification(null, null, "resolved", `Issue ${issue.id} resolved`, `Worker ${req.user.name} resolved "${issue.title}".`, issue.id, { targetRole: "admin" });
      }
      if (status === "Pending") {
        actions.push({ action: "Worker reopened the task (Pending)", at: now, by: req.user.name });
        // Notify all admins
        await pushNotification(null, null, "pending", `Issue ${issue.id} reopened`, `Worker ${req.user.name} reopened "${issue.title}".`, issue.id, { targetRole: "admin" });
      }
    }

    if (note && note.trim().length > 1) {
      actions.push({ action: `Progress update: ${note.trim()}`, at: now, by: req.user.name });
    }

    if (files.length) {
      const progressImages = [...(issue.progressImages || []), ...files];
      updateFields.progressImages = progressImages;
      actions.push({ action: `Added ${files.length} progress photo${files.length > 1 ? "s" : ""}`, at: now, by: req.user.name });
    }

    if (actions.length) {
      updateFields.$push = { timeline: { $each: actions } };
      updateFields.updatedAt = now;
      await issues.updateOne({ id: req.params.id }, { $set: updateFields });
    }

    const updated = await issues.findOne({ id: req.params.id });
    res.json({ issue: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;