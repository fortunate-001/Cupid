// src/services/aiService.js - Make sure it accepts conversationHistory
export async function callGroqAI(userMessage, userName = null, conversationHistory = []) {
  try {
    console.log('🤖 Calling Groq API...');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY not found in .env');
      return "Error: API key not configured. Please check your settings.";
    }

    let systemPrompt = `You are Cupid, a helpful AI assistant.

IMPORTANT RULES:
1. If a user asks you to DRAW, CREATE, GENERATE, or IMAGINE an image, DO NOT describe it with words. The system will automatically generate the image.
2. For image requests, just say "🎨 Generating image... Please wait." and the image will appear.
3. For normal conversations, respond naturally and helpfully.
4. Remember what the user said earlier in the conversation - you have access to the conversation history.
5. Use the user's name naturally when they tell you.`;

    if (userName && userName !== 'Guest' && userName !== 'User') {
      systemPrompt += `\n- The user's name is ${userName}. Use it naturally.`;
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // ✅ Add conversation history for memory
    if (conversationHistory && conversationHistory.length > 0) {
      console.log(`📚 Adding ${conversationHistory.length} previous messages for memory`);
      messages.push(...conversationHistory);
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', errorText);
      return "Sorry, I'm having trouble right now. Please try again.";
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('❌ Groq API error:', error);
    return "Oops! Something went wrong. Please try again.";
  }
}