import { LuSquarePen } from "react-icons/lu";

export default function NewChatButton({ onClick }) {
  return (
    <button
      className="new-chat-btn"
      onClick={onClick}
    >
      <LuSquarePen />
      <span>New Chat</span>
    </button>
  );
}