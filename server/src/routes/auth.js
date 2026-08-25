import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { readDb, writeDb, nextId, publicUser } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../lib/mailer.js";

const APP_URL = process.env.APP_URL || "http://localhost:5173";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Roles a user may self-register as. "admin" is intentionally excluded: admin accounts
// cannot be created through public registration, and the approval endpoint refuses to
// approve admins — allowing it here only created un-approvable ghost accounts.
const SELF_REGISTER_ROLES = ["parent", "teacher", "worker"];
export const WORKER_TYPES = [
  { id: "carpenter", label: "Carpenter" },
  { id: "electrician", label: "Electrician" },
  { id: "plumber", label: "Plumber" },
  { id: "sanitation", label: "Sanitation Staff" },
  { id: "general", label: "General Maintenance" },
];

router.post("/register", (req, res) => {
  const { name, email, password, role, schoolId, schoolName, workerType } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ message: "Full name is required" });
  if (name.trim().length < 3) return res.status(400).json({ message: "Name must be at least 3 characters" });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ message: "A valid email address is required" });
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (!SELF_REGISTER_ROLES.includes(role)) return res.status(400).json({ message: "Role must be parent, teacher or worker" });
  if (role === "worker" && !WORKER_TYPES.some((t) => t.id === workerType)) {
    return res.status(400).json({ message: "Workers must choose a valid trade category" });
  }

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
    workerType: role === "worker" ? workerType : null,
    status: "pending",
    school: school ? school.name : schoolName || "Not Specified",
    schoolId: schoolId || null,
    avatarColor: ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"][db.users.length % 5],
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);

  res.status(201).json({
    pending: true,
    message: "Registration submitted. You can sign in once the school administration approves your account.",
    user: publicUser(user),
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || "").trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.password)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (user.status !== "approved") {
    return res
      .status(403)
      .json({
        message:
          user.status === "rejected"
            ? "Your registration was rejected by the school administration. Please contact the admin."
            : "Your account is pending approval. Please wait for the school administration to approve your registration.",
      });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ message: "A valid email address is required" });

  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return res.status(404).json({ message: "No account found with this email address" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  writeDb(db);

  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  let emailed = false;
  let emailError = "";
  try {
    emailed = await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    emailError = err.message;
    console.error("Password reset email failed:", err.message);
  }

  res.json({
    message: emailed
      ? `A password reset link has been sent to ${user.email}. It expires in 1 hour.`
      : emailError
        ? `Email is configured but sending failed (${emailError}). Use the token below to reset your password.`
        : "A password reset link has been generated. Since no email service is configured, use the token below to reset your password.",
    devToken: emailed ? undefined : token,
  });
});

router.post("/reset-password", (req, res) => {
  const { token, password } = req.body || {};
  if (!token) return res.status(400).json({ message: "Reset token is required" });
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

  const db = readDb();
  const user = db.users.find((u) => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now());
  if (!user) return res.status(400).json({ message: "Invalid or expired reset token. Please request a new one." });

  user.password = bcrypt.hashSync(password, 10);
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  writeDb(db);

  res.json({ message: "Password reset successful. You can now sign in with your new password." });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;