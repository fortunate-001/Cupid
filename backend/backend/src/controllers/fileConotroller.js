import multer from "multer";
import path from "path";
import fs from "fs";


// =========================================
// STORAGE
// =========================================

const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        const uploadDir =
          path.join(
            process.cwd(),
            "uploads",
            "files"
          );


        if (
          !fs.existsSync(
            uploadDir
          )
        ) {

          fs.mkdirSync(
            uploadDir,
            {
              recursive:
                true,
            }
          );

        }


        cb(
          null,
          uploadDir
        );

      },


    filename:
      function (
        req,
        file,
        cb
      ) {

        const uniqueName =
          `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}${path.extname(
            file.originalname
          )}`;


        cb(
          null,
          uniqueName
        );

      },

  });


// =========================================
// MULTER
// =========================================

export const fileUpload =
  multer({

    storage,

    limits: {

      fileSize:
        20 * 1024 * 1024,

    },

  });


// =========================================
// UPLOAD FILE
// =========================================

export const uploadFile =
  async (
    req,
    res
  ) => {

    try {

      if (
        !req.file
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "No file uploaded.",

        });

      }


      const fileUrl =
        `/uploads/files/${req.file.filename}`;


      console.log(
        "📁 File uploaded:",
        req.file.originalname
      );


      return res.json({

        success:
          true,

        message:
          "File uploaded successfully.",

        file: {

          name:
            req.file.originalname,

          filename:
            req.file.filename,

          size:
            req.file.size,

          mimetype:
            req.file.mimetype,

          url:
            fileUrl,

        },

      });


    } catch (error) {

      console.error(
        "❌ File upload error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          error.message,

      });

    }

  };