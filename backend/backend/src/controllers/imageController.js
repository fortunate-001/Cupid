// backend/src/controllers/imageController.js

import {
  generateImage,
  editImage,
} from "../services/imageService.js";

import Message from "../models/Message.js";

import connectDB from "../../lib/mongodb.js";

import multer from "multer";

import path from "path";

import fs from "fs";


// =========================================
// UPLOAD DIRECTORY
// =========================================

const uploadDir =
  path.join(
    process.cwd(),
    "uploads"
  );


if (
  !fs.existsSync(
    uploadDir
  )
) {

  fs.mkdirSync(
    uploadDir,
    {
      recursive: true,
    }
  );

}


// =========================================
// MULTER STORAGE
// =========================================

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        uploadDir
      );

    },


    filename: (
      req,
      file,
      cb
    ) => {

      const uniqueSuffix =
        `${Date.now()}-${Math.round(
          Math.random() *
          1e9
        )}`;


      cb(
        null,

        `${uniqueSuffix}${path.extname(
          file.originalname
        )}`
      );

    },

  });


// =========================================
// IMAGE UPLOAD
// =========================================

export const upload =
  multer({

    storage,

    limits: {

      fileSize:
        10 *
        1024 *
        1024,

    },


    fileFilter: (
      req,
      file,
      cb
    ) => {

      if (
        file.mimetype.startsWith(
          "image/"
        )
      ) {

        cb(
          null,
          true
        );

      } else {

        cb(
          new Error(
            "Only image files are allowed."
          ),
          false
        );

      }

    },

  });


// =========================================
// UPLOAD IMAGE
// =========================================

export const uploadImage =
  async (
    req,
    res
  ) => {

    try {

      console.log(
        "📸 IMAGE UPLOAD REQUEST"
      );


      await connectDB();


      if (
        !req.file
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "No image file was provided.",

          });

      }


      const {

        message,

        sessionId,

      } =
        req.body;


      // =====================================
      // CONVERT IMAGE TO BASE64
      // =====================================

      const imageBuffer =
        fs.readFileSync(
          req.file.path
        );


      const base64Image =
        imageBuffer.toString(
          "base64"
        );


      const imageData =
        `data:${req.file.mimetype};base64,${base64Image}`;


      const user =
        req.user;


      // =====================================
      // SAVE MESSAGE IF LOGGED IN
      // =====================================

      if (
        user
      ) {

        await Message.create({

          userId:
            user._id,

          role:
            "user",

          content:
            message ||
            "📷 Image uploaded",

          sessionId:
            sessionId ||
            `session_${Date.now()}`,

          isImage:
            true,

          imageUrl:
            imageData,

          imageMetadata: {

            filename:
              req.file.originalname,

            size:
              req.file.size,

            mimetype:
              req.file.mimetype,

          },

        });

      }


      // =====================================
      // DELETE TEMP FILE
      // =====================================

      if (
        fs.existsSync(
          req.file.path
        )
      ) {

        fs.unlinkSync(
          req.file.path
        );

      }


      console.log(
        "✅ IMAGE UPLOADED SUCCESSFULLY"
      );


      return res.json({

        success: true,

        imageUrl:
          imageData,

        filename:
          req.file.originalname,

        size:
          req.file.size,

        mimetype:
          req.file.mimetype,

        message:
          "Image uploaded successfully.",

      });


    } catch (error) {

      console.error(
        "❌ IMAGE UPLOAD ERROR:",
        error
      );


      // Cleanup file if possible

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {

        try {

          fs.unlinkSync(
            req.file.path
          );

        } catch (
          cleanupError
        ) {

          console.error(
            "⚠️ Cleanup error:",
            cleanupError.message
          );

        }

      }


      return res
        .status(500)
        .json({

          success: false,

          message:
            error.message ||
            "Image upload failed.",

        });

    }

  };


// =========================================
// GENERATE IMAGE
// =========================================

export const createImage =
  async (
    req,
    res
  ) => {

    try {

      await connectDB();


      const {

        prompt,

        sessionId,

      } =
        req.body;


      if (
        !prompt?.trim()
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Image prompt is required.",

          });

      }


      console.log(
        "🎨 GENERATING IMAGE:",
        prompt
      );


      const image =
        await generateImage(
          prompt.trim()
        );


      if (
        !image.success
      ) {

        return res
          .status(500)
          .json({

            success: false,

            message:
              image.error ||
              "Failed to generate image.",

          });

      }


      const user =
        req.user;


      // =====================================
      // SAVE GENERATED IMAGE
      // =====================================

      if (
        user
      ) {

        await Message.create({

          userId:
            user._id,

          role:
            "assistant",

          content:
            image.revisedPrompt ||
            prompt,

          sessionId:
            sessionId ||
            `session_${Date.now()}`,

          isImage:
            true,

          imageUrl:
            image.imageUrl,

          imageMetadata: {

            generated:
              true,

            prompt,

          },

        });


        // Prevent usage undefined errors

        if (
          !user.usage
        ) {

          user.usage =
            {};

        }


        user.usage.totalImagesGenerated =
          (
            user.usage
              .totalImagesGenerated ||
            0
          ) +
          1;


        await user.save();

      }


      return res.json({

        success: true,

        imageUrl:
          image.imageUrl,

        revisedPrompt:
          image.revisedPrompt,

      });


    } catch (error) {

      console.error(
        "❌ IMAGE GENERATION CONTROLLER ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            error.message ||
            "Image generation failed.",

        });

    }

  };


// =========================================
// EDIT IMAGE
// =========================================

export const editUploadedImage =
  async (
    req,
    res
  ) => {

    try {

      await connectDB();


      if (
        !req.file
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Please upload an image to edit.",

          });

      }


      const {

        prompt,

        sessionId,

      } =
        req.body;


      if (
        !prompt?.trim()
      ) {

        if (
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );

        }


        return res
          .status(400)
          .json({

            success: false,

            message:
              "An editing instruction is required.",

          });

      }


      console.log(
        "🖌️ EDITING IMAGE"
      );


      const result =
        await editImage(

          req.file.path,

          prompt.trim()

        );


      // =====================================
      // DELETE TEMP IMAGE
      // =====================================

      if (
        fs.existsSync(
          req.file.path
        )
      ) {

        fs.unlinkSync(
          req.file.path
        );

      }


      if (
        !result.success
      ) {

        return res
          .status(500)
          .json({

            success: false,

            message:
              result.error ||
              "Image editing failed.",

          });

      }


      const user =
        req.user;


      // =====================================
      // SAVE EDITED IMAGE
      // =====================================

      if (
        user
      ) {

        await Message.create({

          userId:
            user._id,

          role:
            "assistant",

          content:
            result.revisedPrompt ||
            prompt,

          sessionId:
            sessionId ||
            `session_${Date.now()}`,

          isImage:
            true,

          imageUrl:
            result.imageUrl,

          imageMetadata: {

            edited:
              true,

            prompt,

          },

        });

      }


      return res.json({

        success: true,

        imageUrl:
          result.imageUrl,

        revisedPrompt:
          result.revisedPrompt,

      });


    } catch (error) {

      console.error(
        "❌ IMAGE EDIT CONTROLLER ERROR:",
        error
      );


      // Cleanup

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {

        try {

          fs.unlinkSync(
            req.file.path
          );

        } catch (
          cleanupError
        ) {

          console.error(
            cleanupError.message
          );

        }

      }


      return res
        .status(500)
        .json({

          success: false,

          message:
            error.message ||
            "Image editing failed.",

        });

    }

  };


// =========================================
// GET USER IMAGES
// =========================================

export const getUserImages =
  async (
    req,
    res
  ) => {

    try {

      await connectDB();


      const user =
        req.user;


      if (
        !user
      ) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Unauthorized",

          });

      }


      const images =
        await Message.find({

          userId:
            user._id,

          isImage:
            true,

        })

          .sort({

            createdAt:
              -1,

          })

          .limit(
            50
          );


      return res.json({

        success: true,

        images:
          images.map(
            (
              image
            ) => ({

              id:
                image._id,

              imageUrl:
                image.imageUrl,

              content:
                image.content,

              createdAt:
                image.createdAt,

            })
          ),

      });


    } catch (error) {

      console.error(
        "❌ GET USER IMAGES ERROR:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            error.message,

        });

    }

  };