import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { fileURLToPath } from "node:url";
import { readDb, writeDb } from "./db.js";
import { requireAuth } from "./middleware/auth.js";
import { upload, UPLOAD_DIR } from "./middleware/upload.js";
import authRoutes from "./routes/auth.js";
import issueRoutes from "./routes/issues.js";
import adminRoutes from "./routes/admin.js";
import workerRoutes from "./routes/worker.js";
import notificationRoutes from "./routes/notifications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));

app.post("/api/issues/:id/images", requireAuth, upload.array("images", 4), (req, res) => {
  const db = readDb();
  const issue = db.issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (req.user.role !== "admin" && issue.reporterId !== req.user.id) {
    return res.status(403).json({ message: "You can only attach images to your own reports" });
  }
  const files = req.files.map((f) => `/uploads/${f.filename}`);
  issue.images.push(...files);
  issue.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json({ issue });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "campuscare-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/notifications", notificationRoutes);

const CLIENT_DIST = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
  console.log("Serving built frontend from client/dist at http://localhost:" + PORT);
} else {
  app.get("/", (_req, res) => {
    res
      .status(200)
      .send(
        "CampusCare API is running. Run 'cd client && npm run dev' and open http://localhost:5173, or 'npm run build' in client/ to serve the app from this server."
      );
  });
}

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ message: `Upload error: ${err.message}` });
  if (err.message) return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`CampusCare API running on http://localhost:${PORT}`);
});