// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 30000,
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If FormData, remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;