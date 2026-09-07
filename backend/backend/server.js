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

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://cupid.vercel.app",
    ],
    credentials: true,
  })
);

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

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/voice",
  voiceRoutes
);

app.use(
  "/api/image",
  imageRoutes
);

app.use(
  "/api/subscription",
  subscriptionRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);

app.use(
  "/api/files",
  fileRoutes
);

// ============================================
// LOCATION
// ============================================

app.get(
  "/api/location",
  async (req, res) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]
          ?.split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,city,regionName,country,timezone`
      );

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
      console.error(
        "Location error:",
        error
      );

      return res.json({
        city: "Unknown",
        region: "Unknown",
        country: "Unknown",
        timezone: "UTC",
      });
    }
  }
);

// ============================================
// HEALTH CHECK
// ============================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      status: "ok",
      message: "Cupid is running!",
      timestamp: new Date().toISOString(),
    });
  }
);

// ============================================
// UPLOADS
// ============================================

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

// ============================================
// 404 API HANDLER
// IMPORTANT: THIS MUST COME AFTER ALL ROUTES
// ============================================

app.use(
  "/api",
  (req, res) => {
    res.status(404).json({
      error: "API endpoint not found",
    });
  }
);

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

connectDB()
  .then(() => {
    app.listen(
      PORT,
      () => {
        console.log(
          `Cupid is listening on port ${PORT}`
        );

        console.log(
          `http://localhost:${PORT}`
        );

        console.log(
          `Health check: http://localhost:${PORT}/api/health`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "Failed to connect to database:",
      error
    );

    process.exit(1);
  });