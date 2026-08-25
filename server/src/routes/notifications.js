import { Router } from "express";
import { readDb, writeDb } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const db = readDb();
  let items = db.notifications
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unread = items.filter((n) => !n.read).length;
  res.json({ notifications: items, unread });
});

router.patch("/:id/read", requireAuth, (req, res) => {
  const db = readDb();
  const n = db.notifications.find((x) => x.id === req.params.id);
  if (!n) return res.status(404).json({ message: "Notification not found" });
  if (n.userId !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }
  n.read = true;
  writeDb(db);
  res.json({ notification: n });
});

router.post("/read-all", requireAuth, (req, res) => {
  const db = readDb();
  for (const n of db.notifications) {
    if (n.userId === req.user.id) n.read = true;
  }
  writeDb(db);
  res.json({ ok: true });
});

export default router;