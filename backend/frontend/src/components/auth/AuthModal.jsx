import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


export default function AuthModal({
  onGuest,
}) {

  const navigate =
    useNavigate();


  const {
    login,
    register,
  } =
    useAuth();


  const [
    mode,
    setMode,
  ] =
    useState("choice");


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  // =========================================
  // RESET FORM
  // =========================================

  const resetForm =
    () => {

      setName("");

      setEmail("");

      setPassword("");

      setError("");

    };


  // =========================================
  // CONTINUE AS GUEST
  // =========================================

  const handleGuest =
    () => {

      onGuest();

      navigate(
        "/chat",
        {
          replace: true,
        }
      );

    };


  // =========================================
  // EMAIL AUTH
  // =========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      setLoading(true);


      try {

        if (
          mode === "login"
        ) {

          await login({
            email,
            password,
          });

        }

        else {

          await register({
            name,
            email,
            password,
          });

        }


        navigate(
          "/chat",
          {
            replace: true,
          }
        );

      }

      catch (error) {

        console.error(
          "Authentication error:",
          error
        );


        setError(

          error.response?.data?.error ||

          error.response?.data?.message ||

          error.message ||

          "Something went wrong."

        );

      }

      finally {

        setLoading(false);

      }

    };


  // =========================================
  // GOOGLE
  // =========================================

  const handleGoogle =
    () => {

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";


      window.location.href =
        `${apiUrl}/auth/google`;

    };


  // =========================================
  // CHOICE SCREEN
  // =========================================

  const renderChoice =
    () => (

      <>

        <div className="auth-modal-header">

          <div className="auth-logo">
            ✦
          </div>


          <h1>
            Welcome to Cupid
          </h1>


          <p>

            Your AI companion is ready.

            Continue as a guest or sign in
            to keep your conversations synced.

          </p>

        </div>


        <div className="auth-actions">


          {/* GOOGLE */}

          <button
            type="button"
            className="auth-btn google"
            onClick={handleGoogle}
          >

            <span className="google-icon">
              G
            </span>

            Continue with Google

          </button>


          {/* EMAIL */}

          <button
            type="button"
            className="auth-btn email"
            onClick={() => {

              resetForm();

              setMode("login");

            }}
          >

            Continue with Email

          </button>


          <div className="auth-divider">

            <span>
              or
            </span>

          </div>


          {/* GUEST */}

          <button
            type="button"
            className="guest-btn"
            onClick={handleGuest}
          >

            Continue as Guest

          </button>

        </div>


        <p className="auth-footer-text">

          You can always create an account later.

        </p>

      </>

    );


  // =========================================
  // EMAIL AUTH
  // =========================================

  const renderEmailAuth =
    () => {

      const isLogin =
        mode === "login";


      return (

        <>

          <button
            type="button"
            className="auth-back"
            onClick={() => {

              resetForm();

              setMode("choice");

            }}
          >

            ← Back

          </button>


          <div className="auth-modal-header">

            <div className="auth-logo">
              ✦
            </div>


            <h1>

              {
                isLogin
                  ? "Welcome back"
                  : "Create your account"
              }

            </h1>


            <p>

              {
                isLogin
                  ? "Log in to continue chatting with Cupid."
                  : "Create your Cupid account and keep your conversations with you."
              }

            </p>

          </div>


          {
            error && (

              <div className="auth-error">

                {error}

              </div>

            )
          }


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >


            {/* NAME */}

            {
              !isLogin && (

                <div className="auth-field">

                  <label>
                    Name
                  </label>


                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              )
            }


            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email
              </label>


              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <label>
                Password
              </label>


              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                minLength={6}
                required
              />


              {
                isLogin && (

                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() =>
                      navigate(
                        "/forgot-password"
                      )
                    }
                  >

                    Forgot password?

                  </button>

                )
              }

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {
                loading
                  ? "Please wait..."
                  : isLogin
                    ? "Log In"
                    : "Create Account"
              }

            </button>

          </form>


          {/* SWITCH */}

          <div className="auth-switch">

            {
              isLogin
                ? "Don't have an account?"
                : "Already have an account?"
            }


            <button
              type="button"
              onClick={() => {

                resetForm();

                setMode(
                  isLogin
                    ? "signup"
                    : "login"
                );

              }}
            >

              {
                isLogin
                  ? " Sign Up"
                  : " Log In"
              }

            </button>

          </div>


          <div className="auth-divider">

            <span>
              or
            </span>

          </div>


          <button
            type="button"
            className="guest-btn secondary"
            onClick={handleGuest}
          >

            Continue as Guest

          </button>

        </>

      );

    };


  return (

    <div className="auth-overlay">

      <div className="auth-modal">

        {
          mode === "choice"
            ? renderChoice()
            : renderEmailAuth()
        }

      </div>

    </div>

  );

}