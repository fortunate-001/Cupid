// src/controllers/voiceController.js

import {
  transcribeAudio,
  textToSpeech,
} from "../services/aiService.js";


// ======================================================
// TRANSCRIBE VOICE
// ======================================================

export const transcribeVoice =
  async (req, res) => {

    try {

      console.log(
        "🎤 Voice transcription request received"
      );


      console.log(
        "📦 Request Content-Type:",
        req.headers["content-type"]
      );


      console.log(
        "📁 Uploaded file:",
        req.file
          ? {
              fieldname:
                req.file.fieldname,

              originalname:
                req.file.originalname,

              mimetype:
                req.file.mimetype,

              size:
                req.file.size,
            }
          : "NO FILE"
      );


      if (!req.file) {

        return res.status(400).json({
          error:
            "No audio file was provided.",

          hint:
            "The audio upload must use multipart/form-data with the field name 'audio'.",
        });

      }


      if (
        !req.file.buffer ||
        req.file.buffer.length === 0
      ) {

        return res.status(400).json({
          error:
            "The uploaded audio file is empty.",
        });

      }


      const result =
        await transcribeAudio(
          req.file.buffer
        );


      if (!result.success) {

        return res.status(500).json({
          error:
            result.error ||
            "Failed to transcribe audio.",
        });

      }


      return res.json({
        success: true,

        text:
          result.text ||
          "",
      });

    } catch (error) {

      console.error(
        "❌ Voice transcription controller error:",
        error
      );


      return res.status(500).json({
        error:
          error.message ||
          "Failed to transcribe audio.",
      });

    }

  };



// ======================================================
// TEXT TO SPEECH
// ======================================================

export const speak =
  async (req, res) => {

    try {

      console.log(
        "🔊 Text-to-speech request received"
      );


      const {
        text,
        voicePreference,
      } = req.body;


      if (
        !text ||
        !text.trim()
      ) {

        return res.status(400).json({
          error:
            "Text is required.",
        });

      }


      const voice =
        voicePreference ===
        "male"
          ? "male"
          : "female";


      console.log(
        "🔊 Selected voice:",
        voice
      );


      const result =
        await textToSpeech(
          text.trim(),
          voice
        );


      if (!result.success) {

        return res.status(
          result.status ||
          500
        ).json({

          error:
            result.error ||
            "Failed to generate speech.",

        });

      }


      return res.json({

        success: true,

        audio:
          result.audio,

        mimeType:
          result.mimeType ||
          "audio/mpeg",

        voice,

      });

    } catch (error) {

      console.error(
        "❌ Text-to-speech controller error:",
        error
      );


      return res.status(500).json({

        error:
          error.message ||
          "Failed to generate speech.",

      });

    }

  };


export default {
  transcribeVoice,
  speak,
};