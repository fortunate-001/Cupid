import React from "react";

import {

  Routes,

  Route,

  Navigate,

} from "react-router-dom";


import AuthModal
  from "./components/auth/AuthModal";

import Login
  from "./pages/Login";

import Signup
  from "./pages/Register";

import ForgotPassword
  from "./pages/ForgotPassword";

import ResetPassword
  from "./pages/ResetPassword";

import Chat
  from "./pages/Chat";

import Settings
  from "./pages/settings";

import {
  useAuth,
} from "./context/AuthContext";

import GoogleAuthSuccess from "./pages/GoogleAuthSuccess"



function PrivateRoute({
  children,
}) {


  const {

    user,

    isGuest,

    loading,

  } =
    useAuth();


  if (
    loading
  ) {

    return null;

  }


  const authenticated =
    user || isGuest;


  return authenticated

    ? children

    : (

      <Navigate
        to="/"
        replace
      />

    );

}



function AppRoutes() {


  const {
    continueAsGuest,
  } =
    useAuth();


  return (

    <Routes>


      {/* AUTH MODAL */}

      <Route

        path="/"

        element={

          <AuthModal
            onGuest={
              continueAsGuest
            }
          />

        }

      />


      {/* LOGIN */}

      <Route

        path="/login"

        element={
          <Login />
        }

      />


      {/* SIGNUP */}

      <Route

        path="/signup"

        element={
          <Signup />
        }

      />


      {/* FORGOT PASSWORD */}

      <Route

        path="/forgot-password"

        element={
          <ForgotPassword />
        }

      />


      {/* RESET PASSWORD */}

      <Route

        path="/reset-password"

        element={
          <ResetPassword />
        }

      />


      {/* CHAT */}

      <Route

        path="/chat"

        element={

          <PrivateRoute>

            <Chat />

          </PrivateRoute>

        }

      />


      {/* SETTINGS */}

      <Route

        path="/settings"

        element={

          <PrivateRoute>

            <Settings />

          </PrivateRoute>

        }

      />


      {/* FALLBACK */}

      <Route

        path="*"

        element={

          <Navigate
            to="/"
            replace
          />

        }

      />


    </Routes>

  );

}



export default function App() {

  return (

    <AppRoutes />

  );

}