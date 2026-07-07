// src/controllers/voiceController.js
import { transcribeAudio, textToSpeech } from '../services/aiService.js';
import multer from 'multer';
import { callGroqAI } from '../services/aiService.js';

const upload = multer({ storage: multer.memoryStorage() });

// ---------- SPEECH-TO-TEXT ----------
export const speechToTextController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Processing voice message...');

    const result = await transcribeAudio(req.file.buffer);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    console.log('📝 Transcription:', result.text);

    res.json({
      success: true,
      text: result.text,
    });

  } catch (error) {
    console.error('❌ Speech-to-text error:', error);
    res.status(500).json({ error: 'Failed to process voice message' });
  }
};

// ---------- TEXT-TO-SPEECH ----------
export const textToSpeechController = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide text' });
    }

    console.log('🔊 Text-to-speech request:', text);

    const result = await textToSpeech(text);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      audio: result.audio,
    });

  } catch (error) {
    console.error('❌ Text-to-speech error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
};

// ---------- VOICE CHAT (Speech → AI → Speech) ----------
export const voiceChatController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Voice chat request...');

    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(req.file.buffer);
    if (!transcription.success) {
      return res.status(400).json({ error: 'Failed to transcribe audio' });
    }

    console.log('📝 Transcription:', transcription.text);

    // Step 2: Get AI response
    const aiResponse = await callGroqAI(transcription.text);

    // Step 3: Convert response to speech
    const speech = await textToSpeech(aiResponse);

    res.json({
      success: true,
      transcription: transcription.text,
      response: aiResponse,
      audio: speech.success ? speech.audio : null,
    });

  } catch (error) {
    console.error('❌ Voice chat error:', error);
    res.status(500).json({ error: 'Failed to process voice chat' });
  }
};