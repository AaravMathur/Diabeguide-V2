import dotenv from "dotenv";
// Load environment variables immediately
dotenv.config();

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
  const portNum = getPort();
  const portsToListen = Array.from(new Set([portNum, 5000, 10000]));

  portsToListen.forEach((p) => {
    try {
      const s = app.listen(p, "0.0.0.0", () => {
        console.log(`=============================================`);
        console.log(`[Server] DiabeGuide API listening on 0.0.0.0:${p}`);
        console.log(`[Health Check] http://0.0.0.0:${p}/health`);
        console.log(`=============================================`);
      });
      s.on("error", (err: any) => {
        console.warn(`[Server Port Notice] Could not bind to port ${p}: ${err.message}`);
      });
    } catch (e) {
      // Ignore bind errors for secondary ports
    }
  });

  // Connect to DB asynchronously so port binds instantly on Render
  connectDB().catch(err => {
    console.error("Database connection background error:", err);
  });
};

startServer().catch(err => {
  console.error("Failed to start DiabeGuide API server:", err);
});
