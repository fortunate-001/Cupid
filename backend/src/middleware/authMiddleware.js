// src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import connectDB from "../../lib/mongodb.js";

const JWT_SECRET = process.env.JWT_SECRET;

// =========================================
// AUTHENTICATE USER
// =========================================

export const authenticate = async (req, res, next) => {
  try {
    // ✅ Connect to database
    await connectDB();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Find user by ID - THIS IS WHERE THE ERROR HAPPENS
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "User not found. Please log in again.",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token. Please log in again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired. Please log in again.",
      });
    }

    console.error("❌ Auth middleware error:", error);

    return res.status(500).json({
      error: "Internal server error during authentication.",
    });
  }
};

// =========================================
// ✅ SINGLE EXPORT (Remove default export to avoid confusion)
// =========================================
// export default authenticate;  // ← COMMENT THIS OUT OR REMOVE IT

// OR if you want to keep default export, use this:
export default authenticate;