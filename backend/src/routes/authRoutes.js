import express from "express";

import jwt from "jsonwebtoken";

import passport from "../config/passport.js";


import {

  signup,

  login,

  forgotPassword,

  resetPasswordConfirm,

  getCurrentUser,

} from "../controllers/authController.js";


const router =
  express.Router();


// ============================================
// NORMAL AUTH
// ============================================

router.post(
  "/signup",
  signup
);


router.post(
  "/login",
  login
);


router.post(
  "/forgot-password",
  forgotPassword
);


router.post(
  "/reset-password",
  resetPasswordConfirm
);


router.get(
  "/me",
  getCurrentUser
);


// ============================================
// GOOGLE AUTH
// ============================================

router.get(

  "/google",

  passport.authenticate(

    "google",

    {

      scope: [

        "profile",

        "email",

      ],

      session:
        false,

    }

  )

);


// ============================================
// GOOGLE CALLBACK
// ============================================

router.get(

  "/google/callback",


  passport.authenticate(

    "google",

    {

      session:
        false,

      failureRedirect:
        `${process.env.FRONTEND_URL}/?google=failed`,

    }

  ),


  async (

    req,

    res

  ) => {


    try {

      const user =
        req.user;


      const token =
        jwt.sign(

          {

            userId:
              user._id,

          },


          process.env.JWT_SECRET,


          {

            expiresIn:
              "7d",

          }

        );


      // ======================================
      // REDIRECT BACK TO REACT
      // ======================================

      const redirectURL =

        `${
          process.env.FRONTEND_URL
        }/auth/google/success` +

        `?token=${
          encodeURIComponent(
            token
          )
        }`;


      return res.redirect(
        redirectURL
      );


    } catch (
      error
    ) {

      console.error(

        "❌ Google callback error:",

        error

      );


      return res.redirect(

        `${
          process.env.FRONTEND_URL
        }/?google=failed`

      );

    }

  }

);


export default
  router;