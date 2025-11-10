import express from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "dyad-web-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Import the IPC handlers from the main Electron process
// This is a simplified version - in a real implementation, you would
// need to refactor the IPC handlers to be platform-agnostic
let _ipcHandlers;
try {
  // Dynamically import handlers - this will need to be adapted
  // For now, we'll create a placeholder
  _ipcHandlers = {};
} catch (error) {
  console.warn("Could not load IPC handlers:", error.message);
  _ipcHandlers = {};
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", platform: "web" });
});

// Generic invoke endpoint that mimics Electron IPC
app.post("/api/invoke/:channel", async (req, res) => {
  const { channel } = req.params;
  const { args } = req.body;

  console.log(`[API] Invoke: ${channel}`, args);

  try {
    // In a full implementation, this would call the appropriate handler
    // For now, return a placeholder response
    res.json({
      success: true,
      message: `Web API: ${channel} not yet implemented`,
      data: null,
    });
  } catch (error) {
    console.error(`[API] Error in ${channel}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
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
