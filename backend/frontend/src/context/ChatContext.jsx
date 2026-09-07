// src/context/ChatContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/client";

import {
  useAuth,
} from "./AuthContext";


const ChatContext =
  createContext(null);


// ============================================
// PROVIDER
// ============================================

export function ChatProvider({
  children,
}) {

  const {

    user,

    isGuest,

    loading:
      authLoading,

  } =
    useAuth();


  // ==========================================
  // STATES
  // ==========================================

  const [

    messages,

    setMessages,

  ] =
    useState([]);


  const [

    conversations,

    setConversations,

  ] =
    useState([]);


  const [

    currentSessionId,

    setCurrentSessionId,

  ] =
    useState(null);


  const [

    isLoading,

    setIsLoading,

  ] =
    useState(false);


  const [

    isSending,

    setIsSending,

  ] =
    useState(false);


  const [

    location,

    setLocation,

  ] =
    useState(null);


  const [

    timeInfo,

    setTimeInfo,

  ] =
    useState(null);


  // ==========================================
  // TIME
  // ==========================================

  const updateTime =
    () => {

      const now =
        new Date();


      setTimeInfo({

        date:
          now.toLocaleDateString(),

        time:
          now.toLocaleTimeString(
            [],
            {

              hour:
                "2-digit",

              minute:
                "2-digit",

            }
          ),

        day:
          now.toLocaleDateString(
            [],
            {

              weekday:
                "long",

            }
          ),

      });

    };


  // ==========================================
  // LOCATION
  // ==========================================

  const getLocation =
    async () => {

      try {

        const response =
          await api.get(
            "/location"
          );


        setLocation(
          response.data ||
          null
        );


      } catch (error) {

        console.log(
          "Location unavailable."
        );

      }

    };


  // ==========================================
  // SORT CONVERSATIONS
  // ==========================================

  const sortConversations =
    (
      conversationList
    ) => {

      return [

        ...conversationList,

      ].sort(
        (a, b) => {

          if (
            Boolean(a.pinned) !==
            Boolean(b.pinned)
          ) {

            return a.pinned
              ? -1
              : 1;

          }


          return (

            new Date(
              b.updatedAt ||
              b.createdAt ||
              0
            )

            -

            new Date(
              a.updatedAt ||
              a.createdAt ||
              0
            )

          );

        }
      );

    };


  // ==========================================
  // LOAD CONVERSATIONS
  // ==========================================

  const loadConversations =
    async () => {

      const guestMode =
        sessionStorage.getItem(
          "guest_mode"
        ) === "true";


      const token =
        localStorage.getItem(
          "token"
        );


      if (
        guestMode ||
        isGuest
      ) {

        setConversations([]);

        return [];

      }


      if (
        !token
      ) {

        setConversations([]);

        return [];

      }


      try {

        const response =
          await api.get(
            "/chat/conversations"
          );


        const loadedConversations =
          response.data
            ?.conversations ||
          [];


        const sorted =
          sortConversations(
            loadedConversations
          );


        setConversations(
          sorted
        );


        return sorted;


      } catch (error) {

        console.error(

          "Failed to load conversations:",

          error.response?.data ||
          error.message

        );


        setConversations([]);

        return [];

      }

    };


  // ==========================================
  // INITIAL TIME + LOCATION
  // ==========================================

  useEffect(() => {

    updateTime();

    getLocation();

  }, []);


  // ==========================================
  // UPDATE TIME
  // ==========================================

  useEffect(() => {

    const interval =
      setInterval(

        updateTime,

        60000

      );


    return () =>
      clearInterval(
        interval
      );

  }, []);


  // ==========================================
  // AUTH CHANGED
  // ==========================================

  useEffect(() => {

    if (
      authLoading
    ) {

      return;

    }


    if (
      user &&
      !isGuest
    ) {

      setMessages([]);

      setCurrentSessionId(
        null
      );


      loadConversations();

      return;

    }


    if (
      isGuest
    ) {

      setConversations([]);

      setMessages([]);

      setCurrentSessionId(
        null
      );

      return;

    }


    setConversations([]);

    setMessages([]);

    setCurrentSessionId(
      null
    );


  }, [

    user,

    isGuest,

    authLoading,

  ]);


  // ==========================================
  // LOAD CONVERSATION
  // ==========================================

  const loadConversation =
    async (
      sessionId
    ) => {

      if (
        isGuest
      ) {

        return null;

      }


      if (
        !sessionId
      ) {

        return null;

      }


      try {

        setIsLoading(
          true
        );


        const response =
          await api.get(
            `/chat/conversation/${sessionId}`
          );


        const loadedMessages =
          response.data
            ?.messages ||
          [];


        setMessages(
          loadedMessages
        );


        setCurrentSessionId(
          sessionId
        );


        return response.data;


      } catch (error) {

        console.error(

          "Failed to load conversation:",

          error.response?.data ||
          error.message

        );


        return null;


      } finally {

        setIsLoading(
          false
        );

      }

    };


  // ==========================================
  // IMAGE GENERATION DETECTION
  // ==========================================

  const isImageGenerationRequest =
    (
      text
    ) => {

      const lowerText =
        text.toLowerCase();


      const generationWords = [

        "generate an image",

        "generate image",

        "generate a picture",

        "create an image",

        "create a picture",

        "make an image",

        "make a picture",

        "draw",

        "render",

        "illustrate",

        "visualize",

      ];


      return generationWords.some(
        (
          word
        ) =>
          lowerText.includes(
            word
          )
      );

    };


  // ==========================================
  // IMAGE EDIT DETECTION
  // ==========================================

  const isImageEditRequest =
    (
      text
    ) => {

      const lowerText =
        text.toLowerCase();


      const editWords = [

        "remove the background",

        "remove background",

        "change the background",

        "replace the background",

        "edit the image",

        "edit this image",

        "crop",

        "resize",

        "retouch",

        "remove",

        "add",

        "change",

        "make the",

        "turn the",

        "enhance",

      ];


      return editWords.some(
        (
          word
        ) =>
          lowerText.includes(
            word
          )
      );

    };


  // ==========================================
  // GET LAST IMAGE FROM CHAT
  // ==========================================

  const getLastImage =
    () => {

      for (
        let index =
          messages.length - 1;

        index >= 0;

        index--
      ) {

        const message =
          messages[index];


        if (
          message.isImage &&
          message.imageUrl
        ) {

          return message.imageUrl;

        }

      }


      return null;

    };


  // ==========================================
  // CONVERT DATA URL TO FILE
  // ==========================================

  const dataUrlToFile =
    async (
      dataUrl,
      filename =
        "image.png"
    ) => {

      const response =
        await fetch(
          dataUrl
        );


      const blob =
        await response.blob();


      return new File(

        [blob],

        filename,

        {

          type:
            blob.type ||
            "image/png",

        }

      );

    };


  // ==========================================
  // GENERATE IMAGE
  // ==========================================

  const generateImage =
    async (
      prompt,
      sessionId = null
    ) => {

      try {

        setIsSending(
          true
        );


        const activeSessionId =

          sessionId ||

          currentSessionId ||

          `session_${Date.now()}`;


        // ====================================
        // USER MESSAGE
        // ====================================

        const userMessage = {

          id:
            `user-${Date.now()}`,

          role:
            "user",

          sender:
            "user",

          content:
            prompt,

          text:
            prompt,

          timestamp:
            new Date()
              .toISOString(),

        };


        setMessages(
          (prev) => [

            ...prev,

            userMessage,

          ]
        );


        // ====================================
        // GENERATING MESSAGE
        // ====================================

        const generatingId =
          `generating-${Date.now()}`;


        setMessages(
          (prev) => [

            ...prev,

            {

              id:
                generatingId,

              role:
                "assistant",

              sender:
                "assistant",

              content:
                "🎨 Generating image... Please wait.",

              text:
                "🎨 Generating image... Please wait.",

              timestamp:
                new Date()
                  .toISOString(),

              isGenerating:
                true,

            },

          ]
        );


        // ====================================
        // CALL IMAGE BACKEND
        // ====================================

        const response =
          await api.post(

            "/image/generate",

            {

              prompt,

              sessionId:
                activeSessionId,

            }

          );


        // ====================================
        // REMOVE GENERATING MESSAGE
        // ====================================

        setMessages(
          (prev) =>

            prev.filter(

              (
                message
              ) =>

                message.id !==
                generatingId

            )

        );


        if (
          !response.data
            ?.success
        ) {

          throw new Error(

            response.data
              ?.message ||

            "Image generation failed."

          );

        }


        // ====================================
        // GENERATED IMAGE
        // ====================================

        const imageMessage = {

          id:
            response.data
              ?.messageId ||

            `image-${Date.now()}`,

          role:
            "assistant",

          sender:
            "assistant",

          content:
            response.data
              ?.revisedPrompt ||

            prompt,

          text:
            response.data
              ?.revisedPrompt ||

            prompt,

          imageUrl:
            response.data
              ?.imageUrl,

          isImage:
            true,

          timestamp:
            new Date()
              .toISOString(),

        };


        setMessages(
          (prev) => [

            ...prev,

            imageMessage,

          ]
        );


        setCurrentSessionId(
          activeSessionId
        );


        if (

          !isGuest &&

          localStorage.getItem(
            "token"
          )

        ) {

          await loadConversations();

        }


        return response.data;


      } catch (error) {

        console.error(

          "❌ Image generation failed:",

          error.response?.data ||
          error.message

        );


        throw error;


      } finally {

        setIsSending(
          false
        );

      }

    };


  // ==========================================
  // EDIT IMAGE
  // ==========================================

  const editImage =
    async (
      prompt,
      imageUrl,
      sessionId = null
    ) => {

      try {

        setIsSending(
          true
        );


        const activeSessionId =

          sessionId ||

          currentSessionId ||

          `session_${Date.now()}`;


        // ====================================
        // USER REQUEST
        // ====================================

        const userMessage = {

          id:
            `user-${Date.now()}`,

          role:
            "user",

          sender:
            "user",

          content:
            prompt,

          text:
            prompt,

          timestamp:
            new Date()
              .toISOString(),

        };


        setMessages(
          (prev) => [

            ...prev,

            userMessage,

          ]
        );


        // ====================================
        // GENERATING STATE
        // ====================================

        const generatingId =
          `editing-${Date.now()}`;


        setMessages(
          (prev) => [

            ...prev,

            {

              id:
                generatingId,

              role:
                "assistant",

              sender:
                "assistant",

              content:
                "🎨 Editing image... Please wait.",

              text:
                "🎨 Editing image... Please wait.",

              timestamp:
                new Date()
                  .toISOString(),

              isGenerating:
                true,

            },

          ]
        );


        // ====================================
        // CONVERT BASE64 / DATA URL TO FILE
        // ====================================

        const imageFile =
          await dataUrlToFile(
            imageUrl
          );


        const formData =
          new FormData();


        formData.append(
          "image",
          imageFile
        );


        formData.append(
          "prompt",
          prompt
        );


        formData.append(
          "sessionId",
          activeSessionId
        );


        // ====================================
        // CALL EDIT ENDPOINT
        // ====================================

        const response =
          await api.post(

            "/image/edit",

            formData,

            {

              headers: {

                "Content-Type":
                  "multipart/form-data",

              },

            }

          );


        // ====================================
        // REMOVE LOADING MESSAGE
        // ====================================

        setMessages(
          (prev) =>

            prev.filter(

              (
                message
              ) =>

                message.id !==
                generatingId

            )

        );


        if (
          !response.data
            ?.success
        ) {

          throw new Error(

            response.data
              ?.message ||

            "Image editing failed."

          );

        }


        // ====================================
        // SHOW EDITED IMAGE
        // ====================================

        setMessages(
          (prev) => [

            ...prev,

            {

              id:
                response.data
                  ?.messageId ||

                `edited-${Date.now()}`,

              role:
                "assistant",

              sender:
                "assistant",

              content:
                response.data
                  ?.revisedPrompt ||

                prompt,

              text:
                response.data
                  ?.revisedPrompt ||

                prompt,

              imageUrl:
                response.data
                  ?.imageUrl,

              isImage:
                true,

              timestamp:
                new Date()
                  .toISOString(),

            },

          ]
        );


        setCurrentSessionId(
          activeSessionId
        );


        if (

          !isGuest &&

          localStorage.getItem(
            "token"
          )

        ) {

          await loadConversations();

        }


        return response.data;


      } catch (error) {

        console.error(

          "❌ Image editing failed:",

          error.response?.data ||
          error.message

        );


        throw error;


      } finally {

        setIsSending(
          false
        );

      }

    };


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage =
    async (

      text,

      sessionId = null,

      isVoice = false,

      imageUrl = null

    ) => {


      if (
        !text?.trim()
      ) {

        return null;

      }


      try {

        // ====================================
        // IF THERE IS AN IMAGE URL
        // ====================================

        if (
          imageUrl
        ) {

          const imageMessage = {

            id:
              `user-image-${Date.now()}`,

            role:
              "user",

            sender:
              "user",

            content:
              text,

            text:
              text,

            imageUrl,

            isImage:
              true,

            timestamp:
              new Date()
                .toISOString(),

          };


          setMessages(
            (prev) => [

              ...prev,

              imageMessage,

            ]
          );


          setCurrentSessionId(

            sessionId ||

            currentSessionId ||

            `session_${Date.now()}`

          );


          return {

            success:
              true,

            imageUrl,

          };

        }


        // ====================================
        // CHECK FOR IMAGE EDIT REQUEST
        // ====================================

        const lastImage =
          getLastImage();


        if (

          lastImage &&

          isImageEditRequest(
            text
          )

        ) {

          return await editImage(

            text,

            lastImage,

            sessionId

          );

        }


        // ====================================
        // CHECK FOR IMAGE GENERATION
        // ====================================

        if (
          isImageGenerationRequest(
            text
          )
        ) {

          return await generateImage(

            text,

            sessionId

          );

        }


        // ====================================
        // NORMAL CHAT
        // ====================================

        setIsSending(
          true
        );


        const userMessage = {

          id:
            `user-${Date.now()}`,

          role:
            "user",

          sender:
            "user",

          content:
            text,

          text:
            text,

          timestamp:
            new Date()
              .toISOString(),

          isVoice,

        };


        setMessages(
          (prev) => [

            ...prev,

            userMessage,

          ]
        );


        const response =
          await api.post(

            "/chat/send",

            {

              message:
                text,

              sessionId:

                sessionId ||

                currentSessionId ||

                null,


              location,

              timeInfo,

              isVoice,

            }

          );


        if (
          response.data
        ) {

          const assistantMessage = {

            id:
              response.data.messageId ||

              `assistant-${Date.now()}`,

            role:
              "assistant",

            sender:
              "assistant",

            content:
              response.data.message ||
              "",

            text:
              response.data.message ||
              "",

            timestamp:
              new Date()
                .toISOString(),

            imageUrl:
              response.data.imageUrl ||
              null,

            isImage:
              response.data.isImage ||
              false,

            isVoice:
              response.data.isVoice ||
              false,

          };


          setMessages(
            (prev) => [

              ...prev,

              assistantMessage,

            ]
          );


          if (
            response.data
              ?.sessionId
          ) {

            setCurrentSessionId(

              response.data
                .sessionId

            );

          }


          if (

            !isGuest &&

            localStorage.getItem(
              "token"
            )

          ) {

            await loadConversations();

          }


          return response.data;

        }


        return null;


      } catch (error) {

        console.error(

          "Failed to send message:",

          error.response?.data ||
          error.message

        );


        throw error;


      } finally {

        setIsSending(
          false
        );

      }

    };


  // ==========================================
  // NEW CHAT
  // ==========================================

  const newChat =
    () => {

      setMessages([]);

      setCurrentSessionId(
        null
      );

    };


  // ==========================================
  // DELETE CONVERSATION
  // ==========================================

  const deleteConversation =
    async (
      sessionId
    ) => {

      if (
        isGuest ||
        !sessionId
      ) {

        return false;

      }


      try {

        await api.delete(
          `/chat/conversation/${sessionId}`
        );


        setConversations(
          (prev) =>

            prev.filter(

              (
                conversation
              ) =>

                conversation
                  .sessionId !==
                sessionId

            )

        );


        if (

          currentSessionId ===
          sessionId

        ) {

          setMessages([]);

          setCurrentSessionId(
            null
          );

        }


        return true;


      } catch (error) {

        console.error(

          "Failed to delete conversation:",

          error.response?.data ||
          error.message

        );


        return false;

      }

    };


  // ==========================================
  // RENAME CONVERSATION
  // ==========================================

  const renameConversation =
    async (
      sessionId,
      newTitle
    ) => {

      if (

        isGuest ||

        !sessionId ||

        !newTitle?.trim()

      ) {

        return false;

      }


      const trimmedTitle =
        newTitle.trim();


      const previousConversations =
        conversations;


      setConversations(
        (prev) =>

          prev.map(

            (
              conversation
            ) =>

              conversation
                .sessionId ===
              sessionId

                ? {

                    ...conversation,

                    title:
                      trimmedTitle,

                    updatedAt:
                      new Date()
                        .toISOString(),

                  }

                :
                  conversation

          )

      );


      try {

        await api.patch(

          `/chat/conversation/${sessionId}/rename`,

          {

            title:
              trimmedTitle,

          }

        );


        return true;


      } catch (error) {

        console.error(

          "Failed to rename conversation:",

          error.response?.data ||
          error.message

        );


        setConversations(
          previousConversations
        );


        return false;

      }

    };


  // ==========================================
  // PIN / UNPIN
  // ==========================================

  const togglePinConversation =
    async (
      sessionId
    ) => {

      if (
        isGuest ||
        !sessionId
      ) {

        return false;

      }


      try {

        const response =
          await api.patch(
            `/chat/conversation/${sessionId}/pin`
          );


        const pinned =
          Boolean(
            response.data
              ?.pinned
          );


        setConversations(
          (prev) => {

            const updated =
              prev.map(

                (
                  conversation
                ) =>

                  conversation
                    .sessionId ===
                  sessionId

                    ? {

                        ...conversation,

                        pinned,

                        updatedAt:
                          new Date()
                            .toISOString(),

                      }

                    :
                      conversation

              );


            return sortConversations(
              updated
            );

          }
        );


        return true;


      } catch (error) {

        console.error(

          "Failed to pin conversation:",

          error.response?.data ||
          error.message

        );


        return false;

      }

    };


  // ==========================================
  // CLEAR SINGLE CONVERSATION
  // ==========================================

  const clearConversation =
    async (
      sessionId
    ) => {

      if (
        isGuest ||
        !sessionId
      ) {

        return false;

      }


      try {

        await api.delete(
          `/chat/conversation/${sessionId}/clear`
        );


        if (
          currentSessionId ===
          sessionId
        ) {

          setMessages([]);

          setCurrentSessionId(
            null
          );

        }


        setConversations(
          (prev) =>

            prev.filter(

              (
                conversation
              ) =>

                conversation
                  .sessionId !==
                sessionId

            )

        );


        return true;


      } catch (error) {

        console.error(

          "Failed to clear conversation:",

          error.response?.data ||
          error.message

        );


        return false;

      }

    };


  // ==========================================
  // CLEAR ALL CONVERSATIONS
  // ==========================================

  const clearAllConversations =
    async () => {

      if (
        isGuest
      ) {

        return false;

      }


      try {

        await api.delete(
          "/chat/conversations"
        );


        setConversations([]);

        setMessages([]);

        setCurrentSessionId(
          null
        );


        return true;


      } catch (error) {

        console.error(

          "Failed to clear all conversations:",

          error.response?.data ||
          error.message

        );


        return false;

      }

    };


  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {

    messages,

    setMessages,

    sendMessage,

    generateImage,

    editImage,


    conversations,

    currentSessionId,

    setCurrentSessionId,

    loadConversations,

    loadConversation,

    newChat,

    deleteConversation,

    renameConversation,

    togglePinConversation,

    clearConversation,

    clearAllConversations,


    isLoading,

    isSending,


    location,

    timeInfo,

  };


  return (

    <ChatContext.Provider
      value={value}
    >

      {children}

    </ChatContext.Provider>

  );

}


// ============================================
// useChat
// ============================================

export function useChat() {

  const context =
    useContext(
      ChatContext
    );


  if (
    !context
  ) {

    throw new Error(

      "useChat must be used within ChatProvider"

    );

  }


  return context;

}


// ============================================
// useMessages
// ============================================

export function useMessages() {

  const {

    messages,

    setMessages,

  } =
    useChat();


  return {

    messages,

    setMessages,

  };

}


// ============================================
// useConversations
// ============================================

export function useConversations() {

  const {

    conversations,

    currentSessionId,

    loadConversations,

    loadConversation,

    deleteConversation,

    renameConversation,

    togglePinConversation,

    clearConversation,

    clearAllConversations,

    newChat,

  } =
    useChat();


  return {

    conversations,

    currentSessionId,

    loadConversations,

    loadConversation,

    deleteConversation,

    renameConversation,

    togglePinConversation,

    clearConversation,

    clearAllConversations,

    newChat,

  };

}


// ============================================
// useSendMessage
// ============================================

export function useSendMessage() {

  const {

    sendMessage,

    isSending,

  } =
    useChat();


  return {

    sendMessage,

    isSending,

  };

}


// ============================================
// useLocation
// ============================================

export function useLocation() {

  const {

    location,

    timeInfo,

  } =
    useChat();


  return {

    location,

    timeInfo,

  };

}


// ============================================
// DEFAULT EXPORT
// ============================================

export default
  ChatContext;