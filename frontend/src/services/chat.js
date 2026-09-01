import api from "../api/client";

/*
=========================================
SEND MESSAGE
=========================================

Supports:

1. Text only
2. Image only
3. Text + image
*/

export const sendMessage = async (
  message,
  sessionId,
  image = null
) => {
  /*
  =========================================
  IMAGE MESSAGE
  =========================================
  */

  if (image) {
    const formData = new FormData();

    formData.append(
      "message",
      message || ""
    );

    if (sessionId) {
      formData.append(
        "sessionId",
        sessionId
      );
    }

    formData.append(
      "image",
      image
    );

    const { data } = await api.post(
      "/chat/send",
      formData
    );

    return data;
  }

  /*
  =========================================
  NORMAL TEXT MESSAGE
  =========================================
  */

  const { data } = await api.post(
    "/chat/send",
    {
      message,
      sessionId,
    }
  );

  return data;
};


/*
=========================================
GET CONVERSATIONS
=========================================
*/

export const getConversations = async () => {
  const { data } = await api.get(
    "/chat/conversations"
  );

  return data.conversations;
};


/*
=========================================
GET SINGLE CONVERSATION
=========================================
*/

export const getConversation = async (
  sessionId
) => {
  const { data } = await api.get(
    `/chat/conversation/${sessionId}`
  );

  return data;
};


/*
=========================================
DELETE CONVERSATION
=========================================
*/

export const deleteConversation = async (
  sessionId
) => {
  const { data } = await api.delete(
    `/chat/conversation/${sessionId}`
  );

  return data;
};


/*
=========================================
CLEAR ALL CONVERSATIONS
=========================================
*/

export const clearConversations = async () => {
  const { data } = await api.delete(
    "/chat/conversations"
  );

  return data;
};