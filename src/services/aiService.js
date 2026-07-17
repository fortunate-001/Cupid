// src/services/aiService.js

import axios from "axios";
import FormData from "form-data";
import OpenAI from "openai";

import modelService from "./modelService.js";
import buildSystemPrompt from "../prompts/systemPrompt.js";

const groqApiKey = process.env.GROQ_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
const elevenApiKey = process.env.ELEVENLABS_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// ======================================================
// GROQ CHAT
// ======================================================

export async function callGroqAI(
  userMessage,
  userName = "User",
  conversationHistory = []
) {
  try {
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is missing.");
    }

    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(userName),
      },
    ];

    if (Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    messages.push({
      role: "user",
      content: userMessage,
    });

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: modelService.getModel(),
        messages,
        temperature: modelService.getTemperature(),
        max_tokens: modelService.getMaxTokens(),
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);

    return "Sorry, I couldn't process your request right now.";
  }
}

// ======================================================
// IMAGE GENERATION
// ======================================================

export async function generateImage(prompt) {
  try {
    if (!openaiApiKey) {
      return {
        success: false,
        error: "OPENAI_API_KEY missing",
      };
    }

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    return {
      success: true,
      imageUrl: image.data[0].url,
    };
  } catch (error) {
    console.error("Image Generation Error:", error.message);

    return {
      success: false,
      error: "Failed to generate image.",
    };
  }
}

// ======================================================
// REMOVE BACKGROUND
// ======================================================

export async function removeBackground(imageUrl) {
  try {
    if (!removeBgApiKey) {
      return {
        success: false,
        error: "REMOVE_BG_API_KEY missing",
      };
    }

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      {
        image_url: imageUrl,
        size: "auto",
      },
      {
        headers: {
          "X-Api-Key": removeBgApiKey,
        },
        responseType: "arraybuffer",
      }
    );

    const base64 = Buffer.from(response.data).toString("base64");

    return {
      success: true,
      imageUrl: `data:image/png;base64,${base64}`,
    };
  } catch (error) {
    console.error("Remove BG Error:", error.message);

    return {
      success: false,
      error: "Failed to remove background.",
    };
  }
}

// ======================================================
// SPEECH TO TEXT
// ======================================================

export async function transcribeAudio(audioBuffer) {
  try {
    if (!assemblyApiKey) {
      return {
        success: false,
        error: "ASSEMBLYAI_API_KEY missing",
      };
    }

    const upload = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      audioBuffer,
      {
        headers: {
          authorization: assemblyApiKey,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    const transcript = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: upload.data.upload_url,
      },
      {
        headers: {
          authorization: assemblyApiKey,
        },
      }
    );

    let completed = false;
    let result;

    while (!completed) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      result = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcript.data.id}`,
        {
          headers: {
            authorization: assemblyApiKey,
          },
        }
      );

      if (result.data.status === "completed") {
        completed = true;
      }

      if (result.data.status === "error") {
        throw new Error(result.data.error);
      }
    }

    return {
      success: true,
      text: result.data.text,
    };
  } catch (error) {
    console.error("AssemblyAI Error:", error.message);

    return {
      success: false,
      error: "Failed to transcribe audio.",
    };
  }
}

// ======================================================
// TEXT TO SPEECH
// ======================================================

export async function textToSpeech(text) {
  try {
    if (!elevenApiKey) {
      return {
        success: false,
        error: "ELEVENLABS_API_KEY missing",
      };
    }

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
      {
        text,
        model_id: "eleven_multilingual_v2",
      },
      {
        headers: {
          "xi-api-key": elevenApiKey,
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const audio = Buffer.from(response.data).toString("base64");

    return {
      success: true,
      audio,
    };
  } catch (error) {
    console.error("ElevenLabs Error:", error.message);

    return {
      success: false,
      error: "Failed to generate speech.",
    };
  }
}