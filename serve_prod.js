import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Proxy /api and /health requests directly to port 5000 while preserving exact path
app.use(
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
    pathFilter: ["/api", "/health"],
  })
);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, "dist")));

// Fallback to index.html for single page application routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`==================================================`);
  console.log(`🚀 DiabeGuide Unified App Server running on port ${PORT}`);
  console.log(`👉 Static files served from dist/`);
  console.log(`👉 /api and /health proxied to http://localhost:5000`);
  console.log(`==================================================`);
});
