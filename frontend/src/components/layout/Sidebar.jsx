// src/components/layout/Sidebar.jsx
import {
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  FiMenu,
  FiPlus,
  FiSearch,
  FiSettings,
  FiMessageSquare,
  FiInbox,
  FiImage,
  FiFolder,
  FiGrid,
  FiX,
  FiTrash2,
  FiMoreHorizontal,
  FiEdit3,
  FiBookmark,
  FiCheck,
} from "react-icons/fi";

import { useChat } from "../../context/ChatContext";

export default function Sidebar({ onOpenSettings }) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [renameChat, setRenameChat] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const {
    conversations = [],
    currentSessionId,
    newChat,
    loadConversation,
    deleteConversation,
    loadConversations,
    renameConversation,
    togglePinConversation,
  } = useChat();

  // =========================================
  // LOAD CONVERSATIONS
  // =========================================

  useEffect(() => {
    loadConversations();
  }, []);

  // =========================================
  // SEARCH
  // =========================================

  const filteredConversations = conversations.filter((chat) => {
    const title = chat.title || "New Conversation";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  // =========================================
  // PINNED
  // =========================================

  const pinnedConversations = filteredConversations.filter(
    (chat) => chat.pinned === true
  );

  // =========================================
  // RECENT
  // =========================================

  const recentConversations = filteredConversations.filter(
    (chat) => !chat.pinned
  );

  // =========================================
  // NEW CHAT
  // =========================================

  const handleNewChat = () => {
    newChat();
    setActivePanel(null);
    setOpenMenu(null);
  };

  // =========================================
  // SELECT CONVERSATION
  // =========================================

  const handleSelectConversation = async (sessionId) => {
    if (!sessionId) return;
    await loadConversation(sessionId);
    setOpenMenu(null);
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDeleteConversation = async (event, sessionId) => {
    event.stopPropagation();
    const confirmed = window.confirm("Delete this conversation?");
    if (!confirmed) return;
    await deleteConversation(sessionId);
    setOpenMenu(null);
  };

  // =========================================
  // PIN / UNPIN
  // =========================================

  const handleTogglePin = async (event, sessionId) => {
    event.stopPropagation();
    if (!sessionId) return;
    await togglePinConversation(sessionId);
    setOpenMenu(null);
  };

  // =========================================
  // OPEN RENAME
  // =========================================

  const handleOpenRename = (event, chat) => {
    event.stopPropagation();
    setRenameChat(chat);
    setRenameValue(chat.title || "");
    setOpenMenu(null);
  };

  // =========================================
  // SAVE RENAME
  // =========================================

  const handleRename = async () => {
    if (!renameChat || !renameValue.trim()) return;
    const success = await renameConversation(
      renameChat.sessionId,
      renameValue.trim()
    );
    if (success) {
      setRenameChat(null);
      setRenameValue("");
    }
  };

  // =========================================
  // OPEN PANEL
  // =========================================

  const openPanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // =========================================
  // CONVERSATION LIST
  // =========================================

  const renderConversationList = (chats, emptyText) => {
    if (chats.length === 0) {
      return (
        <div className="empty-history">
          <FiInbox />
          <span>{emptyText}</span>
        </div>
      );
    }

    return chats.map((chat) => (
      <div key={chat.sessionId} className="chat-item-wrapper">
        <button
          type="button"
          className={
            currentSessionId === chat.sessionId
              ? "chat-item active-chat"
              : "chat-item"
          }
          onClick={() => handleSelectConversation(chat.sessionId)}
        >
          <FiMessageSquare />
          <span>{chat.title || "New Conversation"}</span>
        </button>

        <button
          type="button"
          className={
            openMenu === chat.sessionId
              ? "chat-more-btn visible"
              : "chat-more-btn"
          }
          onClick={(event) => {
            event.stopPropagation();
            setOpenMenu(openMenu === chat.sessionId ? null : chat.sessionId);
          }}
          title="Conversation options"
        >
          <FiMoreHorizontal />
        </button>

        {openMenu === chat.sessionId && (
          <div className="conversation-menu">
            <button
              type="button"
              onClick={(event) => handleTogglePin(event, chat.sessionId)}
            >
              <FiBookmark />
              <span>{chat.pinned ? "Unpin" : "Pin"}</span>
            </button>

            <button
              type="button"
              onClick={(event) => handleOpenRename(event, chat)}
            >
              <FiEdit3 />
              <span>Rename</span>
            </button>

            <button
              type="button"
              className="delete-option"
              onClick={(event) => handleDeleteConversation(event, chat.sessionId)}
            >
              <FiTrash2 />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      {/* =====================================
          MAIN SIDEBAR
      ===================================== */}

      <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
        {/* HEADER */}
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-menu-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            title="Toggle sidebar"
          >
            <FiMenu />
          </button>

          {!collapsed && (
            <div className="sidebar-brand">
              <span className="brand-dot" />
              Cupid
            </div>
          )}
        </div>

        {/* NEW CHAT */}
        <div className="sidebar-new-chat">
          <button
            type="button"
            className="new-chat-btn"
            onClick={handleNewChat}
          >
            <FiPlus />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* NORMAL SIDEBAR */}
        {!collapsed && (
          <div className="sidebar-scroll">
            {/* SEARCH */}
            <div className="sidebar-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <FiX />
                </button>
              )}
            </div>

            {/* NAVIGATION */}
            <div className="sidebar-navigation">
              <button
                type="button"
                className={activePanel === "images" ? "sidebar-btn active" : "sidebar-btn"}
                onClick={() => openPanel("images")}
              >
                <FiImage />
                <span>Images</span>
              </button>

              <button
                type="button"
                className={activePanel === "library" ? "sidebar-btn active" : "sidebar-btn"}
                onClick={() => openPanel("library")}
              >
                <FiFolder />
                <span>Library</span>
              </button>

              <button
                type="button"
                className={activePanel === "projects" ? "sidebar-btn active" : "sidebar-btn"}
                onClick={() => openPanel("projects")}
              >
                <FiGrid />
                <span>Projects</span>
              </button>
            </div>

            {/* PINNED */}
            {pinnedConversations.length > 0 && (
              <div className="history-section">
                <div className="history-header">
                  <FiBookmark />
                  <span>Pinned</span>
                </div>
                <div className="chat-history">
                  {renderConversationList(pinnedConversations, "No pinned chats")}
                </div>
              </div>
            )}

            {/* RECENT */}
            <div className="history-section recent-section">
              <div className="history-header">
                <span>Recent</span>
              </div>
              <div className="chat-history">
                {renderConversationList(
                  recentConversations,
                  search ? "No chats found" : "No conversations yet"
                )}
              </div>
            </div>
          </div>
        )}

        {/* COLLAPSED */}
        {collapsed && (
          <div className="sidebar-scroll">
            <button
              type="button"
              className="sidebar-btn"
              onClick={() => openPanel("images")}
              title="Images"
            >
              <FiImage />
            </button>

            <button
              type="button"
              className="sidebar-btn"
              onClick={() => openPanel("library")}
              title="Library"
            >
              <FiFolder />
            </button>

            <button
              type="button"
              className="sidebar-btn"
              onClick={() => openPanel("projects")}
              title="Projects"
            >
              <FiGrid />
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-btn settings-btn"
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <FiSettings />
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* =====================================
          SIDE PANEL
      ===================================== */}

      {activePanel && (
        <div className={collapsed ? "sidebar-panel collapsed-panel" : "sidebar-panel"}>
          <div className="sidebar-panel-header">
            <h2>
              {activePanel === "images" && "Images"}
              {activePanel === "library" && "Library"}
              {activePanel === "projects" && "Projects"}
            </h2>
            <button type="button" onClick={() => setActivePanel(null)}>
              <FiX />
            </button>
          </div>

          {/* IMAGES */}
          {activePanel === "images" && (
            <div className="panel-empty">
              <FiImage />
              <h3>Your images</h3>
              <p>Images generated by Cupid will appear here.</p>
            </div>
          )}

          {/* LIBRARY */}
          {activePanel === "library" && (
            <div className="panel-empty">
              <FiFolder />
              <h3>Your Library</h3>
              <p>Uploaded files and documents will appear here.</p>
            </div>
          )}

          {/* PROJECTS */}
          {activePanel === "projects" && (
            <div className="panel-empty">
              <FiGrid />
              <h3>Projects</h3>
              <p>Create and organize your Cupid projects here.</p>
              <button type="button" className="panel-action">
                <FiPlus />
                Create Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================
          RENAME MODAL
      ===================================== */}

      {renameChat && (
        <div className="rename-overlay">
          <div className="rename-modal">
            <div className="rename-modal-header">
              <h3>Rename conversation</h3>
              <button type="button" onClick={() => setRenameChat(null)}>
                <FiX />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={renameValue}
              placeholder="Conversation name"
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleRename();
                }
              }}
            />

            <div className="rename-actions">
              <button
                type="button"
                className="rename-cancel"
                onClick={() => setRenameChat(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rename-save"
                onClick={handleRename}
              >
                <FiCheck />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}