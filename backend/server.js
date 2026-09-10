import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./lib/mongodb.js";

import authRoutes from "./src/routes/authRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import imageRoutes from "./src/routes/imageRoutes.js";
import voiceRoutes from "./src/routes/voiceRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";
import fileRoutes from "./src/routes/fileRoutes.js";

import passport from "./src/config/passport.js";

import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Render provides PORT in production.
// Local development uses 5001.
const PORT = process.env.PORT || 5001;

// ============================================
// CORS
// ============================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://cupid-ew8y.vercel.app",
];

// Add FRONTEND_URL from environment if provided
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

  if (!allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
  }
}

console.log("Allowed CORS origins:", allowedOrigins);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel preview deployment for this project
    const vercelPreviewPattern = /^https:\/\/cupid-ew8y-.*-fortunate-001s-projects\.vercel\.app$/;
    if (vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);

    return callback(
      new Error(`Origin ${origin} is not allowed by CORS`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 200,

  maxAge: 86400,
};

app.use(cors(corsOptions));

// ============================================
// BODY PARSING
// ============================================

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// ============================================
// PASSPORT
// ============================================

app.use(passport.initialize());

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/voice", voiceRoutes);

app.use("/api/image", imageRoutes);

app.use("/api/subscription", subscriptionRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/files", fileRoutes);

// ============================================
// LOCATION
// ============================================

app.get("/api/location", async (req, res) => {
  const fallbackLocation = {
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
    timezone: "UTC",
  };

  try {
    const forwardedFor = req.headers["x-forwarded-for"];

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "";

    const isPrivateIp =
      !ip ||
      ip === "unknown" ||
      ip === "::1" ||
      ip.startsWith("127.") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      ip.startsWith("172.") ||
      ip.startsWith("::ffff:127.");

    let locationUrl;

    if (isPrivateIp) {
      locationUrl =
        "http://ip-api.com/json/?fields=status,city,regionName,country,timezone";
    } else {
      locationUrl =
        `http://ip-api.com/json/${encodeURIComponent(
          ip
        )}?fields=status,city,regionName,country,timezone`;
    }

    const response = await fetch(locationUrl);

    if (!response.ok) {
      console.error(
        "Location API HTTP error:",
        response.status,
        response.statusText
      );

      return res.json(fallbackLocation);
    }

    const data = await response.json();

    if (data.status === "success") {
      return res.json({
        city: data.city || "Unknown",
        region: data.regionName || "Unknown",
        country: data.country || "Unknown",
        timezone: data.timezone || "UTC",
      });
    }

    return res.json(fallbackLocation);
  } catch (error) {
    console.error("Location error:", error);

    return res.json(fallbackLocation);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Cupid is running!",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// UPLOADS
// ============================================

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

// ============================================
// API 404 HANDLER
// IMPORTANT:
// THIS MUST COME AFTER ALL API ROUTES
// ============================================

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Cupid is listening on port ${PORT}`
      );

      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );

      console.log(
        "CORS enabled for origins:",
        allowedOrigins
      );
    });
  })
  .catch((error) => {
    console.error(
      "Failed to connect to database:",
      error
    );

    process.exit(1);
  });