import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";

dotenv.config();

const app = express();

/**
 * Middlewares
 */
app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/db-health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.status(200).json({ db: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ db: "error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Available at your primary URL https://retail-backend-uewv.onrender.com
