// src/services/modelService.js

const modelService = {
  getModel() {
    return (
      process.env.GROQ_MODEL ||
      "openai/gpt-oss-120b"
    );
  },

  getTemperature() {
    return Number(
      process.env.AI_TEMPERATURE || 0.7
    );
  },

  getMaxTokens() {
    return Number(
      process.env.AI_MAX_TOKENS || 2048
    );
  },
};

export default modelService;