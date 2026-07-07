// src/controllers/imageController.js
import { generateImage, removeBackground } from '../services/aiService.js';
import connectDB from '../../lib/mongodb.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import jwt from 'jsonwebtoken';

// ---------- GENERATE IMAGE ----------
export const generateImageController = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a prompt' });
    }

    console.log('🎨 Image generation request:', prompt);

    const result = await generateImage(prompt);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Save to database
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
          const message = new Message({
            userId: user._id,
            role: 'assistant',
            content: `🎨 Generated image: "${prompt}"\n${result.imageUrl}`,
            sessionId: `image_${Date.now()}`,
            isImage: true,
            imageUrl: result.imageUrl,
          });
          await message.save();
        }
      } catch (e) {
        console.log('⚠️ Could not save image to database');
      }
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      prompt: prompt,
    });

  } catch (error) {
    console.error('❌ Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
};

// ---------- REMOVE BACKGROUND ----------
export const removeBackgroundController = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Please provide an image URL' });
    }

    console.log('✂️ Background removal request:', imageUrl);

    const result = await removeBackground(imageUrl);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      imageUrl: result.imageUrl,
    });

  } catch (error) {
    console.error('❌ Background removal error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
};