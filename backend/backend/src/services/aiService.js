// src/services/aiService.js

import axios from "axios";
import OpenAI from "openai";

import modelService from "./modelService.js";
import buildSystemPrompt from "../prompts/systemPrompt.js";


const groqApiKey =
  process.env.GROQ_API_KEY;

const openaiApiKey =
  process.env.OPENAI_API_KEY;

const removeBgApiKey =
  process.env.REMOVE_BG_API_KEY;

const assemblyApiKey =
  process.env.ASSEMBLYAI_API_KEY;

const elevenApiKey =
  process.env.ELEVENLABS_API_KEY;


const openai =
  openaiApiKey
    ? new OpenAI({
        apiKey: openaiApiKey,
      })
    : null;


// ======================================================
// GROQ CHAT
// ======================================================

export async function callGroqAI(
  userMessage,
  userName = "User",
  conversationHistory = [],
  memories = []
) {
  try {

    if (!groqApiKey) {
      throw new Error(
        "GROQ_API_KEY is missing."
      );
    }


    const messages = [
      {
        role: "system",
        content:
          buildSystemPrompt(
            userName,
            memories
          ),
      },
    ];


    if (
      Array.isArray(
        conversationHistory
      )
    ) {
      messages.push(
        ...conversationHistory
      );
    }


    messages.push({
      role: "user",
      content:
        userMessage,
    });


    console.log(
      "🤖 Sending request to Groq..."
    );


    const response =
      await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model:
            modelService.getModel(),

          messages,

          temperature:
            modelService.getTemperature(),

          max_tokens:
            modelService.getMaxTokens(),
        },
        {
          headers: {
            Authorization:
              `Bearer ${groqApiKey}`,

            "Content-Type":
              "application/json",
          },

          timeout:
            60000,
        }
      );


    return (
      response.data?.choices?.[0]
        ?.message?.content ||
      "I couldn't generate a response."
    );

  } catch (error) {

    console.error(
      "❌ GROQ ERROR STATUS:",
      error.response?.status
    );

    console.error(
      "❌ GROQ ERROR DATA:",
      error.response?.data
    );

    console.error(
      "❌ GROQ ERROR MESSAGE:",
      error.message
    );


    if (
      error.code === "EAI_AGAIN"
    ) {

      throw new Error(
        "Unable to connect to Groq. Please check your internet or DNS connection and try again."
      );

    }


    throw new Error(
      error.response?.data?.error
        ?.message ||
      error.message ||
      "Groq request failed."
    );
  }
}



// ======================================================
// IMAGE GENERATION
// ======================================================

export async function generateImage(
  prompt
) {
  try {

    if (
      !prompt ||
      !prompt.trim()
    ) {
      throw new Error(
        "Image prompt is required."
      );
    }


    const encodedPrompt =
      encodeURIComponent(
        prompt.trim()
      );


    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodedPrompt}` +
      `?width=1024` +
      `&height=1024` +
      `&seed=${Date.now()}` +
      `&model=flux`;


    return {
      success: true,
      imageUrl,
    };

  } catch (error) {

    console.error(
      "❌ Image Generation Error:",
      error
    );


    return {
      success: false,

      error:
        error.message ||
        "Failed to generate image.",
    };
  }
}



// ======================================================
// IMAGE UNDERSTANDING / VISION
// ======================================================

export async function analyzeImage(
  imageBase64,
  userMessage =
    "Describe this image in detail."
) {
  try {

    if (!groqApiKey) {
      throw new Error(
        "GROQ_API_KEY is missing."
      );
    }


    if (!imageBase64) {
      throw new Error(
        "No image was provided."
      );
    }


    const response =
      await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model:
            process.env.GROQ_VISION_MODEL ||
            "meta-llama/llama-4-scout-17b-16e-instruct",

          messages: [
            {
              role: "system",

              content:
                "You are Cupid's vision system. Analyze images accurately and do not invent details that are not visible.",
            },

            {
              role: "user",

              content: [
                {
                  type: "text",

                  text:
                    userMessage ||
                    "Describe this image in detail.",
                },

                {
                  type:
                    "image_url",

                  image_url: {
                    url:
                      imageBase64,
                  },
                },
              ],
            },
          ],

          temperature:
            0.4,

          max_tokens:
            2048,
        },
        {
          headers: {
            Authorization:
              `Bearer ${groqApiKey}`,

            "Content-Type":
              "application/json",
          },

          timeout:
            60000,
        }
      );


    const result =
      response.data?.choices?.[0]
        ?.message?.content;


    if (!result) {
      throw new Error(
        "Vision model returned no response."
      );
    }


    return {
      success: true,
      text: result,
    };

  } catch (error) {

    console.error(
      "❌ Vision Error:",
      error.response?.data ||
      error.message
    );


    return {
      success: false,

      error:
        error.response?.data?.error
          ?.message ||
        error.message ||
        "Failed to analyze image.",
    };
  }
}



// ======================================================
// REMOVE BACKGROUND
// ======================================================

export async function removeBackground(
  imageUrl
) {
  try {

    if (!removeBgApiKey) {
      return {
        success: false,

        error:
          "REMOVE_BG_API_KEY missing",
      };
    }


    if (!imageUrl) {
      return {
        success: false,

        error:
          "Image URL is required.",
      };
    }


    const response =
      await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        {
          image_url:
            imageUrl,

          size:
            "auto",
        },
        {
          headers: {
            "X-Api-Key":
              removeBgApiKey,
          },

          responseType:
            "arraybuffer",
        }
      );


    const base64 =
      Buffer.from(
        response.data
      ).toString(
        "base64"
      );


    return {
      success: true,

      imageUrl:
        `data:image/png;base64,${base64}`,
    };

  } catch (error) {

    console.error(
      "❌ Remove BG Error:",
      error.response?.data ||
      error.message
    );


    return {
      success: false,

      error:
        "Failed to remove background.",
    };
  }
}



// ======================================================
// SPEECH TO TEXT (FIXED - AssemblyAI)
// ======================================================

export async function transcribeAudio(
  audioBuffer
) {
  try {

    if (!assemblyApiKey) {
      return {
        success: false,

        error:
          "ASSEMBLYAI_API_KEY is missing.",
      };
    }


    if (
      !audioBuffer ||
      !Buffer.isBuffer(
        audioBuffer
      ) ||
      audioBuffer.length === 0
    ) {
      return {
        success: false,

        error:
          "Invalid or empty audio file.",
      };
    }


    console.log(
      "🎤 Uploading audio to AssemblyAI..."
    );


    console.log(
      "🎤 Audio buffer size:",
      audioBuffer.length
    );


    // =========================================
    // UPLOAD AUDIO
    // =========================================

    const uploadResponse =
      await axios.post(
        "https://api.assemblyai.com/v2/upload",

        audioBuffer,

        {
          headers: {
            authorization:
              assemblyApiKey,

            "Content-Type":
              "application/octet-stream",
          },

          maxBodyLength:
            Infinity,

          maxContentLength:
            Infinity,

          timeout:
            120000,
        }
      );


    const audioUrl =
      uploadResponse.data?.upload_url;


    if (!audioUrl) {
      throw new Error(
        "AssemblyAI did not return an audio URL."
      );
    }


    console.log(
      "✅ Audio uploaded to AssemblyAI."
    );


    // =========================================
    // CREATE TRANSCRIPTION - FIXED!
    // =========================================

    const transcriptResponse =
      await axios.post(
        "https://api.assemblyai.com/v2/transcript",

        {
          audio_url:
            audioUrl,

          // ✅ FIX: Use speech_models array instead of speech_model
          speech_models: ["universal-3-5-pro", "universal-2"],

          language_code:
            "en",
        },

        {
          headers: {
            authorization:
              assemblyApiKey,

            "Content-Type":
              "application/json",
          },

          timeout:
            60000,
        }
      );


    const transcriptId =
      transcriptResponse.data?.id;


    if (!transcriptId) {
      throw new Error(
        "AssemblyAI did not create a transcript."
      );
    }


    console.log(
      "📝 Transcript ID:",
      transcriptId
    );


    let result;

    let attempts = 0;

    const maxAttempts =
      90;


    // =========================================
    // WAIT FOR TRANSCRIPTION
    // =========================================

    while (
      attempts <
      maxAttempts
    ) {

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            2000
          )
      );


      attempts++;


      result =
        await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,

          {
            headers: {
              authorization:
                assemblyApiKey,
            },

            timeout:
              30000,
          }
        );


      const status =
        result.data?.status;


      console.log(
        "📝 Transcription status:",
        status
      );


      if (
        status ===
        "completed"
      ) {

        return {
          success: true,

          text:
            result.data?.text ||
            "",
        };

      }


      if (
        status ===
        "error"
      ) {

        throw new Error(
          result.data?.error ||
          "AssemblyAI transcription failed."
        );

      }

    }


    throw new Error(
      "Transcription timed out."
    );

  } catch (error) {

    console.error(
      "❌ AssemblyAI Error:",
      error.response?.data ||
      error.message
    );


    return {
      success: false,

      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to transcribe audio.",
    };
  }
}



// ======================================================
// TEXT TO SPEECH
// ======================================================

export async function textToSpeech(
  text,
  voicePreference =
    "female"
) {
  try {

    if (!elevenApiKey) {
      return {
        success: false,

        error:
          "ELEVENLABS_API_KEY is missing.",
      };
    }


    if (
      !text ||
      !text.trim()
    ) {
      return {
        success: false,

        error:
          "Text is required for speech.",
      };
    }


    const voices = {
      female:
        "21m00Tcm4TlvDq8ikWAM",

      male:
        "pNInz6obpgDQGcFmaJgB",
    };


    const voice =
      voicePreference ===
      "male"
        ? "male"
        : "female";


    const voiceId =
      voices[voice];


    console.log(
      "🔊 ElevenLabs voice:",
      voice,
      voiceId
    );


    const response =
      await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,

        {
          text:
            text.trim(),

          model_id:
            "eleven_multilingual_v2",

          voice_settings: {
            stability:
              0.5,

            similarity_boost:
              0.75,
          },
        },

        {
          headers: {
            "xi-api-key":
              elevenApiKey,

            Accept:
              "audio/mpeg",

            "Content-Type":
              "application/json",
          },

          responseType:
            "arraybuffer",

          timeout:
            60000,
        }
      );


    const audio =
      Buffer.from(
        response.data
      ).toString(
        "base64"
      );


    return {
      success: true,

      audio,

      mimeType:
        "audio/mpeg",

      voice,
    };

  } catch (error) {

    const status =
      error.response?.status;


    let elevenError =
      "Failed to generate speech.";


    // =========================================
    // HANDLE ELEVENLABS 402
    // =========================================

    if (
      status === 402
    ) {

      elevenError =
        "Cupid's premium voice service is currently unavailable because the ElevenLabs account has no available credits.";

    } else if (
      error.response?.data
    ) {

      try {

        const rawData =
          Buffer.isBuffer(
            error.response.data
          )
            ? error.response.data.toString()
            : error.response.data;


        const parsed =
          typeof rawData ===
          "string"
            ? JSON.parse(
                rawData
              )
            : rawData;


        elevenError =
          parsed?.detail?.message ||
          parsed?.detail?.code ||
          parsed?.message ||
          elevenError;

      } catch {
        elevenError =
          error.message ||
          elevenError;
      }

    }


    console.error(
      "❌ ElevenLabs Error:",
      {
        status,
        error:
          elevenError,
      }
    );


    return {
      success: false,

      status,

      error:
        elevenError,
    };
  }
}