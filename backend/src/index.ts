// cors is used to allow frontend to call backend api
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import comicsRouter from "./routes/comics";
import adminComicsRouter from "./routes/admin-comics";
import { verifyAdmin } from "./middleware/verify-admin";

const app = express();
const port = process.env.PORT || 4000;

// Explicit CORS config - must allow Authorization header for admin routes
app.use(cors({
  origin: true, // reflect the request origin (allows all)
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(express.json());

// health check endpoint - used by frontend to verify backend is running
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use("/api/comics", comicsRouter);
app.use("/api/admin/comics", verifyAdmin, adminComicsRouter);

app.get("/api/admin/session", verifyAdmin, (req, res) => {
  res.json({ email: (req as any).adminEmail });
});

// Global error handler - catches unhandled async throws in route handlers
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR]", err?.message || err);
  console.error(err?.stack);
  res.status(500).json({ error: "Internal server error", detail: err?.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} 🚀`);
});





