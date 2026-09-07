// src/pages/Login.jsx

import React, {
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


export default function Login() {

  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const navigate =
    useNavigate();


  const {
    login,
    continueAsGuest,
  } = useAuth();


  // =========================================
  // LOGIN
  // =========================================

  const handleLogin =
    async (e) => {

      e.preventDefault();

      setError("");

      setLoading(true);


      try {

        await login({
          email:
            email.trim(),

          password,
        });


        navigate(
          "/chat"
        );

      } catch (error) {

        console.error(
          "Login error:",
          error.response?.data ||
            error.message
        );


        setError(

          error.response?.data
            ?.error ||

          error.message ||

          "Login failed. Please try again."

        );

      } finally {

        setLoading(false);

      }

    };


  // =========================================
  // CONTINUE AS GUEST
  // =========================================

  const handleGuest =
    () => {

      continueAsGuest();

      navigate(
        "/chat"
      );

    };


  return (

    <div className="auth-page">

      <div className="auth-container">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="auth-header">

          <h1>
            ✦ Cupid AI
          </h1>

          <p>
            Welcome back
          </p>

        </div>


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div className="auth-error">

            {error}

          </div>

        )}


        {/* =====================================
            LOGIN FORM
        ===================================== */}

        <form
          onSubmit={
            handleLogin
          }
        >


          {/* EMAIL */}

          <input

            type="email"

            placeholder="Email address"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

            autoComplete="email"

            required

            disabled={loading}

          />


          {/* PASSWORD */}

          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            autoComplete="current-password"

            required

            minLength={6}

            disabled={loading}

          />


          {/* LOGIN BUTTON */}

          <button

            type="submit"

            disabled={loading}

          >

            {loading
              ? "Logging in..."
              : "Log In"}

          </button>


        </form>


        {/* =====================================
            SIGNUP LINK
        ===================================== */}

        <p className="auth-switch">

          Don't have an account?

          {" "}

          <Link
            to="/signup"
          >

            Sign Up

          </Link>

        </p>


        {/* =====================================
            DIVIDER
        ===================================== */}

        <div className="guest-divider">

          <span>
            or
          </span>

        </div>


        {/* =====================================
            GUEST BUTTON
        ===================================== */}

        <button

          type="button"

          className="guest-btn"

          onClick={
            handleGuest
          }

          disabled={loading}

        >

          Continue as Guest

        </button>


      </div>

    </div>

  );

}