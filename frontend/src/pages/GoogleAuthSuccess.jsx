import {
  useEffect,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  toast,
} from "react-hot-toast";


export default function GoogleAuthSuccess() {


  const navigate =
    useNavigate();


  const [
    searchParams,
  ] =
    useSearchParams();


  useEffect(() => {


    const token =
      searchParams.get(
        "token"
      );


    if (!token) {

      toast.error(
        "Google authentication failed."
      );


      navigate(
        "/",
        {
          replace: true,
        }
      );


      return;

    }


    localStorage.setItem(
      "token",
      token
    );


    // Remove guest mode
    localStorage.removeItem(
      "guest_mode"
    );


    toast.success(
      "Successfully logged in with Google!"
    );


    navigate(
      "/chat",
      {
        replace: true,
      }
    );


  }, [

    navigate,

    searchParams,

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

      Signing you in with Google...

    </div>

  );

}