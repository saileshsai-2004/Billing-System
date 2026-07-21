import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import billsRoutes from "./routes/billsRoutes";
import settingsRoutes from "./routes/settingsRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/settings", settingsRoutes);

app.listen(PORT, () => {
  console.log(`⚡ Backend server listening on http://localhost:${PORT}`);
});
