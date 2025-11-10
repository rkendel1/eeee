import express from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

// Simple in-memory storage for demo (replace with database in production)
const sessionStorage = new Map();

// Helper to get session data
function getSessionData(sessionId) {
  if (!sessionStorage.has(sessionId)) {
    sessionStorage.set(sessionId, {
      settings: {
        selectedModel: { name: "auto", provider: "auto" },
        providerSettings: {},
        telemetryConsent: "unset",
        experiments: {},
      },
      apps: [],
    });
  }
  return sessionStorage.get(sessionId);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: "web",
    version: "0.7.5",
    activeConnections: sessionStorage.size,
  });
});

// Generic invoke endpoint that mimics Electron IPC
app.post("/api/invoke/:channel", async (req, res) => {
  const { channel } = req.params;
  const { args } = req.body;

  console.log(
    `[API] Invoke: ${channel}`,
    args ? JSON.stringify(args).slice(0, 100) : "no args",
  );

  const sessionId = req.session.id;
  const sessionData = getSessionData(sessionId);

  try {
    let result;

    // Implement handlers for demo purposes
    switch (channel) {
      case "get-app-version":
        // Read version from package.json
        const packageJsonPath = path.resolve(__dirname, "..", "package.json");
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8"),
        );
        result = { version: packageJson.version };
        break;

      case "get-user-settings":
        result = sessionData.settings;
        break;

      case "set-user-settings":
        const newSettings = args[0];
        sessionData.settings = { ...sessionData.settings, ...newSettings };
        result = sessionData.settings;
        break;

      case "list-apps":
        result = {
          apps: sessionData.apps,
          appBasePath: "/tmp/dyad-apps",
        };
        break;

      case "get-system-platform":
        result = "web";
        break;

      case "window:minimize":
      case "window:maximize":
      case "window:close":
        // Window operations don't apply to web
        result = {
          success: true,
          message: "Window operations not applicable in web mode",
        };
        break;

      default:
        // For unimplemented handlers, return a descriptive message
        console.log(`[API] Handler not implemented: ${channel}`);
        result = {
          _demo: true,
          message: `Handler '${channel}' not yet implemented in web version`,
          note: "This is a demo showing the infrastructure works. Full implementation requires migrating all IPC handlers.",
        };
    }

    res.json(result);
  } catch (error) {
    console.error(`[API] Error in ${channel}:`, error);
    res.status(500).json({
      error: error.message,
      channel: channel,
    });
  }
});

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
