// src/routes/voiceRoutes.js

import express from "express";
import multer from "multer";

import {
  transcribeVoice,
  speak,
} from "../controllers/voiceController.js";


const router =
  express.Router();


const upload =
  multer({

    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        25 * 1024 * 1024,
    },

  });


// ======================================================
// SPEECH TO TEXT
// ======================================================

router.post(

  "/transcribe",

  upload.single(
    "audio"
  ),

  transcribeVoice

);


// ======================================================
// TEXT TO SPEECH
// ======================================================

router.post(

  "/speak",

  speak

);


export default router;