import process from "node:process";
// Load environment variables immediately if dotenv is available
try {
  const dotenv = await import("dotenv");
  if (dotenv && dotenv.default) {
    dotenv.default.config();
  }
} catch (e) {
  // Environment variables are injected directly by Render in production
}

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import readingsRouter from "./routes/readings.js";
import chatbotRouter from "./routes/chatbot.js";
import reportsRouter from "./routes/reports.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: "*", // Adjust origins in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Enable JSON Body Parser with increased limit for Base64 image payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  next();
});

// Register Api Routes
app.use("/api/auth", authRouter);
app.use("/api/readings", readingsRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/reports", reportsRouter);

// Root & Health check endpoints for Render health checks
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "DiabeGuide API server is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "DiabeGuide API server is running" });
});

const getPort = (): number => {
  if (process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 5000;
};

// Start Server and Database Connection
const startServer = async () => {
  const PORT = getPort();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=============================================`);
    console.log(`DiabeGuide API server running on port ${PORT}`);
    console.log(`Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`=============================================`);
  });

  // Connect to DB asynchronously so port binds instantly on Render
  connectDB().catch(err => {
    console.error("Database connection background error:", err);
  });
};

startServer().catch(err => {
  console.error("Failed to start DiabeGuide API server:", err);
});
