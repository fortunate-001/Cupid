// src/controllers/chatController.js

import User from "../models/User.js";
import Message from "../models/Message.js";
import connectDB from "../../lib/mongodb.js";

import {
  callGroqAI,
  analyzeImage,
  generateImage,
} from "../services/aiService.js";

import jwt from "jsonwebtoken";

import Conversation from "../models/Conversation.js";

import {
  getLocationFromIP,
  getLocalTime,
  getFormattedDate,
  getDayOfWeek,
} from "../services/locationService.js";

import {
  getGuestHistory,
  addGuestMessage,
} from "../services/guestMemory.js";

import {
  getAllMemories,
} from "../services/memoryService.js";


// =========================================
// LIMITS
// =========================================

const FREE_LIMIT = 5;

const REGISTERED_FREE_LIMIT = 10;


// =========================================
// GET USER IP
// =========================================

function getUserIP(req) {
  return (
    req.headers[
      "x-forwarded-for"
    ]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown"
  );
}


// =========================================
// GET CONVERSATION HISTORY
// =========================================

async function getConversationHistory(
  userId,
  sessionId,
  limit = 10
) {
  try {
    const messages =
      await Message.find({
        userId,
        sessionId,
      })
        .sort({
          timestamp: -1,
        })
        .limit(limit)
        .lean();

    return messages
      .reverse()
      .map((msg) => ({
        role:
          msg.role,

        content:
          msg.content,
      }));

  } catch (error) {
    console.error(
      "❌ Error fetching conversation history:",
      error
    );

    return [];
  }
}


// =========================================
// SEND MESSAGE
// =========================================

export const sendMessage =
  async (
    req,
    res
  ) => {
    try {

      console.log(
        "📝 Chat request received"
      );

      const {
        message,
        sessionId,
      } = req.body;

      const imageFile =
        req.file;


      // =====================================
      // VALIDATE REQUEST
      // =====================================

      if (
        (!message ||
          !message.trim()) &&
        !imageFile
      ) {
        return res
          .status(400)
          .json({
            error:
              "Please type a message or upload an image.",
          });
      }


      await connectDB();


      // =====================================
      // LOCATION
      // =====================================

      const userIP =
        getUserIP(req);

      console.log(
        "📍 User IP:",
        userIP
      );

      const userLocation =
        await getLocationFromIP(
          userIP
        );

      console.log(
        "📍 Location:",
        userLocation
      );


      // =====================================
      // DATE / TIME
      // =====================================

      const currentTime =
        getLocalTime(
          userLocation.timezone
        );

      const currentDate =
        getFormattedDate(
          userLocation.timezone
        );

      const currentDay =
        getDayOfWeek(
          userLocation.timezone
        );


      // =====================================
      // AUTHENTICATION
      // =====================================

      let user = null;

      let isGuest = true;

      let userName = null;

      let conversationHistory =
        [];

      let userMemories = [];


      const authHeader =
        req.headers.authorization;


      if (
        authHeader &&
        authHeader.startsWith(
          "Bearer "
        )
      ) {
        try {

          const token =
            authHeader.split(
              " "
            )[1];

          const decoded =
            jwt.verify(
              token,
              process.env.JWT_SECRET
            );

          user =
            await User.findById(
              decoded.userId
            );

          if (user) {

            isGuest = false;

            userName =
              user.name;

            console.log(
              "👤 Authenticated user:",
              user.email
            );
          }

        } catch (error) {

          console.log(
            "⚠️ Invalid token, treating as guest"
          );
        }
      }


      if (isGuest) {
        console.log(
          "👤 Guest mode"
        );
      }


      // =====================================
      // SESSION
      // =====================================

      const sessionIdToUse =
        sessionId ||
        `session_${Date.now()}`;


      console.log(
        "Incoming Session:",
        sessionId
      );

      console.log(
        "Using Session:",
        sessionIdToUse
      );


      // =====================================
      // IMAGE → BASE64
      // =====================================

      let imageBase64 =
        null;


      if (imageFile) {

        imageBase64 =
          `data:${imageFile.mimetype};base64,` +
          imageFile.buffer.toString(
            "base64"
          );


        console.log(
          "🖼️ Image received:",
          imageFile.originalname
        );

        console.log(
          "🖼️ Image type:",
          imageFile.mimetype
        );

        console.log(
          "🖼️ Image size:",
          imageFile.size
        );
      }


      // =====================================
      // UPDATE USER LOCATION
      // =====================================

      if (
        !isGuest &&
        user
      ) {

        user.location = {
          city:
            userLocation.city,

          region:
            userLocation.region,

          country:
            userLocation.country,

          timezone:
            userLocation.timezone,

          lastUpdated:
            new Date(),
        };

        await user.save();

        console.log(
          "📍 User location saved"
        );
      }


      // =====================================
      // GUEST HISTORY
      // =====================================

      if (isGuest) {

        conversationHistory =
          getGuestHistory(
            sessionIdToUse
          );

        console.log(
          `📚 Guest history: ${conversationHistory.length} messages`
        );

        addGuestMessage(
          sessionIdToUse,
          {
            role: "user",

            content:
              message ||
              "Analyze this image.",

            timestamp:
              Date.now(),
          }
        );
      }


      // =====================================
      // REGISTERED USER HISTORY
      // =====================================

      if (
        !isGuest &&
        user
      ) {

        conversationHistory =
          await getConversationHistory(
            user._id,
            sessionIdToUse,
            20
          );

        userMemories =
          await getAllMemories(
            user._id
          );

        console.log(
          `📚 Loaded ${conversationHistory.length} chat messages`
        );

        console.log(
          `🧠 Loaded ${userMemories.length} memories`
        );
      }


      // =====================================
      // IMAGE ANALYSIS
      // =====================================

      if (
        imageBase64 &&
        !isGuest &&
        user
      ) {

        console.log(
          "👁️ Image detected — sending to vision model..."
        );


        try {

          const visionResult =
            await analyzeImage(
              imageBase64,

              message?.trim() ||
                "Describe this image in detail."
            );


          if (
            !visionResult.success
          ) {

            return res
              .status(500)
              .json({
                error:
                  visionResult.error ||
                  "Failed to analyze image.",
              });
          }


          const aiResponse =
            visionResult.text;


          // =================================
          // SAVE USER IMAGE MESSAGE
          // =================================

          const userMessage =
            new Message({
              userId:
                user._id,

              role:
                "user",

              content:
                message?.trim() ||
                "Analyze this image.",

              sessionId:
                sessionIdToUse,

              isImage:
                true,

              imageUrl:
                imageBase64,

              timestamp:
                new Date(),

              messageDate:
                currentDate,

              messageTime:
                currentTime,

              dayOfWeek:
                currentDay,

              location: {
                city:
                  userLocation.city,

                region:
                  userLocation.region,

                country:
                  userLocation.country,

                timezone:
                  userLocation.timezone,
              },
            });


          await userMessage.save();


          // =================================
          // SAVE ASSISTANT RESPONSE
          // =================================

          const assistantMessage =
            new Message({
              userId:
                user._id,

              role:
                "assistant",

              content:
                aiResponse,

              sessionId:
                sessionIdToUse,

              timestamp:
                new Date(),

              messageDate:
                currentDate,

              messageTime:
                currentTime,

              dayOfWeek:
                currentDay,

              location: {
                city:
                  userLocation.city,

                region:
                  userLocation.region,

                country:
                  userLocation.country,

                timezone:
                  userLocation.timezone,
              },
            });


          await assistantMessage.save();


          // =================================
          // UPDATE USAGE
          // =================================

          if (
            user.subscription?.tier ===
            "free"
          ) {

            user.usage.freeMessagesUsed =
              (
                user.usage
                  .freeMessagesUsed ||
                0
              ) + 1;
          }


          user.usage.totalMessages =
            (
              user.usage
                .totalMessages ||
              0
            ) + 2;


          user.usage.lastMessageAt =
            new Date();


          await user.save();


          // =================================
          // RETURN
          // =================================

          return res.json({

            message:
              aiResponse,

            messageId:
              "msg_" +
              Date.now(),

            sessionId:
              sessionIdToUse,

            isGuest:
              false,

            isImage:
              false,

            imageAnalyzed:
              true,

            imageUrl:
              imageBase64,

            timestamp: {
              date:
                currentDate,

              time:
                currentTime,

              day:
                currentDay,
            },

            location: {
              city:
                userLocation.city,

              country:
                userLocation.country,
            },

          });


        } catch (error) {

          console.error(
            "❌ Image analysis error:",
            error
          );

          return res
            .status(500)
            .json({
              error:
                "Failed to analyze image.",
            });
        }
      }


      // =====================================
      // IMAGE GENERATION
      // =====================================

      const imageKeywords = [
        "draw",
        "create an image",
        "generate an image",
        "generate image",
        "make an image",
        "image of",
        "picture of",
        "photo of",
        "illustrate",
        "paint",
        "sketch",
        "render",
        "visualize",
      ];


      const isImageRequest =
        message
          ?.toLowerCase()
          .split(" ")
          .length > 0 &&
        imageKeywords.some(
          (keyword) =>
            message
              ?.toLowerCase()
              .includes(
                keyword
              )
        );


      if (
        isImageRequest &&
        !isGuest &&
        user
      ) {

        console.log(
          "🎨 Image generation detected:",
          message
        );


        try {

          const result =
            await generateImage(
              message
            );


          if (
            result.success
          ) {

            // ==============================
            // SAVE USER MESSAGE
            // ==============================

            const userMessage =
              new Message({
                userId:
                  user._id,

                role:
                  "user",

                content:
                  message.trim(),

                sessionId:
                  sessionIdToUse,

                timestamp:
                  new Date(),

                messageDate:
                  currentDate,

                messageTime:
                  currentTime,

                dayOfWeek:
                  currentDay,

                location: {
                  city:
                    userLocation.city,

                  region:
                    userLocation.region,

                  country:
                    userLocation.country,

                  timezone:
                    userLocation.timezone,
                },
              });


            await userMessage.save();


            // ==============================
            // SAVE IMAGE RESPONSE
            // ==============================

            const assistantMessage =
              new Message({
                userId:
                  user._id,

                role:
                  "assistant",

                content:
                  `Generated image: "${message}"`,

                sessionId:
                  sessionIdToUse,

                isImage:
                  true,

                imageUrl:
                  result.imageUrl,

                timestamp:
                  new Date(),

                messageDate:
                  currentDate,

                messageTime:
                  currentTime,

                dayOfWeek:
                  currentDay,

                location: {
                  city:
                    userLocation.city,

                  region:
                    userLocation.region,

                  country:
                    userLocation.country,

                  timezone:
                    userLocation.timezone,
                },
              });


            await assistantMessage.save();


            return res.json({

              message:
                `Here's your generated image.`,

              messageId:
                "msg_" +
                Date.now(),

              sessionId:
                sessionIdToUse,

              isImage:
                true,

              imageUrl:
                result.imageUrl,

              isGuest:
                false,

            });
          }


        } catch (error) {

          console.error(
            "❌ Image generation error:",
            error
          );
        }
      }


      // =====================================
      // SAVE USER TEXT MESSAGE
      // =====================================

      if (
        !isGuest &&
        user
      ) {

        try {

          const userMessage =
            new Message({
              userId:
                user._id,

              role:
                "user",

              content:
                message.trim(),

              sessionId:
                sessionIdToUse,

              timestamp:
                new Date(),

              messageDate:
                currentDate,

              messageTime:
                currentTime,

              dayOfWeek:
                currentDay,

              location: {
                city:
                  userLocation.city,

                region:
                  userLocation.region,

                country:
                  userLocation.country,

                timezone:
                  userLocation.timezone,
              },
            });


          await userMessage.save();

        } catch (
          saveError
        ) {

          console.error(
            "❌ Error saving user message:",
            saveError
          );
        }
      }


      // =====================================
      // CALL GROQ
      // =====================================

      console.log(
        "🤖 Calling Groq with conversation history..."
      );


      const aiResponse =
        await callGroqAI(
          message,
          userName ||
            "User",
          conversationHistory,
          userMemories
        );


      // =====================================
      // GUEST RESPONSE
      // =====================================

      if (isGuest) {

        addGuestMessage(
          sessionIdToUse,
          {
            role:
              "assistant",

            content:
              aiResponse,

            timestamp:
              Date.now(),
          }
        );
      }


      // =====================================
      // SAVE ASSISTANT
      // =====================================

      if (
        !isGuest &&
        user
      ) {

        try {

          const assistantMessage =
            new Message({
              userId:
                user._id,

              role:
                "assistant",

              content:
                aiResponse,

              sessionId:
                sessionIdToUse,

              timestamp:
                new Date(),

              messageDate:
                currentDate,

              messageTime:
                currentTime,

              dayOfWeek:
                currentDay,

              location: {
                city:
                  userLocation.city,

                region:
                  userLocation.region,

                country:
                  userLocation.country,

                timezone:
                  userLocation.timezone,
              },

              tokensUsed:
                45,
            });


          await assistantMessage.save();


          if (
            user.subscription
              ?.tier === "free"
          ) {

            user.usage.freeMessagesUsed =
              (
                user.usage
                  .freeMessagesUsed ||
                0
              ) + 1;
          }


          user.usage.totalMessages =
            (
              user.usage
                .totalMessages ||
              0
            ) + 2;


          user.usage.lastMessageAt =
            new Date();


          await user.save();

        } catch (
          saveError
        ) {

          console.error(
            "❌ Error saving assistant message:",
            saveError
          );
        }
      }


      // =====================================
      // RESPONSE
      // =====================================

      res.json({

        message:
          aiResponse,

        messageId:
          "msg_" +
          Date.now(),

        sessionId:
          sessionIdToUse,

        isGuest:
          isGuest,

        isImage:
          false,

        timestamp: {
          date:
            currentDate,

          time:
            currentTime,

          day:
            currentDay,
        },

        location: {
          city:
            userLocation.city,

          country:
            userLocation.country,
        },

        usage:
          !isGuest &&
          user
            ? {
                freeMessagesUsed:
                  user.usage
                    .freeMessagesUsed ||
                  0,

                totalMessages:
                  user.usage
                    .totalMessages ||
                  0,

                tier:
                  user
                    .subscription
                    ?.tier ||
                  "free",
              }
            : null,
      });

    } catch (error) {

      console.error(
        "❌ Chat error:",
        error
      );

      res
        .status(500)
        .json({
          error:
            "Something went wrong. Please try again!",

          details:
            process.env
              .NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  };


// =========================================
// GET CONVERSATIONS
// =========================================

export const getConversations =
  async (
    req,
    res,
    next
  ) => {
    try {

      await connectDB();

      const user =
        req.user;

      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      const conversations =
        await Conversation.find({
          userId:
            user._id,
        })
          .sort({
            pinned:
              -1,

            updatedAt:
              -1,
          })
          .lean();


      const messageSessions =
        await Message.aggregate([
          {
            $match: {
              userId:
                user._id,
            },
          },

          {
            $group: {
              _id:
                "$sessionId",
            },
          },
        ]);


      const existingConversationIds =
        new Set(
          conversations.map(
            (chat) =>
              chat.sessionId
          )
        );


      for (
        const session of
        messageSessions
      ) {

        if (
          existingConversationIds.has(
            session._id
          )
        ) {
          continue;
        }


        const firstMessage =
          await Message.findOne({
            userId:
              user._id,

            sessionId:
              session._id,

            role:
              "user",
          })
            .sort({
              timestamp:
                1,
            })
            .lean();


        const lastMessage =
          await Message.findOne({
            userId:
              user._id,

            sessionId:
              session._id,
          })
            .sort({
              timestamp:
                -1,
            })
            .lean();


        conversations.push({

          sessionId:
            session._id,

          title:
            firstMessage
              ? firstMessage.content.substring(
                  0,
                  40
                ) +
                (
                  firstMessage
                    .content
                    .length >
                  40
                    ? "..."
                    : ""
                )
              : "New Chat",

          pinned:
            false,

          createdAt:
            firstMessage?.timestamp ||
            new Date(),

          updatedAt:
            lastMessage?.timestamp ||
            new Date(),

          messageCount:
            0,

          lastMessagePreview:
            lastMessage
              ? lastMessage.content.substring(
                  0,
                  60
                ) +
                (
                  lastMessage
                    .content
                    .length >
                  60
                    ? "..."
                    : ""
                )
              : "",
        });
      }


      conversations.sort(
        (a, b) => {

          if (
            a.pinned !==
            b.pinned
          ) {

            return a.pinned
              ? -1
              : 1;
          }

          return (
            new Date(
              b.updatedAt
            ) -
            new Date(
              a.updatedAt
            )
          );
        }
      );


      res.json({
        conversations,
      });

    } catch (
      error
    ) {

      next(error);
    }
  };


// =========================================
// RENAME CONVERSATION
// =========================================

export const renameConversation =
  async (
    req,
    res,
    next
  ) => {

    try {

      await connectDB();

      const user =
        req.user;

      const {
        sessionId,
      } = req.params;

      const {
        title,
      } = req.body;


      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      if (
        !title ||
        !title.trim()
      ) {

        return res
          .status(400)
          .json({
            error:
              "Conversation title is required",
          });
      }


      const conversation =
        await Conversation.findOneAndUpdate(
          {
            userId:
              user._id,

            sessionId,
          },

          {
            title:
              title.trim(),

            updatedAt:
              new Date(),
          },

          {
            new:
              true,

            upsert:
              true,
          }
        );


      res.json({
        message:
          "Conversation renamed successfully",

        conversation,
      });

    } catch (
      error
    ) {

      next(error);
    }
  };


// =========================================
// PIN / UNPIN
// =========================================

export const togglePinConversation =
  async (
    req,
    res,
    next
  ) => {

    try {

      await connectDB();

      const user =
        req.user;

      const {
        sessionId,
      } = req.params;


      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      let conversation =
        await Conversation.findOne({
          userId:
            user._id,

          sessionId,
        });


      if (!conversation) {

        const firstMessage =
          await Message.findOne({
            userId:
              user._id,

            sessionId,

            role:
              "user",
          })
            .sort({
              timestamp:
                1,
            })
            .lean();


        conversation =
          new Conversation({
            userId:
              user._id,

            sessionId,

            title:
              firstMessage
                ? firstMessage.content.substring(
                    0,
                    40
                  )
                : "New Chat",
          });
      }


      conversation.pinned =
        !conversation.pinned;

      conversation.updatedAt =
        new Date();


      await conversation.save();


      res.json({

        message:
          conversation.pinned
            ? "Conversation pinned"
            : "Conversation unpinned",

        pinned:
          conversation.pinned,
      });

    } catch (
      error
    ) {

      next(error);
    }
  };


// =========================================
// CLEAR ONE CONVERSATION
// =========================================

export const clearConversation =
  async (
    req,
    res,
    next
  ) => {

    try {

      await connectDB();

      const user =
        req.user;

      const {
        sessionId,
      } = req.params;


      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      await Message.deleteMany({
        userId:
          user._id,

        sessionId,
      });


      await Conversation.findOneAndUpdate(
        {
          userId:
            user._id,

          sessionId,
        },

        {
          title:
            "New Chat",

          updatedAt:
            new Date(),
        }
      );


      res.json({
        message:
          "Conversation history cleared successfully",
      });

    } catch (
      error
    ) {

      next(error);
    }
  };


// =========================================
// DELETE CONVERSATION
// =========================================

export const deleteConversation =
  async (
    req,
    res,
    next
  ) => {

    try {

      await connectDB();

      const user =
        req.user;

      const {
        sessionId,
      } = req.params;


      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      await Message.deleteMany({
        userId:
          user._id,

        sessionId,
      });


      await Conversation.deleteOne({
        userId:
          user._id,

        sessionId,
      });


      res.json({
        message:
          "Conversation deleted successfully",
      });

    } catch (
      error
    ) {

      next(error);
    }
  };


// =========================================
// GET CONVERSATION
// =========================================

export const getConversation =
  async (
    req,
    res,
    next
  ) => {

    try {

      await connectDB();

      const user =
        req.user;

      const {
        sessionId,
      } = req.params;


      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      const messages =
        await Message.find({
          userId:
            user._id,

          sessionId,
        })
          .sort({
            timestamp:
              1,
          });


      res.json({

        sessionId,

        messages:
          messages.map(
            (msg) => ({
              ...msg._doc,

              timeInfo: {
                date:
                  msg.messageDate,

                time:
                  msg.messageTime,

                day:
                  msg.dayOfWeek,
              },
            })
          ),
      });

    } catch (
      error
    ) {

      console.error(
        "❌ Error getting conversation:",
        error
      );

      next(error);
    }
  };


// =========================================
// CLEAR ALL CONVERSATIONS
// =========================================

export const clearConversations =
  async (
    req,
    res,
    next
  ) => {

    try {

      await connectDB();

      const user =
        req.user;


      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "Authentication required",
          });
      }


      const result =
        await Message.deleteMany({
          userId:
            user._id,
        });


      await Conversation.deleteMany({
        userId:
          user._id,
      });


      res.json({

        message:
          "All conversations cleared successfully",

        deletedCount:
          result.deletedCount,
      });

    } catch (
      error
    ) {

      next(error);
    }
  };


export default {
  sendMessage,

  getConversations,

  getConversation,

  renameConversation,

  togglePinConversation,

  clearConversation,

  deleteConversation,

  clearConversations,
};