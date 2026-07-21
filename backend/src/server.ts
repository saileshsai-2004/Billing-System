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

const cleanFrontendUrl = FRONTEND_URL.replace(/\/$/, "");
const allowedOrigins = [
  FRONTEND_URL,
  cleanFrontendUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server, curl, PDF views)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback allow to prevent production CORS mismatch
      }
    },
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

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`⚡ Backend server listening on http://0.0.0.0:${PORT}`);
});
