import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB, getDbStatus } from "./src/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import passRoutes from "./src/routes/passRoutes.js";
import conductorRoutes from "./src/routes/conductorRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import routeRoutes from "./src/routes/routeRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// Security Headers (configured to allow cross-origin script/media if needed)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration supporting credentials (cookies & bearer)
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    credentials: true,
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// Root Health & System Diagnostics Endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    success: true,
    service: "SmartBus Digital Bus Pass & Student Verification System",
    version: "2.0.0",
    status: "healthy",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/conductor", conductorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/notifications", notificationRoutes);

// Catch-all 404 for unknown API paths
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚌 SmartBus Backend API running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Client URL:   http://localhost:5173`);
    console.log(`====================================================`);
  });
};

startServer();
