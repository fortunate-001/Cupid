// backend/src/services/imageService.js

import OpenAI from "openai";
import fs from "fs";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// =========================================
// CHECK API KEY
// =========================================

if (!process.env.OPENAI_API_KEY) {

  console.warn(
    "⚠️ OPENAI_API_KEY is missing from .env"
  );

}


// =========================================
// CONVERT BASE64 TO DATA URL
// =========================================

const createImageDataUrl = (
  base64,
  mimeType = "image/png"
) => {

  if (!base64) {
    return null;
  }


  return `data:${mimeType};base64,${base64}`;

};


// =========================================
// GENERATE IMAGE
// =========================================

export async function generateImage(
  prompt
) {

  try {

    console.log(
      "================================="
    );

    console.log(
      "🎨 IMAGE GENERATION STARTED"
    );

    console.log(
      "Prompt:",
      prompt
    );

    console.log(
      "================================="
    );


    const response =
      await openai.images.generate({

        model: "gpt-image-1",

        prompt,

        size: "1024x1024",

        quality: "medium",

      });


    const image =
      response.data?.[0];


    if (!image) {

      throw new Error(
        "OpenAI did not return an image."
      );

    }


    // =====================================
    // GPT IMAGE MODELS RETURN BASE64 DATA
    // =====================================

    const imageUrl =
      image.b64_json
        ? createImageDataUrl(
            image.b64_json
          )
        : image.url;


    if (!imageUrl) {

      throw new Error(
        "No usable image data was returned."
      );

    }


    console.log(
      "✅ IMAGE GENERATED SUCCESSFULLY"
    );


    return {

      success: true,

      imageUrl,

      revisedPrompt:
        image.revised_prompt ||
        prompt,

    };


  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "❌ IMAGE GENERATION FAILED"
    );

    console.error(
      error.response?.data ||
      error.message ||
      error
    );

    console.error(
      "================================="
    );


    return {

      success: false,

      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Image generation failed.",

    };

  }

}


// =========================================
// EDIT IMAGE
// =========================================

export async function editImage(
  filePath,
  prompt
) {

  try {

    console.log(
      "================================="
    );

    console.log(
      "🖌️ IMAGE EDIT STARTED"
    );

    console.log(
      "Prompt:",
      prompt
    );

    console.log(
      "File:",
      filePath
    );

    console.log(
      "================================="
    );


    const response =
      await openai.images.edit({

        model: "gpt-image-1",

        image:
          fs.createReadStream(
            filePath
          ),

        prompt,

        size: "1024x1024",

        quality: "medium",

      });


    const image =
      response.data?.[0];


    if (!image) {

      throw new Error(
        "OpenAI did not return an edited image."
      );

    }


    const imageUrl =
      image.b64_json
        ? createImageDataUrl(
            image.b64_json
          )
        : image.url;


    if (!imageUrl) {

      throw new Error(
        "No usable edited image was returned."
      );

    }


    console.log(
      "✅ IMAGE EDITED SUCCESSFULLY"
    );


    return {

      success: true,

      imageUrl,

      revisedPrompt:
        image.revised_prompt ||
        prompt,

    };


  } catch (error) {

    console.error(
      "❌ IMAGE EDIT FAILED:",
      error.response?.data ||
      error.message
    );


    return {

      success: false,

      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Image editing failed.",

    };

  }

}