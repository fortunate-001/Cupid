import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/User.js";
import connectDB from "../../lib/mongodb.js";


passport.use(

  new GoogleStrategy(

    {

      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        `${process.env.BACKEND_URL}/api/auth/google/callback`,

    },


    async (

      accessToken,

      refreshToken,

      profile,

      done

    ) => {

      try {

        await connectDB();


        const email =
          profile.emails?.[0]?.value
            ?.toLowerCase();


        if (!email) {

          return done(
            new Error(
              "Google account does not have an email address."
            ),
            null
          );

        }


        let existingUser =
          await User.findOne({
            email,
          });


        // =====================================
        // EXISTING USER
        // =====================================

        if (
          existingUser
        ) {

          return done(
            null,
            existingUser
          );

        }


        // =====================================
        // CREATE GOOGLE USER
        // =====================================

        const newUser =
          await User.create({

            name:
              profile.displayName ||
              "Cupid User",

            email,

            googleId:
              profile.id,


            subscription: {

              tier:
                "free",

              status:
                "active",

              startDate:
                new Date(),

            },


            usage: {

              freeMessagesUsed:
                0,

              totalMessages:
                0,

            },

          });


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