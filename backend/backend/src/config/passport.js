// src/config/passport.js

import dotenv from "dotenv";

import passport from "passport";

import {
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";

import bcrypt from "bcryptjs";

import User from "../models/User.js";

import connectDB from "../../lib/mongodb.js";


// ============================================
// LOAD ENVIRONMENT VARIABLES
// ============================================

dotenv.config();


// ============================================
// GOOGLE OAUTH STRATEGY
// ============================================

passport.use(

  new GoogleStrategy(

    {

      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5001/api/auth/google/callback",

    },


    async (

      accessToken,

      refreshToken,

      profile,

      done

    ) => {

      try {

        // ======================================
        // CONNECT DATABASE
        // ======================================

        await connectDB();


        // ======================================
        // GET GOOGLE EMAIL
        // ======================================

        const email =
          profile.emails?.[0]?.value
            ?.toLowerCase()
            ?.trim();


        if (
          !email
        ) {

          return done(

            new Error(
              "Google account does not have an email address."
            ),

            null

          );

        }


        // ======================================
        // FIND USER BY GOOGLE ID
        // ======================================

        let existingUser =
          await User.findOne({

            googleId:
              profile.id,

          });


        // ======================================
        // GOOGLE USER ALREADY EXISTS
        // ======================================

        if (
          existingUser
        ) {

          existingUser.lastLogin =
            new Date();


          await existingUser.save();


          return done(
            null,
            existingUser
          );

        }


        // ======================================
        // FIND USER BY EMAIL
        // ======================================

        existingUser =
          await User.findOne({

            email,

          });


        // ======================================
        // USER EXISTS WITH SAME EMAIL
        // ======================================

        if (
          existingUser
        ) {

          // Link Google account
          // to the existing Cupid account.

          if (
            !existingUser.googleId
          ) {

            existingUser.googleId =
              profile.id;

          }


          // Save Google profile image
          // if available.

          if (
            !existingUser.avatar &&
            profile.photos?.[0]?.value
          ) {

            existingUser.avatar =
              profile.photos[0].value;

          }


          existingUser.lastLogin =
            new Date();


          await existingUser.save();


          return done(
            null,
            existingUser
          );

        }


        // ======================================
        // CREATE RANDOM PASSWORD
        // ======================================
        //
        // Your User model requires password,
        // so Google users need a hidden password
        // even though they won't use it.

        const randomPassword =
          `google_${profile.id}_${Date.now()}`;


        const hashedPassword =
          await bcrypt.hash(
            randomPassword,
            10
          );


        // ======================================
        // CREATE GOOGLE USER
        // ======================================

        const newUser =
          await User.create({

            name:
              profile.displayName ||
              "Cupid User",


            email,


            password:
              hashedPassword,


            googleId:
              profile.id,


            avatar:
              profile.photos?.[0]?.value ||
              "",


            subscription: {

              tier:
                "free",

              status:
                "active",

              startDate:
                new Date(),

            },


            usage: {

              messages:
                0,

              images:
                0,

              voice:
                0,

              totalMessages:
                0,

              freeMessagesUsed:
                0,

            },


            lastLogin:
              new Date(),

          });


        console.log(

          "✅ New Google user created:",

          newUser.email

        );


        return done(
          null,
          newUser
        );


      } catch (
        error
      ) {

        console.error(

          "❌ Google OAuth Error:",

          error

        );


        return done(
          error,
          null
        );

      }

    }

  )

);


export default passport;