// src/components/settings/SettingsContent.jsx
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

import {
  FiSettings,
  FiUser,
  FiShield,
  FiSun,
  FiMoon,
  FiMonitor,
  FiLogOut,
  FiTrash2,
  FiDownload,
  FiInfo,
  FiGlobe,
  FiCheck,
  FiChevronDown,
} from "react-icons/fi";

import {
  HiOutlinePaintBrush,
} from "react-icons/hi2";

import {
  LuBrain,
} from "react-icons/lu";

const tabs = [
  { id: "general", name: "General", icon: <FiSettings /> },
  { id: "appearance", name: "Appearance", icon: <HiOutlinePaintBrush /> },
  { id: "profile", name: "Profile", icon: <FiUser /> },
  { id: "memory", name: "Memory", icon: <LuBrain /> },
  { id: "account", name: "Account", icon: <FiShield /> },
];

// =========================================
// GENERAL TAB
// =========================================
function GeneralTab() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("System");
  const [languageOpen, setLanguageOpen] = useState(false);

  const themeOptions = [
    { id: 'light', icon: <FiSun />, label: 'Light' },
    { id: 'dark', icon: <FiMoon />, label: 'Dark' },
    { id: 'system', icon: <FiMonitor />, label: 'System' },
  ];

  const languageOptions = ['System', 'English', 'French', 'Spanish', 'Portuguese', 'Yoruba', 'Igbo', 'Hausa'];

  return (
    <div className="settings-panel">
      <div className="settings-panel-heading">
        <h3>General</h3>
        <p className="settings-subtitle">Customize your Cupid experience</p>
      </div>

      {/* Theme */}
      <div className="settings-group">
        <label>Theme</label>
        <div className="theme-options">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              className={`theme-option ${theme === option.id ? 'active' : ''}`}
              onClick={() => setTheme(option.id)}
            >
              {option.icon}
              <span>{option.label}</span>
              {theme === option.id && <FiCheck className="check-mark" />}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="settings-group">
        <label>Language</label>
        <div className="settings-dropdown-area">
          <button 
            className="settings-dropdown-trigger"
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            <div className="settings-dropdown-current">
              <FiGlobe />
              <span>{language}</span>
            </div>
            <FiChevronDown className={`dropdown-chevron ${languageOpen ? 'rotated' : ''}`} />
          </button>

          {languageOpen && (
            <div className="settings-dropdown-menu">
              {languageOptions.map((lang) => (
                <button
                  key={lang}
                  className={`settings-dropdown-item ${language === lang ? 'active' : ''}`}
                  onClick={() => {
                    setLanguage(lang);
                    setLanguageOpen(false);
                  }}
                >
                  <span className="settings-dropdown-item-left">
                    <FiGlobe />
                    {lang}
                  </span>
                  {language === lang && <FiCheck />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================
// APPEARANCE TAB
// =========================================
function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { id: 'light', icon: <FiSun />, label: 'Light' },
    { id: 'dark', icon: <FiMoon />, label: 'Dark' },
    { id: 'system', icon: <FiMonitor />, label: 'System' },
  ];

  return (
    <div className="settings-panel">
      <div className="settings-panel-heading">
        <h3>Appearance</h3>
        <p className="settings-subtitle">Customize how Cupid looks</p>
      </div>

      <div className="settings-group">
        <label>Theme</label>
        <div className="theme-options">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              className={`theme-option ${theme === option.id ? 'active' : ''}`}
              onClick={() => setTheme(option.id)}
            >
              {option.icon}
              <span>{option.label}</span>
              {theme === option.id && <FiCheck className="check-mark" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================
// PROFILE TAB
// =========================================
function ProfileTab() {
  const { user, isGuest } = useAuth();

  return (
    <div className="settings-panel">
      <div className="settings-panel-heading">
        <h3>Profile</h3>
        <p className="settings-subtitle">Manage your personal information</p>
      </div>

      <div className="settings-group">
        <div className="profile-avatar-large">
          {user?.name?.charAt(0) || 'G'}
        </div>
        <div className="profile-info">
          <p><strong>Name</strong><br />{user?.name || 'Guest'}</p>
          <p><strong>Email</strong><br />{user?.email || 'Not logged in'}</p>
          <p><strong>Plan</strong><br />{user?.subscription?.tier || 'Free'}</p>
        </div>
        {isGuest && (
          <button className="primary-btn" style={{ marginTop: '16px' }}>
            Sign Up to Save Your Chats
          </button>
        )}
      </div>
    </div>
  );
}

// =========================================
// MEMORY TAB
// =========================================
function MemoryTab() {
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  return (
    <div className="settings-panel">
      <div className="settings-panel-heading">
        <h3>Memory</h3>
        <p className="settings-subtitle">Control how Cupid remembers your conversations</p>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-icon">
              <LuBrain />
            </div>
            <div>
              <h4>Remember conversations</h4>
              <p>Allow Cupid to use saved memories when responding</p>
            </div>
          </div>
          <button 
            className={`settings-toggle ${memoryEnabled ? 'active' : ''}`}
            onClick={() => setMemoryEnabled(!memoryEnabled)}
          >
            <span />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================
// ACCOUNT TAB
// =========================================
function AccountTab() {
  const { user, logout } = useAuth();

  return (
    <div className="settings-panel">
      <div className="settings-panel-heading">
        <h3>Account</h3>
        <p className="settings-subtitle">Manage your account information</p>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-icon">
              <FiUser />
            </div>
            <div>
              <h4>Email</h4>
              <p>{user?.email || 'Not logged in'}</p>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-icon">
              <FiShield />
            </div>
            <div>
              <h4>Plan</h4>
              <p>{user?.subscription?.tier || 'Free'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <button className="danger-btn" style={{ width: '100%' }} onClick={logout}>
          <FiLogOut /> Log Out
        </button>
      </div>
    </div>
  );
}

// =========================================
// MAIN COMPONENT
// =========================================
export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");

  // Add useAuth for profile and account tabs
  const { user, isGuest, logout } = useAuth();

  return (
    <div className="settings-layout">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </aside>

      {/* Content */}
      <section className="settings-content">
        {activeTab === "general" && <GeneralTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "memory" && <MemoryTab />}
        {activeTab === "account" && <AccountTab />}
      </section>
    </div>
  );
}