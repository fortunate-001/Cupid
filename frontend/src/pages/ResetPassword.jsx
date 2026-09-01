import {
  useState,
} from "react";

import {
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  useFormik,
} from "formik";

import * as Yup
  from "yup";

import {

  FaEye,

  FaEyeSlash,

  FaRobot,

} from "react-icons/fa";

import {
  toast,
} from "react-hot-toast";

import * as authService
  from "../services/auth.jsx";


function ResetPassword() {


  const [
    searchParams,
  ] =
    useSearchParams();


  const navigate =
    useNavigate();


  const token =
    searchParams.get(
      "token"
    );


  const [

    showPassword,

    setShowPassword,

  ] =
    useState(false);


  const [

    showConfirmPassword,

    setShowConfirmPassword,

  ] =
    useState(false);


  const formik =
    useFormik({

      initialValues: {

        password: "",

        confirmPassword: "",

      },


      validationSchema:

        Yup.object({

          password:

            Yup.string()

              .min(
                6,
                "Minimum 6 characters"
              )

              .required(
                "Password is required"
              ),


          confirmPassword:

            Yup.string()

              .oneOf(

                [
                  Yup.ref(
                    "password"
                  ),
                ],

                "Passwords must match"

              )

              .required(
                "Please confirm your password"
              ),

        }),


      onSubmit:

        async (

          values,

          {
            setSubmitting,
          }

        ) => {

          try {

            if (!token) {

              toast.error(
                "Invalid or missing reset token."
              );

              return;

            }


            await authService
              .resetPassword(

                token,

                values.password

              );


            toast.success(
              "Password reset successfully!"
            );


            setTimeout(
              () => {

                navigate(
                  "/login"
                );

              },

              1000
            );

          }

          catch (err) {

            toast.error(

              err.response
                ?.data
                ?.error ||

              "Unable to reset password."

            );

          }

          finally {

            setSubmitting(false);

          }

        },

    });


  if (!token) {

    return (

      <div className="reset-page">

        <div className="reset-card">


          <div className="login-logo">

            <FaRobot />

          </div>


          <h1>
            Invalid Link
          </h1>


          <p>

            This password reset link
            is missing or invalid.

          </p>


          <Link

            to="/forgot-password"

            className="reset-btn"

            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}

          >

            Request New Link

          </Link>

        </div>

      </div>

    );

  }


  return (

    <div className="reset-page">

      <div className="reset-card">


        <div className="login-logo">

          <FaRobot />

        </div>


        <h1>
          Reset Password
        </h1>


        <p>

          Create a new password
          for your Cupid account.

        </p>


        <form
          onSubmit={
            formik.handleSubmit
          }
        >


          {/* PASSWORD */}

          <div className="input-group">

            <label>
              New Password
            </label>


            <div className="password-box">

              <input

                name="password"

                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                placeholder="New password"

                value={
                  formik.values.password
                }

                onChange={
                  formik.handleChange
                }

                onBlur={
                  formik.handleBlur
                }

              />


              <button

                type="button"

                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }

              >

                {
                  showPassword

                    ? <FaEyeSlash />

                    : <FaEye />

                }

              </button>

            </div>


            {
              formik.touched.password &&

              formik.errors.password && (

                <small className="error">

                  {
                    formik.errors.password
                  }

                </small>

              )
            }

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="input-group">

            <label>
              Confirm Password
            </label>


            <div className="password-box">

              <input

                name="confirmPassword"

                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }

                placeholder="Confirm password"

                value={
                  formik.values
                    .confirmPassword
                }

                onChange={
                  formik.handleChange
                }

                onBlur={
                  formik.handleBlur
                }

              />


              <button

                type="button"

                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }

              >

                {
                  showConfirmPassword

                    ? <FaEyeSlash />

                    : <FaEye />

                }

              </button>

            </div>


            {
              formik.touched
                .confirmPassword &&

              formik.errors
                .confirmPassword && (

                <small className="error">

                  {
                    formik.errors
                      .confirmPassword
                  }

                </small>

              )
            }

          </div>


          <button

            type="submit"

            className="reset-btn"

            disabled={
              formik.isSubmitting
            }

          >

            {
              formik.isSubmitting
                ? "Resetting..."
                : "Reset Password"
            }

          </button>

        </form>


        <p className="bottom-text">

          Remember your password?


          <Link to="/login">

            Login

          </Link>

        </p>

      </div>

    </div>

  );

}


export default ResetPassword;