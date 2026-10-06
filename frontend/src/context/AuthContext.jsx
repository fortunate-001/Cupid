// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import * as authService from "../services/auth.jsx";

const AuthContext = createContext();

// =========================================
// PROVIDER
// =========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const navigate = useNavigate();

  // =========================================
  // LOAD USER
  // =========================================

  useEffect(() => {
    async function loadUser() {
      try {
        // Check guest mode from localStorage
        const guestMode = localStorage.getItem("guest_mode");

        // =====================================
        // GUEST MODE HAS PRIORITY
        // =====================================

        if (guestMode === "true") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setUser(null);
          setIsGuest(true);
          setLoading(false);

          return;
        }

        // =====================================
        // NORMAL AUTHENTICATION
        // =====================================

        const token = localStorage.getItem("token");

        // No token = neither logged in nor guest
        if (!token) {
          setUser(null);
          setIsGuest(false);
          setLoading(false);

          return;
        }

        // =====================================
        // GET CURRENT USER
        // =====================================

        const data = await authService.getCurrentUser();

        if (data?.user) {
          setUser(data.user);
          setIsGuest(false);
        } else {
          // Token might be invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setUser(null);
          setIsGuest(false);
        }
      } catch (error) {
        console.error("Failed to load user:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("guest_mode");

        setUser(null);
        setIsGuest(false);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  const login = async (credentials) => {
    const data = await authService.login(credentials);

    console.log("LOGIN RESPONSE:", data);

    // Remove guest mode
    localStorage.removeItem("guest_mode");

    // Save token
    if (data.token) {
      localStorage.setItem("token", data.token);
    } else {
      console.error("NO TOKEN FOUND IN LOGIN RESPONSE!");
    }

    // Save user
    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
    }

    setIsGuest(false);

    // Navigate to chat
    navigate("/chat");

    return data;
  };

  // =========================================
  // REGISTER
  // =========================================

  const register = async (userData) => {
    const data = await authService.register(userData);

    // Remove guest mode
    localStorage.removeItem("guest_mode");

    // Save token
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    // Save user
    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
    }

    setIsGuest(false);

    // Navigate to chat
    navigate("/chat");

    return data;
  };

  // =========================================
  // CONTINUE AS GUEST
  // =========================================

  const continueAsGuest = () => {
    // Remove previous account data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Enable guest mode
    localStorage.setItem("guest_mode", "true");

    setUser(null);
    setIsGuest(true);

    // Navigate to chat
    navigate("/chat");
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    authService.logout();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guest_mode");

    setUser(null);
    setIsGuest(false);

    // Navigate to home
    navigate("/");
  };

  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const loginWithGoogle = async (token) => {
    try {
      // Remove guest mode
      localStorage.removeItem("guest_mode");

      // Save Google JWT token
      localStorage.setItem("token", token);

      // Get Google user information
      const data = await authService.getCurrentUser();

      if (!data?.user) {
        throw new Error(
          "Unable to get Google user information."
        );
      }

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setIsGuest(false);

      return data;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      throw error;
    }
  };

  // =========================================
  // CONTEXT VALUE
  // =========================================

  const value = {
    user,
    loading,
    isGuest,

    login,
    register,
    continueAsGuest,
    logout,
    loginWithGoogle,

    isAuthenticated: !!user || isGuest,
  };

  // =========================================
  // PROVIDER
  // =========================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =========================================
// HOOK
// =========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};

export default AuthContext;