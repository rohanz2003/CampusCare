import jwt from "jsonwebtoken";
import { collections } from "../db.js";

export const JWT_SECRET = process.env.JWT_SECRET || "campuscare_super_secret_key_2026";
export const TOKEN_TTL = "7d";

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const users = collections.users();
    users.findOne({ id: payload.id }).then(user => {
      if (!user) return res.status(401).json({ message: "Account no longer exists" });
      req.user = user;
      next();
    }).catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
}