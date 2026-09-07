import {
  useEffect,
  useRef,
  useState,
} from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

import MessageBubble from "../components/chat/MessageBubble";
import MessageInput from "../components/chat/MessageInput";
import Typing from "../components/chat/Typing";

import AuthModal from "../components/auth/AuthModal";

// ❌ REMOVE these imports - they don't exist anymore
// import SettingsContent from "../components/settings/SettingsContext";
// import SettingsModal from "../components/settings/SettingsModal";

import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export default function Chat() {

  const {
    messages,
    isLoading,
  } = useChat();

  const {
    user,
    isGuest,
    loading: authLoading,
    continueAsGuest,
  } = useAuth();

  const bottomRef = useRef(null);
  const [showAuth, setShowAuth] = useState(false);
  // ❌ Remove settingsOpen state - using navigate instead
  // const [settingsOpen, setSettingsOpen] = useState(false);

  // =========================================
  // GET USER NAME
  // =========================================

  const getFirstName = () => {
    if (!user || isGuest) {
      return null;
    }

    const fullName = user.name || user.username || "";

    if (!fullName) {
      return null;
    }

    return fullName.trim().split(" ")[0];
  };

  const firstName = getFirstName();

  // =========================================
  // SCROLL TO BOTTOM
  // =========================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // =========================================
  // AUTH POPUP
  // =========================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const guest = localStorage.getItem("guest_mode");

    if (user || isGuest || guest === "true") {
      setShowAuth(false);
      return;
    }

    setShowAuth(true);
  }, [user, isGuest, authLoading]);

  // =========================================
  // GUEST
  // =========================================

  const handleGuest = () => {
    continueAsGuest();
    setShowAuth(false);
  };

  // =========================================
  // REMOVE SETTINGS FUNCTIONS - using navigate now
  // =========================================

  return (
    <div className="chat-page">
      <div className={showAuth ? "chat-background blurred" : "chat-background"}>
        <Sidebar />
        <main className="chat-main">
          <Header />

          {/* =====================================
              SCROLLABLE MESSAGE AREA
          ===================================== */}

          <div className="messages">
            {messages.length === 0 ? (
              <div className="welcome">
                <h1>
                  {firstName
                    ? `HEY ${firstName.toUpperCase()}`
                    : "Hey there!"}
                </h1>
                <p>How can I help you today?</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={message.id || message._id || index}
                  sender={message.sender || message.role}
                  text={message.text || message.content}
                  isImage={message.isImage}
                  imageUrl={message.imageUrl}
                />
              ))
            )}

            {isLoading && <Typing />}

            <div ref={bottomRef} />
          </div>

          {/* =====================================
              FIXED INPUT
          ===================================== */}

          <MessageInput disabled={showAuth} />
        </main>
      </div>

      {/* =====================================
          AUTH MODAL
      ===================================== */}

      {showAuth && <AuthModal onGuest={handleGuest} />}

      {/* =====================================
          SETTINGS - REMOVED Modal
          Settings are now accessed via the sidebar
      ===================================== */}

    </div>
  );
}