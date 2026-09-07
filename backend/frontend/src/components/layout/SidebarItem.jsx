import { LuTrash2 } from "react-icons/lu";

export default function SidebarItem({
  conversation,
  active,
  onClick,
  onDelete,
}) {
  return (
    <div
      className={`sidebar-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <span className="title">
        {conversation.title}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.sessionId);
        }}
      >
        <LuTrash2 />
      </button>
    </div>
  );
}