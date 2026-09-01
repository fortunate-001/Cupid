// src/api/client.js

import axios from "axios";


const api =
  axios.create({

    baseURL:

      import.meta.env
        .VITE_API_URL ||

      "http://localhost:5000/api",

  });


// =========================================
// REQUEST INTERCEPTOR
// =========================================

api.interceptors.request.use(

  (config) => {

    const isGuest =
      sessionStorage.getItem(
        "guest_mode"
      ) === "true";


    const token =
      localStorage.getItem(
        "token"
      );


    // =====================================
    // GUEST MODE
    // =====================================

    if (isGuest) {

      // Never send authentication while
      // guest mode is active.

      if (
        config.headers
      ) {

        delete config.headers
          .Authorization;

      }


    } else if (
      token
    ) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    // =====================================
    // FORM DATA
    // =====================================

    if (
      config.data instanceof
      FormData
    ) {

      delete config.headers[
        "Content-Type"
      ];

    } else {

      config.headers[
        "Content-Type"
      ] =
        "application/json";

    }


    return config;

  },


  (error) =>
    Promise.reject(
      error
    )

);


// =========================================
// RESPONSE INTERCEPTOR
// =========================================

api.interceptors.response.use(

  (response) =>
    response,


  (error) => {

    console.error(

      "API Error:",

      error.response?.status,

      error.response?.data ||
      error.message

    );


    return Promise.reject(
      error
    );

  }

);


export default api;