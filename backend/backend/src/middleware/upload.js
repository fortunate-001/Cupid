import multer from "multer";


// =========================================
// STORE FILE IN MEMORY
// =========================================

const storage =
  multer.memoryStorage();


// =========================================
// IMAGE FILTER
// =========================================

const fileFilter =
  (req, file, cb) => {

    if (
      file.mimetype.startsWith(
        "image/"
      )
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only image files are allowed."
        ),
        false
      );
    }
  };


// =========================================
// MULTER CONFIG
// =========================================

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter,
  });


export default upload;