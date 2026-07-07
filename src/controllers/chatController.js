// src/controllers/chatController.js
import User from '../models/User.js';
import Message from '../models/Message.js';
import connectDB from '../../lib/mongodb.js';
import { callGroqAI } from '../services/aiService.js';
import jwt from 'jsonwebtoken';
import { 
  getLocationFromIP, 
  getLocalTime, 
  getFormattedDate, 
  getDayOfWeek 
} from '../services/locationService.js';

const FREE_LIMIT = 5;
const REGISTERED_FREE_LIMIT = 10;

// ---------- GET USER IP ----------
function getUserIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown';
}

// ---------- GET CONVERSATION HISTORY ----------
async function getConversationHistory(userId, sessionId, limit = 10) {
  try {
    const messages = await Message.find({
      userId: userId,
      sessionId: sessionId
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

    return messages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  } catch (error) {
    console.error('❌ Error fetching conversation history:', error);
    return [];
  }
}

// ---------- SEND MESSAGE ----------
export const sendMessage = async (req, res) => {
  try {
    console.log('📝 Chat request received:', req.body);

    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please type a message' });
    }

    await connectDB();

    // ---------- GET USER LOCATION ----------
    const userIP = getUserIP(req);
    console.log('📍 User IP:', userIP);
    
    let userLocation = await getLocationFromIP(userIP);
    console.log('📍 Location:', userLocation);

    // ---------- GET TIME & DATE ----------
    const currentTime = getLocalTime(userLocation.timezone);
    const currentDate = getFormattedDate(userLocation.timezone);
    const currentDay = getDayOfWeek(userLocation.timezone);

    // Get user info from token
    let user = null;
    let isGuest = true;
    let userName = null;
    let conversationHistory = [];

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId);
        if (user) {
          isGuest = false;
          userName = user.name;
          console.log('👤 Authenticated user:', user.email);
        }
      } catch (e) {
        console.log('⚠️ Invalid token, treating as guest');
      }
    }

    if (isGuest) {
      console.log('👤 Guest mode');
    }

    const sessionIdToUse = sessionId || 'session_' + Date.now();

    // ✅ Update user's location if registered
    if (!isGuest && user) {
      user.location = {
        city: userLocation.city,
        region: userLocation.region,
        country: userLocation.country,
        timezone: userLocation.timezone,
        lastUpdated: new Date(),
      };
      await user.save();
      console.log('📍 User location saved');
    }

    // ✅ Get conversation history for memory
    if (!isGuest && user) {
      conversationHistory = await getConversationHistory(user._id, sessionIdToUse, 10);
      console.log(`📚 Loaded ${conversationHistory.length} previous messages for memory`);
    }

    // ---------- CHECK FOR IMAGE COMMANDS ----------
    const imageKeywords = ['draw', 'create', 'generate', 'imagine', 'make an image', 'picture of', 'photo of', 'illustrate', 'visualize', 'paint', 'sketch', 'render'];
    const isImageRequest = imageKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // If image request AND user is registered, generate image
    if (isImageRequest && !isGuest) {
      console.log('🎨 Image generation detected for:', message);
      try {
        const { generateImage } = await import('../services/aiService.js');
        const result = await generateImage(message);
        
        if (result.success) {
          // Save user message
          const userMessage = new Message({
            userId: user._id,
            role: 'user',
            content: message.trim(),
            sessionId: sessionIdToUse,
            timestamp: new Date(),
            messageDate: currentDate,
            messageTime: currentTime,
            dayOfWeek: currentDay,
            location: {
              city: userLocation.city,
              region: userLocation.region,
              country: userLocation.country,
              timezone: userLocation.timezone,
            },
          });
          await userMessage.save();

          // Save image message
          const assistantMessage = new Message({
            userId: user._id,
            role: 'assistant',
            content: `🎨 Generated image: "${message}"`,
            sessionId: sessionIdToUse,
            isImage: true,
            imageUrl: result.imageUrl,
            timestamp: new Date(),
            messageDate: currentDate,
            messageTime: currentTime,
            dayOfWeek: currentDay,
            location: {
              city: userLocation.city,
              region: userLocation.region,
              country: userLocation.country,
              timezone: userLocation.timezone,
            },
          });
          await assistantMessage.save();

          return res.json({
            message: `🎨 Here's your image: "${message}"`,
            messageId: 'msg_' + Date.now(),
            sessionId: sessionIdToUse,
            isImage: true,
            imageUrl: result.imageUrl,
            isGuest: isGuest,
            timestamp: {
              date: currentDate,
              time: currentTime,
              day: currentDay,
            },
            location: {
              city: userLocation.city,
              country: userLocation.country,
            },
          });
        } else {
          console.log('⚠️ Image generation failed, falling back to text');
          // Fall through to normal chat
        }
      } catch (error) {
        console.error('❌ Image generation error:', error);
        // Fall through to normal chat
      }
    }

    // ---------- SAVE USER MESSAGE ----------
    if (!isGuest && user) {
      try {
        const userMessage = new Message({
          userId: user._id,
          role: 'user',
          content: message.trim(),
          sessionId: sessionIdToUse,
          timestamp: new Date(),
          messageDate: currentDate,
          messageTime: currentTime,
          dayOfWeek: currentDay,
          location: {
            city: userLocation.city,
            region: userLocation.region,
            country: userLocation.country,
            timezone: userLocation.timezone,
          },
        });
        await userMessage.save();
        console.log('💾 User message saved with time and location');
      } catch (saveError) {
        console.error('❌ Error saving user message:', saveError);
      }
    }

    // ---------- CALL AI WITH CONVERSATION HISTORY ----------
    console.log('🤖 Calling Groq with conversation history...');
    
    // Add context about time and location to the AI prompt
    const enhancedMessage = `[Current time: ${currentDay}, ${currentDate} at ${currentTime}]
[User location: ${userLocation.city}, ${userLocation.country}]

User says: ${message}`;

    // ✅ Pass conversation history for memory
    const aiResponse = await callGroqAI(enhancedMessage, userName || 'User', conversationHistory);
    console.log('✅ Groq response received');

    // ---------- SAVE ASSISTANT RESPONSE ----------
    if (!isGuest && user) {
      try {
        const assistantMessage = new Message({
          userId: user._id,
          role: 'assistant',
          content: aiResponse,
          sessionId: sessionIdToUse,
          timestamp: new Date(),
          messageDate: currentDate,
          messageTime: currentTime,
          dayOfWeek: currentDay,
          location: {
            city: userLocation.city,
            region: userLocation.region,
            country: userLocation.country,
            timezone: userLocation.timezone,
          },
          tokensUsed: 45,
        });
        await assistantMessage.save();
        console.log('💾 Assistant message saved with time and location');

        if (user.subscription.tier === 'free') {
          user.usage.freeMessagesUsed = (user.usage.freeMessagesUsed || 0) + 1;
        }
        user.usage.totalMessages = (user.usage.totalMessages || 0) + 2;
        user.usage.lastMessageAt = new Date();
        await user.save();
        console.log('📊 User usage updated');
      } catch (saveError) {
        console.error('❌ Error saving assistant message:', saveError);
      }
    }

    console.log('📤 Sending response to frontend');
    res.json({
      message: aiResponse,
      messageId: 'msg_' + Date.now(),
      sessionId: sessionIdToUse,
      isGuest: isGuest,
      isImage: false,
      timestamp: {
        date: currentDate,
        time: currentTime,
        day: currentDay,
      },
      location: {
        city: userLocation.city,
        country: userLocation.country,
      },
      usage: !isGuest && user ? {
        freeMessagesUsed: user.usage.freeMessagesUsed || 0,
        totalMessages: user.usage.totalMessages || 0,
        tier: user.subscription.tier || 'free',
      } : null
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Something went wrong. Please try again!',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ---------- GET CONVERSATIONS ----------
export const getConversations = async (req, res, next) => {
  try {
    await connectDB();
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessions = await Message.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$sessionId', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const conversations = [];
    for (const session of sessions) {
      const firstMessage = await Message.findOne({
        userId: user._id,
        sessionId: session._id,
        role: 'user'
      }).sort({ timestamp: 1 });

      const lastMessage = await Message.findOne({
        userId: user._id,
        sessionId: session._id
      }).sort({ timestamp: -1 });

      conversations.push({
        sessionId: session._id,
        title: firstMessage 
          ? firstMessage.content.substring(0, 40) + (firstMessage.content.length > 40 ? '...' : '')
          : 'New Chat',
        messageCount: session.count,
        lastMessageAt: lastMessage ? lastMessage.timestamp : new Date(),
        lastMessagePreview: lastMessage 
          ? lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '')
          : '',
        timeInfo: lastMessage ? {
          date: lastMessage.messageDate,
          time: lastMessage.messageTime,
          day: lastMessage.dayOfWeek,
        } : null,
        isImage: lastMessage?.isImage || false,
        imageUrl: lastMessage?.imageUrl || null,
      });
    }

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

// ---------- GET CONVERSATION ----------
export const getConversation = async (req, res, next) => {
  try {
    await connectDB();
    const user = req.user;
    const { sessionId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const messages = await Message.find({
      userId: user._id,
      sessionId: sessionId
    }).sort({ timestamp: 1 });

    res.json({
      sessionId,
      messages: messages.map(msg => ({
        ...msg._doc,
        timeInfo: {
          date: msg.messageDate,
          time: msg.messageTime,
          day: msg.dayOfWeek,
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

// ---------- DELETE CONVERSATION ----------
export const deleteConversation = async (req, res, next) => {
  try {
    await connectDB();
    const user = req.user;
    const { sessionId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await Message.deleteMany({
      userId: user._id,
      sessionId: sessionId
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
};