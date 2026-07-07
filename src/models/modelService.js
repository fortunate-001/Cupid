// src/services/modelService.js

export const getAIModel = () => {
    return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
};

