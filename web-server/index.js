import express from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { registerAllHandlers } from "./handlers.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "dyad-web-secret-change-in-production",
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session is created
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Simple in-memory storage for demo (replace with database in production)
const sessionStorage = new Map();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: "web",
    version: "0.7.5",
    activeConnections: sessionStorage.size,
  });
});

// Register all IPC handlers
registerAllHandlers(app, sessionStorage);

// Serve demo page
app.get("/demo", (req, res) => {
  res.sendFile(path.join(__dirname, "demo.html"));
});

// Server-Sent Events endpoint for streaming responses
app.get("/api/events/:channel", (req, res) => {
  const { channel } = req.params;

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log(`[API] SSE connected: ${channel}`);

  // Send a test message every 30 seconds to keep connection alive
  const keepAliveInterval = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 30000);

  // Clean up on close
  req.on("close", () => {
    console.log(`[API] SSE disconnected: ${channel}`);
    clearInterval(keepAliveInterval);
  });
});

// Create HTTP server
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Dyad Web Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
