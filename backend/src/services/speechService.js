// src/services/speechService.js

import fs from "fs";
import axios from "axios";


const ASSEMBLYAI_API_KEY =
  process.env.ASSEMBLYAI_API_KEY;


if (!ASSEMBLYAI_API_KEY) {

  console.warn(
    "⚠️ ASSEMBLYAI_API_KEY is not defined in .env"
  );

}


// =========================================
// UPLOAD AUDIO
// =========================================

const uploadAudio = async (
  filePath
) => {

  try {

    const audioData =
      fs.createReadStream(
        filePath
      );


    const response =
      await axios.post(

        "https://api.assemblyai.com/v2/upload",

        audioData,

        {

          headers: {

            authorization:
              ASSEMBLYAI_API_KEY,

            "transfer-encoding":
              "chunked",

          },

          maxBodyLength:
            Infinity,

          maxContentLength:
            Infinity,

        }

      );


    return response.data.upload_url;

  } catch (error) {

    console.error(
      "❌ Audio upload failed:",
      error.response?.data ||
      error.message
    );


    throw error;

  }

};


// =========================================
// START TRANSCRIPTION
// =========================================

const startTranscription = async (
  audioUrl
) => {

  try {

    // ✅ CORRECT - Using speech_models array
    const transcriptionData = {

      audio_url:
        audioUrl,

      speech_models: [

        "universal-3-5-pro",

        "universal-2",

      ],

      // ✅ Add language code for better accuracy
      language_code: "en",

    };


    console.log(
      "📤 AssemblyAI request:",
      JSON.stringify(transcriptionData, null, 2)
    );


    const response =
      await axios.post(

        "https://api.assemblyai.com/v2/transcript",

        transcriptionData,

        {

          headers: {

            authorization:
              ASSEMBLYAI_API_KEY,

            "Content-Type":
              "application/json",

          },

          timeout: 60000,

        }

      );


    return response.data;

  } catch (error) {

    console.error(
      "❌ Failed to start transcription:",
      error.response?.data ||
      error.message
    );


    throw error;

  }

};


// =========================================
// WAIT FOR TRANSCRIPTION
// =========================================

const waitForTranscription =
  async (
    transcriptId
  ) => {

    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (attempts < maxAttempts) {

      try {

        const response =
          await axios.get(

            `https://api.assemblyai.com/v2/transcript/${transcriptId}`,

            {

              headers: {

                authorization:
                  ASSEMBLYAI_API_KEY,

              },

              timeout: 30000,

            }

          );


        const data =
          response.data;


        console.log(
          `⏳ Transcription status: ${data.status} (attempt ${attempts + 1}/${maxAttempts})`
        );


        // =============================
        // COMPLETED
        // =============================

        if (
          data.status ===
          "completed"
        ) {

          console.log(
            "✅ AssemblyAI transcription completed"
          );


          return (
            data.text ||
            ""
          );

        }


        // =============================
        // ERROR
        // =============================

        if (
          data.status ===
          "error"
        ) {

          throw new Error(

            data.error ||
            "AssemblyAI transcription failed"

          );

        }


        // =============================
        // WAIT
        // =============================

        await new Promise(

          (resolve) =>

            setTimeout(
              resolve,
              1000
            )

        );

        attempts++;

      } catch (error) {

        console.error(
          "❌ Error checking transcription:",
          error.response?.data ||
          error.message
        );


        throw error;

      }

    }

    throw new Error("Transcription timed out after 60 seconds");

  };


// =========================================
// MAIN TRANSCRIBE FUNCTION
// =========================================

export const transcribeAudio =
  async (
    filePath
  ) => {

    try {

      console.log(
        "🎤 Uploading audio to AssemblyAI..."
      );


      const stats =
        fs.statSync(
          filePath
        );


      console.log(
        "🎤 Audio buffer size:",
        stats.size
      );


      // =============================
      // UPLOAD
      // =============================

      const audioUrl =
        await uploadAudio(
          filePath
        );


      console.log(
        "✅ Audio uploaded to AssemblyAI."
      );


      // =============================
      // START
      // =============================

      console.log(
        "📝 Starting transcription..."
      );


      const transcript =
        await startTranscription(
          audioUrl
        );


      console.log(
        "🆔 Transcript ID:",
        transcript.id
      );


      // =============================
      // WAIT
      // =============================

      const text =
        await waitForTranscription(
          transcript.id
        );


      console.log(
        "✅ Transcription:",
        text
      );


      return text;

    } catch (error) {

      console.error(
        "❌ AssemblyAI Error:",
        error.response?.data ||
        error.message
      );


      throw error;

    } finally {

      // =============================
      // DELETE TEMP FILE
      // =============================

      try {

        if (
          fs.existsSync(
            filePath
          )
        ) {

          fs.unlinkSync(
            filePath
          );


          console.log(
            "🗑️ Temporary audio file deleted"
          );

        }

      } catch (error) {

        console.error(
          "⚠️ Could not delete temporary audio:",
          error.message
        );

      }

    }

  };