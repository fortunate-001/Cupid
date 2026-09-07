// src/services/guestMemory.js

const guestSessions = new Map();


// =========================================
// GET GUEST HISTORY
// =========================================

export function getGuestHistory(sessionId) {

  if (!sessionId) {
    return [];
  }


  if (!guestSessions.has(sessionId)) {

    guestSessions.set(
      sessionId,
      []
    );

  }


  return guestSessions
    .get(sessionId)
    .map((message) => ({

      role:
        message.role,

      content:
        message.content,

    }));

}


// =========================================
// ADD GUEST MESSAGE
// =========================================

export function addGuestMessage(
  sessionId,
  message
) {

  if (!sessionId) {
    return;
  }


  if (!guestSessions.has(sessionId)) {

    guestSessions.set(
      sessionId,
      []
    );

  }


  guestSessions
    .get(sessionId)
    .push({
      ...message,

      timestamp:
        message.timestamp ||
        Date.now(),
    });

}


// =========================================
// CLEAR ONE GUEST SESSION
// =========================================

export function clearGuestSession(
  sessionId
) {

  if (!sessionId) {
    return;
  }


  guestSessions.delete(
    sessionId
  );

}


// =========================================
// CLEAR ALL GUEST SESSIONS
// =========================================

export function clearAllGuestSessions() {

  guestSessions.clear();

}


// =========================================
// CLEANUP OLD SESSIONS
// =========================================

const GUEST_SESSION_LIFETIME =
  1000 *
  60 *
  60;


// Every hour, remove guest sessions that
// have been inactive for more than one hour.

setInterval(() => {

  const now =
    Date.now();


  for (
    const [
      sessionId,
      messages,
    ]
    of guestSessions.entries()
  ) {

    if (!messages.length) {

      guestSessions.delete(
        sessionId
      );

      continue;

    }


    const lastMessage =
      messages[
        messages.length - 1
      ];


    const lastTimestamp =
      lastMessage.timestamp ||
      0;


    if (

      now -
        lastTimestamp >

      GUEST_SESSION_LIFETIME

    ) {

      guestSessions.delete(
        sessionId
      );

    }

  }

}, GUEST_SESSION_LIFETIME);