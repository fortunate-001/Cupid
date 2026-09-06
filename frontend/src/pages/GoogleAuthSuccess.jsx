import {
  useEffect,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


function GoogleAuthSuccess() {

  const navigate =
    useNavigate();


  const [
    searchParams,
  ] =
    useSearchParams();


  const {
    loginWithGoogle,
  } =
    useAuth();


  useEffect(() => {

    const token =
      searchParams.get(
        "token"
      );


    if (!token) {

      navigate(
        "/?google=failed",
        {
          replace: true,
        }
      );

      return;

    }


    const authenticate =
      async () => {

        try {

          await loginWithGoogle(
            token
          );


          navigate(
            "/chat",
            {
              replace: true,
            }
          );


        } catch (error) {

          console.error(
            "Google login error:",
            error
          );


          navigate(
            "/?google=failed",
            {
              replace: true,
            }
          );

        }

      };


    authenticate();


  }, [

    searchParams,

    loginWithGoogle,

    navigate,

  ]);


  return (

    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",
      }}
    >

      <p>
        Signing you in with Google...
      </p>

    </div>

  );

}


export default
  GoogleAuthSuccess;