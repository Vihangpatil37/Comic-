// cors is used to allow frontend to call backend api
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import comicsRouter from "./routes/comics";
import adminComicsRouter from "./routes/admin-comics";
import { verifyAdmin } from "./middleware/verify-admin";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/comics", comicsRouter);
app.use("/api/admin/comics", verifyAdmin, adminComicsRouter);

app.get("/api/admin/session", verifyAdmin, (req, res) => {
  res.json({ email: (req as any).adminEmail });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

