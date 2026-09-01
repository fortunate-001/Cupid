import api from "../api/client";


// =========================================
// LOGIN
// =========================================

export async function login(credentials) {

  const response =
    await api.post(
      "/auth/login",
      credentials
    );

  return response.data;

}


// =========================================
// REGISTER
// =========================================

export async function register(userData) {

  const response =
    await api.post(
      "/auth/signup",
      userData
    );

  return response.data;

}


// =========================================
// GET CURRENT USER
// =========================================

export async function getCurrentUser() {

  const response =
    await api.get(
      "/auth/me"
    );

  return response.data;

}


// =========================================
// FORGOT PASSWORD
// =========================================

export async function forgotPassword(email) {

  const response =
    await api.post(
      "/auth/forgot-password",
      {
        email,
      }
    );

  return response.data;

}


// =========================================
// RESET PASSWORD
// =========================================

export async function resetPassword(
  token,
  newPassword
) {

  const response =
    await api.post(
      "/auth/reset-password",
      {
        token,
        newPassword,
      }
    );

  return response.data;

}


// =========================================
// LOGOUT
// =========================================

export function logout() {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "guest_mode"
  );

}