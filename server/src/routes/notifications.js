import { Router } from "express";
import { collections } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = collections.notifications();
    const items = await notifications
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    const unread = items.filter((n) => !n.read).length;
    res.json({ notifications: items, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const notifications = collections.notifications();
    const n = await notifications.findOne({ id: req.params.id });
    if (!n) return res.status(404).json({ message: "Notification not found" });
    if (n.userId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await notifications.updateOne({ id: req.params.id }, { $set: { read: true } });
    const updated = await notifications.findOne({ id: req.params.id });
    res.json({ notification: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/read-all", requireAuth, async (req, res) => {
  try {
    const notifications = collections.notifications();
    await notifications.updateMany({ userId: req.user.id }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;