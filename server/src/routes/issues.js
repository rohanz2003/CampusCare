import { Router } from "express";
import { collections, publicUser } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const CATEGORIES = ["furniture", "electrical", "sanitation", "plumbing", "safety", "infrastructure", "other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Pending", "In Progress", "Resolved"];

export async function pushNotification(db, userId, type, title, message, issueId, options = {}) {
  const counters = collections.counters();
  const counterDoc = await counters.findOneAndUpdate(
    { _id: "notification" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const { targetRole = null } = options;
  const n = {
    id: `N${counterDoc.seq}`,
    userId: userId ?? null,
    targetRole,
    type,
    title,
    message,
    issueId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const notifications = collections.notifications();
  await notifications.insertOne(n);
  return n;
}

router.get("/meta", async (req, res) => {
  try {
    const schools = await collections.schools().find().toArray();
    const categories = await collections.counters().findOne({ _id: "category" });
    res.json({
      schools,
      categories: categories?.categories || [],
      priorities: PRIORITIES,
      statuses: STATUSES,
      workerTypes: await collections.counters().findOne({ _id: "workerType" })?.workerTypes || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const issues = collections.issues();
    const isAdmin = req.user.role === "admin";
    const query = isAdmin ? {} : { reporterId: req.user.id };
    const scope = await issues.find(query).toArray();

    const resolved = scope.filter((i) => i.status === "Resolved");
    const byStatus = { Pending: 0, "In Progress": 0, Resolved: 0 };
    const byPriority = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const i of scope) {
      byStatus[i.status] += 1;
      byPriority[i.priority] += 1;
    }

    const byCategory = {};
    for (const c of CATEGORIES) byCategory[c] = { label: c, icon: "", count: 0 };
    for (const i of scope) if (byCategory[i.category]) byCategory[i.category].count += 1;

    const users = collections.users();
    const totalUsers = isAdmin ? await users.countDocuments({ role: { $ne: "admin" } }) : null;

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
      totalUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const issues = collections.issues();
    const { status, priority, category, q, reporter, assigned } = req.query;
    const isAdmin = req.user.role === "admin";

    let query = isAdmin ? {} : { reporterId: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (q) {
      const needle = q.toLowerCase();
      query.$or = [
        { title: { $regex: needle, $options: "i" } },
        { location: { $regex: needle, $options: "i" } },
        { id: { $regex: needle, $options: "i" } },
      ];
    }
    if (reporter && isAdmin) query.reporterId = reporter;
    if (assigned && isAdmin) query.assignedToId = assigned;

    const items = await issues.find(query).sort({ createdAt: -1 }).toArray();
    res.json({ issues: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const issues = collections.issues();
    const issue = await issues.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (req.user.role !== "admin" && issue.reporterId !== req.user.id) {
      return res.status(403).json({ message: "You can only view your own reports" });
    }
    res.json({ issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body || {};
    if (!title || title.trim().length < 8) return res.status(400).json({ message: "Title must be at least 8 characters" });
    if (!description || description.trim().length < 10) return res.status(400).json({ message: "Description must be at least 10 characters" });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: "Please choose a valid category" });
    if (!location || location.trim().length < 3) return res.status(400).json({ message: "Please specify a location within the school" });
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ message: "Please choose a valid priority level" });

    const counters = collections.counters();
    const counterDoc = await counters.findOneAndUpdate(
      { _id: "issue" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    const issueId = `ISS-${counterDoc.seq}`;
    const now = new Date().toISOString();

    const issue = {
      id: issueId,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      priority,
      status: "Pending",
      assignedToId: null,
      assignedToName: null,
      assignedToType: null,
      reporterId: req.user.id,
      reporterName: req.user.name,
      reporterRole: req.user.role,
      school: req.user.school,
      schoolId: req.user.schoolId,
      images: [],
      progressImages: [],
      estimatedResolution: "3 days",
      resolvedAt: null,
      timeline: [{ action: "Issue reported and logged in the system", at: now, by: req.user.name }],
      createdAt: now,
      updatedAt: now,
    };
    const issues = collections.issues();
    await issues.insertOne(issue);
    await pushNotification(null, req.user.id, "pending", `Issue ${issueId} logged`, `Your report "${issue.title}" was received and is pending review.`, issueId);
    // Notify all admins about new issue
    await pushNotification(null, null, "pending", `New issue reported: ${issueId}`, `${req.user.name} reported "${issue.title}" (${priority} priority) at ${location}.`, issueId, { targetRole: "admin" });

    res.status(201).json({ issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || text.trim().length < 2) return res.status(400).json({ message: "Comment text is required" });
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can post updates on issues" });
    }

    const issues = collections.issues();
    const issue = await issues.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    const entry = { action: text.trim(), at: new Date().toISOString(), by: req.user.name };
    await issues.updateOne(
      { id: req.params.id },
      { $push: { timeline: entry }, $set: { updatedAt: entry.at } }
    );
    const updated = await issues.findOne({ id: req.params.id });
    res.status(201).json({ issue: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/remind", requireAuth, async (req, res) => {
  try {
    const issues = collections.issues();
    const issue = await issues.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (req.user.role !== "admin" && issue.reporterId !== req.user.id) {
      return res.status(403).json({ message: "You can only remind about your own reports" });
    }
    if (issue.status === "Resolved") return res.status(400).json({ message: "This issue is already resolved" });

    const lastReminder = [...(issue.timeline || [])]
      .filter((t) => /^Reminder sent/.test(t.action))
      .sort((a, b) => new Date(b.at) - new Date(a.at))[0];
    if (lastReminder && Date.now() - new Date(lastReminder.at).getTime() < 24 * 3600 * 1000) {
      return res.status(429).json({ message: "A reminder was already sent in the last 24 hours" });
    }

    const now = new Date().toISOString();
    const entry = { action: `Reminder sent to administration for pending repair`, at: now, by: req.user.name };
    await issues.updateOne(
      { id: req.params.id },
      { $push: { timeline: entry }, $set: { updatedAt: now } }
    );

    // Notify all admins about the reminder (shared notification visible to all admins)
    await pushNotification(null, null, "pending", `Reminder: ${issue.id} still pending`, `${req.user.name} reminded about "${issue.title}" (${issue.priority} priority, reported ${new Date(issue.createdAt).toLocaleDateString()}).`, issue.id, { targetRole: "admin" });

    const updated = await issues.findOne({ id: req.params.id });
    res.json({ issue: updated, reminded: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;