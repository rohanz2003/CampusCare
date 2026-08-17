import { Router } from "express";
import bcrypt from "bcryptjs";
import { readDb, writeDb, nextId, publicUser } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", (req, res) => {
  const { name, email, password, role, schoolId, schoolName } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ message: "Full name is required" });
  if (name.trim().length < 3) return res.status(400).json({ message: "Name must be at least 3 characters" });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ message: "A valid email address is required" });
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (!["parent", "teacher", "admin"].includes(role)) return res.status(400).json({ message: "Role must be parent, teacher or admin" });
  if (!schoolId) return res.status(400).json({ message: "Please select your school" });

  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const school = db.schools?.find((s) => s.id === schoolId) || null;
  const userId = nextId(db, "user");
  const user = {
    id: `U${userId}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    role,
    school: school ? school.name : schoolName || "Unregistered School",
    schoolId: schoolId,
    avatarColor: ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"][db.users.length % 5],
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || "").trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.password)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;