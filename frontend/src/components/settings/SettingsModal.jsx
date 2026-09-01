// src/components/SettingsModal.jsx - Full updated version
import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiSettings, 
  FiUser, 
  FiDatabase, 
  FiInfo, 
  FiSun, 
  FiMoon, 
  FiMonitor,
  FiLogOut,
  FiX,
  FiChevronDown,
  FiCheck,
  FiGlobe,
} from 'react-icons/fi';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, isGuest, logout } = useAuth();
  const { theme, setTheme } = useTheme(); // ✅ Use theme context
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('General');
  const [language, setLanguage] = useState('System');
  const [languageOpen, setLanguageOpen] = useState(false);

  const tabs = [
    { id: 'General', icon: <FiSettings />, label: 'General' },
    { id: 'Profile', icon: <FiUser />, label: 'Profile' },
    { id: 'Data', icon: <FiDatabase />, label: 'Data' },
    { id: 'About', icon: <FiInfo />, label: 'About' },
  ];

  const themeOptions = [
    { id: 'light', icon: <FiSun />, label: 'Light' },
    { id: 'dark', icon: <FiMoon />, label: 'Dark' },
    { id: 'system', icon: <FiMonitor />, label: 'System' },
  ];

  const languageOptions = ['System', 'English', 'French', 'Spanish', 'Portuguese', 'Yoruba', 'Igbo', 'Hausa'];

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  // ✅ Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="settings-close-btn" onClick={onClose}>
          <FiX />
        </button>

        {/* Header */}
        <div className="settings-modal-header">
          <h2>Settings</h2>
        </div>

        {/* Body */}
        <div className="settings-modal-body">
          {/* Sidebar */}
          <div className="settings-modal-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-modal-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            <button className="settings-modal-tab logout-btn" onClick={handleLogout}>
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>

          {/* Content */}
          <div className="settings-modal-content">
            {/* GENERAL TAB */}
            {activeTab === 'General' && (
              <div className="settings-panel">
                <div className="settings-panel-heading">
                  <h3>General</h3>
                  <p className="settings-subtitle">Customize your Cupid experience</p>
                </div>

                {/* Theme */}
                <div className="settings-group">
                  <label>
                    <FiPalette /> Theme
                  </label>
                  <div className="theme-options">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        className={`theme-option ${theme === option.id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(option.id)}
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
                  <label>
                    <FiGlobe /> Language
                  </label>
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
            )}

            {/* PROFILE TAB */}
            {activeTab === 'Profile' && (
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
            )}

            {/* DATA TAB */}
            {activeTab === 'Data' && (
              <div className="settings-panel">
                <div className="settings-panel-heading">
                  <h3>Data</h3>
                  <p className="settings-subtitle">Manage your data</p>
                </div>

                <div className="settings-group">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-icon danger-icon">
                        <FiTrash2 />
                      </div>
                      <div>
                        <h4>Clear Chat History</h4>
                        <p>Delete all your conversations permanently</p>
                      </div>
                    </div>
                    <button className="danger-btn">Clear</button>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-icon">
                        <FiDownload />
                      </div>
                      <div>
                        <h4>Export Data</h4>
                        <p>Download a copy of your data</p>
                      </div>
                    </div>
                    <button className="primary-btn" style={{ width: 'auto', padding: '8px 20px' }}>
                      Export
                    </button>
                  </div>
                </div>

                {isGuest && (
                  <div className="settings-group">
                    <div className="settings-row">
                      <div className="settings-row-info">
                        <div className="settings-icon">
                          <FiShield />
                        </div>
                        <div>
                          <h4>Save Your Data</h4>
                          <p>Sign up to save your chats permanently</p>
                        </div>
                      </div>
                      <button className="primary-btn" style={{ width: 'auto', padding: '8px 20px' }}>
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'About' && (
              <div className="settings-panel">
                <div className="settings-panel-heading">
                  <h3>About</h3>
                  <p className="settings-subtitle">Learn more about Cupid</p>
                </div>

                <div className="settings-group">
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-icon">
                        <FiSettings />
                      </div>
                      <div>
                        <h4>Version</h4>
                        <p>1.0.0</p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-icon">
                        <FiInfo />
                      </div>
                      <div>
                        <h4>Description</h4>
                        <p>Cupid is an AI assistant powered by AI models.</p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-row">
                    <div className="settings-row-info">
                      <div className="settings-icon">
                        <FiSettings />
                      </div>
                      <div>
                        <h4>Features</h4>
                        <p>AI conversations • Chat history • Custom themes • Guest mode • Voice messages • Image generation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}