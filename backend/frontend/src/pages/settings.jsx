// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiSettings, 
  FiUser, 
  FiDatabase, 
  FiInfo, 
  FiSun, 
  FiMoon, 
  FiMonitor,
  FiLogOut
} from 'react-icons/fi';

export default function Settings() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('General');
  const [theme, setTheme] = useState('Dark');
  const [language, setLanguage] = useState('System');

  const tabs = [
    { id: 'General', icon: <FiSettings />, label: 'General' },
    { id: 'Profile', icon: <FiUser />, label: 'Profile' },
    { id: 'Data', icon: <FiDatabase />, label: 'Data' },
    { id: 'About', icon: <FiInfo />, label: 'About' },
  ];

  const themeOptions = ['Light', 'Dark', 'System'];
  const languageOptions = ['System', 'English', 'French', 'Spanish', 'Portuguese', 'Yoruba', 'Igbo', 'Hausa'];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ✅ If guest, show limited settings
  if (isGuest) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <h2>Settings</h2>
        </div>
        <div className="settings-layout">
          <div className="settings-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            <button className="settings-tab logout-btn" onClick={handleLogout}>
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'General' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3>General</h3>
                  <p>Customize your Cupid experience</p>
                </div>
                <div className="setting-group">
                  <label className="setting-label">Theme</label>
                  <div className="theme-options">
                    {themeOptions.map((option) => (
                      <button
                        key={option}
                        className={`theme-option ${theme === option ? 'active' : ''}`}
                        onClick={() => setTheme(option)}
                      >
                        {option === 'Light' && <FiSun />}
                        {option === 'Dark' && <FiMoon />}
                        {option === 'System' && <FiMonitor />}
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="setting-group">
                  <label className="setting-label">Language</label>
                  <select 
                    className="settings-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3>Profile</h3>
                  <p>Manage your personal information</p>
                </div>
                <div className="profile-info">
                  <div className="profile-avatar-large">G</div>
                  <div className="profile-details">
                    <div className="profile-field">
                      <label>Name</label>
                      <input type="text" value="Guest" readOnly />
                    </div>
                    <div className="profile-field">
                      <label>Email</label>
                      <input type="email" value="Not logged in" readOnly />
                    </div>
                    <div className="profile-field">
                      <label>Plan</label>
                      <input type="text" value="Free" readOnly />
                    </div>
                    <p className="guest-note">Sign up to save your settings and chat history.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Data' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3>Data</h3>
                  <p>Manage your data</p>
                </div>
                <div className="data-options">
                  <button className="danger-btn">Clear Chat History</button>
                  <button className="secondary-btn">Sign Up to Save Your Data</button>
                </div>
              </div>
            )}

            {activeTab === 'About' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h3>About</h3>
                  <p>Learn more about Cupid</p>
                </div>
                <div className="about-content">
                  <div className="about-item">
                    <strong>Version</strong>
                    <span>1.0.0</span>
                  </div>
                  <div className="about-item">
                    <strong>Description</strong>
                    <span>Cupid is an AI assistant powered by Groq's Llama 3 model.</span>
                  </div>
                  <div className="about-item">
                    <strong>Features</strong>
                    <ul>
                      <li>AI-powered conversations</li>
                      <li>Chat history</li>
                      <li>Customizable themes</li>
                      <li>Guest mode</li>
                      <li>Voice messages</li>
                      <li>Image generation</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ For registered users - full settings with user data
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <button className="settings-tab logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Log out</span>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'General' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>General</h3>
                <p>Customize your Cupid experience</p>
              </div>
              <div className="setting-group">
                <label className="setting-label">Theme</label>
                <div className="theme-options">
                  {themeOptions.map((option) => (
                    <button
                      key={option}
                      className={`theme-option ${theme === option ? 'active' : ''}`}
                      onClick={() => setTheme(option)}
                    >
                      {option === 'Light' && <FiSun />}
                      {option === 'Dark' && <FiMoon />}
                      {option === 'System' && <FiMonitor />}
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="setting-group">
                <label className="setting-label">Language</label>
                <select 
                  className="settings-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'Profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Profile</h3>
                <p>Manage your personal information</p>
              </div>
              <div className="profile-info">
                <div className="profile-avatar-large">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="profile-details">
                  <div className="profile-field">
                    <label>Name</label>
                    <input type="text" value={user?.name || 'User'} readOnly />
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <input type="email" value={user?.email || 'Not logged in'} readOnly />
                  </div>
                  <div className="profile-field">
                    <label>Plan</label>
                    <input type="text" value={user?.subscription?.tier || 'Free'} readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Data' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>Data</h3>
                <p>Manage your data</p>
              </div>
              <div className="data-options">
                <button className="danger-btn">Clear Chat History</button>
                <button className="secondary-btn">Export Data</button>
              </div>
            </div>
          )}

          {activeTab === 'About' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h3>About</h3>
                <p>Learn more about Cupid</p>
              </div>
              <div className="about-content">
                <div className="about-item">
                  <strong>Version</strong>
                  <span>1.0.0</span>
                </div>
                <div className="about-item">
                  <strong>Description</strong>
                  <span>Cupid is an AI assistant powered by Groq's Llama 3 model.</span>
                </div>
                <div className="about-item">
                  <strong>Features</strong>
                  <ul>
                    <li>AI-powered conversations</li>
                    <li>Chat history</li>
                    <li>Customizable themes</li>
                    <li>Guest mode</li>
                    <li>Voice messages</li>
                    <li>Image generation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}