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

import {
  errorHandler,
} from "./src/middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5001;

// ============================================
// MIDDLEWARE
// ============================================

const allowedOrigins = [
  "https://cupid-ew8y.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// Explicitly handle CORS preflight requests
app.options("*", cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
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
  try {
    const forwardedFor = req.headers["x-forwarded-for"];

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    // Render/proxy environments can provide local/private IPs.
    // In that case, let ip-api determine the location from the
    // public request instead of sending a private IP.
    const url =
      ip &&
      ip !== "unknown" &&
      !ip.startsWith("10.") &&
      !ip.startsWith("192.168.") &&
      !ip.startsWith("127.") &&
      !ip.startsWith("::1")
        ? `http://ip-api.com/json/${ip}?fields=status,city,regionName,country,timezone`
        : "http://ip-api.com/json/?fields=status,city,regionName,country,timezone";

    const response = await fetch(url);

    const data = await response.json();

    if (data.status === "success") {
      return res.json({
        city: data.city || "Unknown",
        region: data.regionName || "Unknown",
        country: data.country || "Unknown",
        timezone: data.timezone || "UTC",
      });
    }

    return res.json({
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      timezone: "UTC",
    });
  } catch (error) {
    console.error("Location error:", error);

    return res.json({
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      timezone: "UTC",
    });
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
// 404 API HANDLER
// IMPORTANT: THIS MUST COME AFTER ALL ROUTES
// ============================================

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
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
      console.log(`Cupid is listening on port ${PORT}`);
      console.log(`Health check: /api/health`);
    });
  })
  .catch((error) => {
    console.error(
      "Failed to connect to database:",
      error
    );

    process.exit(1);
  });
