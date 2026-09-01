import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useFormik,
} from "formik";

import * as Yup from "yup";

import {
  FaRobot,
} from "react-icons/fa";

import {
  toast,
} from "react-hot-toast";

import * as authService
  from "../services/auth.jsx";


function ForgotPassword() {

  const [
    sent,
    setSent,
  ] =
    useState(false);


  const formik =
    useFormik({

      initialValues: {
        email: "",
      },


      validationSchema:

        Yup.object({

          email:

            Yup.string()

              .email(
                "Invalid email"
              )

              .required(
                "Email is required"
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

            await authService
              .forgotPassword(
                values.email
              );


            setSent(true);


            toast.success(
              "Password reset email sent!"
            );

          }

          catch (err) {

            toast.error(

              err.response
                ?.data
                ?.error ||

              "Unable to send reset email"

            );

          }

          finally {

            setSubmitting(false);

          }

        },

    });


  return (

    <div className="forgot-page">

      <div className="forgot-card">


        <div className="login-logo">

          <FaRobot />

        </div>


        {
          !sent

            ? (

              <>

                <h1>
                  Forgot Password?
                </h1>


                <p>

                  Enter your email address
                  and we'll send you a link
                  to reset your password.

                </p>


                <form
                  onSubmit={
                    formik.handleSubmit
                  }
                >

                  <div className="input-group">

                    <label>
                      Email
                    </label>


                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={
                        formik.values.email
                      }
                      onChange={
                        formik.handleChange
                      }
                      onBlur={
                        formik.handleBlur
                      }
                    />


                    {
                      formik.touched.email &&

                      formik.errors.email && (

                        <small className="error">

                          {
                            formik.errors.email
                          }

                        </small>

                      )
                    }

                  </div>


                  <button
                    type="submit"
                    className="forgot-btn"
                    disabled={
                      formik.isSubmitting
                    }
                  >

                    {
                      formik.isSubmitting
                        ? "Sending..."
                        : "Send Reset Link"
                    }

                  </button>

                </form>


                <p className="bottom-text">

                  Remember your password?


                  <Link to="/login">

                    Login

                  </Link>

                </p>

              </>

            )

            : (

              <>

                <h1>
                  Check Your Email
                </h1>


                <p>

                  We've sent a password
                  reset link to:

                </p>


                <p>

                  <strong>

                    {
                      formik.values.email
                    }

                  </strong>

                </p>


                <p>

                  Check your inbox and
                  follow the link to create
                  a new password.

                </p>


                <Link
                  to="/login"
                  className="forgot-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >

                  Back to Login

                </Link>

              </>

            )

        }

      </div>

    </div>

  );

}


export default ForgotPassword;