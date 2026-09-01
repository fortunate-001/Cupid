// backend/src/routes/imageRoutes.js

import express from "express";


import {

  createImage,

  uploadImage,

  editUploadedImage,

  getUserImages,

  upload,

} from "../controllers/imageController.js";


import auth from "../middleware/authMiddleware.js";


const router =
  express.Router();


// =========================================
// GENERATE IMAGE
// =========================================

router.post(

  "/generate",

  auth,

  createImage

);


// =========================================
// UPLOAD IMAGE
// =========================================

router.post(

  "/upload",

  auth,

  upload.single(
    "image"
  ),

  uploadImage

);


// =========================================
// EDIT IMAGE
// =========================================

router.post(

  "/edit",

  auth,

  upload.single(
    "image"
  ),

  editUploadedImage

);


// =========================================
// GET USER IMAGES
// =========================================

router.get(

  "/",

  auth,

  getUserImages

);


export default router;