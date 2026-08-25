import { Router } from "express";
import { collections, publicUser } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pushNotification } from "./issues.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Pending", "In Progress", "Resolved"];

router.get("/stats", async (req, res) => {
  try {
    const issues = collections.issues();
    const users = collections.users();
    const all = await issues.find().toArray();
    const resolved = all.filter((i) => i.status === "Resolved");
    const inProgress = all.filter((i) => i.status === "In Progress");
    const pending = all.filter((i) => i.status === "Pending");

    const counters = collections.counters();
    const catsDoc = await counters.findOne({ _id: "category" });
    const categories = catsDoc?.categories || [];

    const byCategory = {};
    for (const c of categories) byCategory[c.id] = { label: c.label, icon: c.icon, count: 0 };
    for (const i of all) if (byCategory[i.category]) byCategory[i.category].count += 1;

    const byStatus = { Pending: pending.length, "In Progress": inProgress.length, Resolved: resolved.length };
    const byPriority = {};
    for (const p of PRIORITIES) byPriority[p] = all.filter((i) => i.priority === p).length;

    const avgResolutionDays = resolved.length
      ? +(resolved.reduce((s, i) => s + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 86400000, 0) / resolved.length).toFixed(1)
      : 0;

    const totalUsers = await users.countDocuments({ role: { $ne: "admin" } });
    const pendingRequests = await users.countDocuments({ status: "pending" });

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
      totalUsers,
      pendingRequests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/workers", async (req, res) => {
  try {
    const users = collections.users();
    const issues = collections.issues();
    const counters = collections.counters();
    const wtDoc = await counters.findOne({ _id: "workerType" });
    const workerTypes = wtDoc?.workerTypes || [];

    const workerList = await users.find({ role: "worker", status: "approved" }).toArray();
    const workers = [];
    for (const u of workerList) {
      const activeAssignments = await issues.countDocuments({ assignedToId: u.id, status: { $ne: "Resolved" } });
      workers.push({
        id: u.id,
        name: u.name,
        workerType: u.workerType,
        workerTypeLabel: workerTypes.find((t) => t.id === u.workerType)?.label || u.workerType,
        activeAssignments,
      });
    }
    res.json({ workers, workerTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = collections.users();
    const { status } = req.query;
    let query = { role: { $ne: "admin" } };
    if (status) query.status = status;
    const userList = await users.find(query).toArray();
    res.json({ users: userList.map(publicUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/users/:id/decision", async (req, res) => {
  try {
    const { action } = req.body || {};
    const users = collections.users();
    const target = await users.findOne({ id: req.params.id });
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "admin") return res.status(400).json({ message: "Admins cannot be approved or rejected" });
    if (action !== "approve" && action !== "reject") return res.status(400).json({ message: "Action must be approve or reject" });

    const newStatus = action === "approve" ? "approved" : "rejected";
    await users.updateOne({ id: req.params.id }, { $set: { status: newStatus } });

    await pushNotification(null, target.id, action === "approve" ? "resolved" : "pending",
      action === "approve" ? "Registration approved" : "Registration rejected",
      action === "approve"
        ? `Welcome, ${target.name}! Your ${target.role === "worker" ? `worker (${target.workerType}) ` : ""}account was approved. You can now sign in.`
        : `Your ${target.role} registration was rejected. Please contact the school administration for details.`,
      null
    );

    const updated = await users.findOne({ id: req.params.id });
    res.json({ user: { id: updated.id, name: updated.name, role: updated.role, status: updated.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { status, priority, assignedToId, estimatedResolution, note } = req.body || {};
    const issues = collections.issues();
    const users = collections.users();
    const counters = collections.counters();
    const wtDoc = await counters.findOne({ _id: "workerType" });
    const workerTypes = wtDoc?.workerTypes || [];

    const issue = await issues.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (status && !STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
    if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ message: "Invalid priority" });

    const now = new Date().toISOString();
    const actions = [];
    const updateFields = {};

    if (status && status !== issue.status) {
      updateFields.status = status;
      if (status === "Resolved") {
        updateFields.resolvedAt = now;
        actions.push({ action: "Issue closed and marked as Resolved", at: now, by: req.user.name });
        await pushNotification(null, issue.reporterId, "resolved", `Issue ${issue.id} resolved`, `"${issue.title}" has been resolved. Thank you for reporting!`, issue.id);
      } else if (status === "In Progress") {
        actions.push({ action: "Repair work has started", at: now, by: req.user.name });
        await pushNotification(null, issue.reporterId, "progress", `Work started on ${issue.id}`, `Maintenance team is now working on "${issue.title}".`, issue.id);
      } else {
        actions.push({ action: "Issue reopened and set to Pending", at: now, by: req.user.name });
      }
    }
    if (priority && priority !== issue.priority) {
      updateFields.priority = priority;
      actions.push({ action: `Priority changed to ${priority}`, at: now, by: req.user.name });
    }
    if (assignedToId !== undefined) {
      if (!assignedToId) {
        if (issue.assignedToId) {
          actions.push({ action: `Task unassigned from ${issue.assignedToName}`, at: now, by: req.user.name });
          await pushNotification(null, issue.assignedToId, "pending", `Task unassigned: ${issue.id}`, `Your assignment for "${issue.title}" was removed by the administration.`, issue.id);
        }
        updateFields.assignedToId = null;
        updateFields.assignedToName = null;
        updateFields.assignedToType = null;
      } else {
        const worker = await users.findOne({ id: assignedToId, role: "worker", status: "approved" });
        if (!worker) return res.status(400).json({ message: "Please select a valid approved worker" });
        const wasAssigned = issue.assignedToId && issue.assignedToId !== worker.id;
        updateFields.assignedToId = worker.id;
        updateFields.assignedToName = worker.name;
        updateFields.assignedToType = worker.workerType;
        actions.push({ action: `Assigned to ${worker.name} (${workerTypes.find((t) => t.id === worker.workerType)?.label || worker.workerType})`, at: now, by: req.user.name });
        await pushNotification(null, worker.id, "progress", `New task assigned: ${issue.id}`, `You have been assigned to "${issue.title}" (${issue.priority} priority) at ${issue.location}.`, issue.id);
        if (wasAssigned) {
          await pushNotification(null, issue.assignedToId, "pending", `Task reassigned: ${issue.id}`, `Your assignment for "${issue.title}" was transferred to another worker.`, issue.id);
        }
      }
    }
    if (estimatedResolution && /^\d+\s*(days?|hours?|weeks?)$/i.test(estimatedResolution)) {
      updateFields.estimatedResolution = estimatedResolution;
    }
    if (note && note.trim().length > 1) {
      actions.push({ action: note.trim(), at: now, by: req.user.name });
    }

    if (actions.length) {
      updateFields.$push = { timeline: { $each: actions } };
      updateFields.updatedAt = now;
    }

    await issues.updateOne({ id: req.params.id }, { $set: updateFields });
    const updated = await issues.findOne({ id: req.params.id });
    res.json({ issue: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/reports/summary", async (req, res) => {
  try {
    const issues = collections.issues();
    const schools = collections.schools();
    const all = await issues.find().toArray();
    const schoolList = await schools.find().toArray();

    const bySchool = {};
    for (const s of schoolList) bySchool[s.id] = { name: s.name, total: 0, resolved: 0, pending: 0, inProgress: 0 };
    for (const i of all) {
      if (!bySchool[i.schoolId]) bySchool[i.schoolId] = { name: i.school, total: 0, resolved: 0, pending: 0, inProgress: 0 };
      const row = bySchool[i.schoolId];
      row.total += 1;
      row[i.status === "Resolved" ? "resolved" : i.status === "In Progress" ? "inProgress" : "pending"] += 1;
    }

    const notifications = collections.notifications();
    const recentActivity = await notifications.find().sort({ createdAt: -1 }).limit(10).toArray();

    const staffWorkload = {};
    for (const i of all.filter((x) => x.assignedToName)) {
      const label = `${i.assignedToName} (${workerTypes.find((t) => t.id === i.assignedToType)?.label || i.assignedToType || "Maintenance"})`;
      staffWorkload[label] = (staffWorkload[label] || 0) + 1;
    }

    res.json({ bySchool: Object.values(bySchool), staffWorkload, recentActivity, total: all.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;