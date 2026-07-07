const modelService = {
  getModel() {
    return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  },

  getTemperature() {
    return Number(process.env.AI_TEMPERATURE || 0.7);
  },

  getMaxTokens() {
    return Number(process.env.AI_MAX_TOKENS || 700);
  },
};

export default modelService;