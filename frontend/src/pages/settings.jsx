// src/pages/Settings.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  FiSettings, FiBell, FiSliders, FiGrid, FiMic, FiCreditCard,
  FiBarChart2, FiPieChart, FiDatabase, FiLock, FiHardDrive,
  FiShield, FiUserCheck, FiUsers, FiInfo, FiLogOut, FiArrowLeft,
  FiChevronDown, FiCheck, FiX, FiSearch,
} from 'react-icons/fi';
// import './Settings.css';

/* ---------------- Custom Dropdown ---------------- */
function Dropdown({ value, options, onChange, width = 130 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="dd" ref={ref} style={{ minWidth: width }}>
      <button
        type="button"
        className={`dd-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="dd-value">{value}</span>
        <FiChevronDown className={`dd-chev ${open ? 'rot' : ''}`} />
      </button>

      {open && (
        <div className="dd-menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`dd-item ${value === opt ? 'active' : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === opt}
            >
              <span>{opt}</span>
              {value === opt && <FiCheck className="dd-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Settings Page ---------------- */
export default function Settings() {
  const { user, isGuest, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('General');
  const [query, setQuery] = useState('');

  const [contrast, setContrast] = useState(
    () => localStorage.getItem('contrast') || 'System'
  );
  const [accent, setAccent] = useState(
    () => localStorage.getItem('accent') || 'Default'
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem('language') || 'Auto-detect'
  );
  const [dictation, setDictation] = useState(
    () => localStorage.getItem('dictation') === 'true'
  );
  const [memory, setMemory] = useState(
    () => localStorage.getItem('memory') !== 'false'
  );
  const [training, setTraining] = useState(
    () => localStorage.getItem('training') === 'true'
  );
  const [showBanner, setShowBanner] = useState(true);

  /* Persist small prefs */
  useEffect(() => { localStorage.setItem('contrast', contrast); }, [contrast]);
  useEffect(() => { localStorage.setItem('accent', accent); }, [accent]);
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => { localStorage.setItem('dictation', dictation); }, [dictation]);
  useEffect(() => { localStorage.setItem('memory', memory); }, [memory]);
  useEffect(() => { localStorage.setItem('training', training); }, [training]);

  /* Apply accent color to CSS var */
  useEffect(() => {
    const map = {
      Default: '#6c5ce7',
      Blue: '#3b82f6',
      Green: '#10a37f',
      Pink: '#ec4899',
      Orange: '#f97316',
    };
    document.documentElement.style.setProperty('--accent-color', map[accent] || map.Default);
  }, [accent]);

  /* Apply contrast */
  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', contrast.toLowerCase());
  }, [contrast]);

  const tabs = [
    { id: 'General',         icon: <FiSettings />,   label: 'General' },
    { id: 'Notifications',   icon: <FiBell />,       label: 'Notifications' },
    { id: 'Personalization', icon: <FiSliders />,    label: 'Personalization' },
    { id: 'Plugins',         icon: <FiGrid />,       label: 'Plugins' },
    { id: 'Voice',           icon: <FiMic />,        label: 'Voice' },
    { id: 'Billing',         icon: <FiCreditCard />, label: 'Billing' },
    { id: 'Usage',           icon: <FiBarChart2 />,  label: 'Usage' },
    { id: 'Analytics',       icon: <FiPieChart />,   label: 'Analytics' },
    { id: 'Data controls',   icon: <FiDatabase />,   label: 'Data controls' },
    { id: 'Storage',         icon: <FiHardDrive />,  label: 'Storage' },
    { id: 'Safety',          icon: <FiShield />,     label: 'Safety' },
    { id: 'Security and login', icon: <FiLock />,    label: 'Security and login' },
    { id: 'Parental controls',  icon: <FiUserCheck />, label: 'Parental controls' },
    { id: 'Trusted contact',    icon: <FiUsers />,   label: 'Trusted contact' },
    { id: 'About',           icon: <FiInfo />,       label: 'About' },
  ];

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleLogout = () => { logout(); navigate('/'); };
  const handleClose  = () => navigate('/chat');

  const clearChats = () => {
    if (!window.confirm('Delete all chats permanently?')) return;
    localStorage.removeItem('chats');
    localStorage.removeItem('conversations');
    window.alert('All chats deleted.');
  };

  const exportData = () => {
    const data = {
      user: user || null,
      theme, contrast, accent, language, dictation, memory, training,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cupid-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const Row = ({ label, desc, children }) => (
    <div className="gpt-row">
      <div className="gpt-row-text">
        <span className="gpt-row-label">{label}</span>
        {desc && <p className="gpt-row-desc">{desc}</p>}
      </div>
      {children}
    </div>
  );

  const renderGeneral = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">General</h2>

      {showBanner && (
        <div className="gpt-banner">
          <div className="gpt-banner-head">
            <FiLock className="gpt-banner-icon" />
            <span className="gpt-banner-title">Secure your account</span>
            <button className="gpt-banner-close" onClick={() => setShowBanner(false)}>
              <FiX />
            </button>
          </div>
          <p className="gpt-banner-desc">
            Add multi-factor authentication (MFA), like a text message or
            authenticator app, to help protect your account when logging in.
          </p>
          <button className="gpt-banner-cta" onClick={() => alert('MFA setup coming soon')}>
            Set up MFA
          </button>
        </div>
      )}

      <div className="gpt-group">
        <Row label="Appearance">
          <Dropdown
            value={theme}
            options={['System', 'Light', 'Dark']}
            onChange={setTheme}
          />
        </Row>

        <Row label="Contrast">
          <Dropdown
            value={contrast}
            options={['System', 'High', 'Standard']}
            onChange={setContrast}
          />
        </Row>

        <Row label="Accent color">
          <Dropdown
            value={accent}
            options={['Default', 'Blue', 'Green', 'Pink', 'Orange']}
            onChange={setAccent}
          />
        </Row>

        <Row label="Language">
          <Dropdown
            value={language}
            options={['Auto-detect', 'English', 'French', 'Spanish', 'Portuguese', 'Yoruba', 'Igbo', 'Hausa']}
            onChange={setLanguage}
            width={150}
          />
        </Row>

        <Row label="Enable Dictation" desc="Use dictation in the chat composer.">
          <button
            className={`gpt-toggle ${dictation ? 'active' : ''}`}
            onClick={() => setDictation((v) => !v)}
            aria-pressed={dictation}
          >
            <span />
          </button>
        </Row>
      </div>
    </div>
  );

  const renderPersonalization = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">Personalization</h2>
      <div className="gpt-group">
        <Row label="Memory" desc="Let Cupid remember details between chats.">
          <button
            className={`gpt-toggle ${memory ? 'active' : ''}`}
            onClick={() => setMemory((v) => !v)}
          >
            <span />
          </button>
        </Row>
        <Row label="Custom instructions" desc="Tell Cupid how you'd like it to respond.">
          <FiChevronDown className="gpt-row-chevron" />
        </Row>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">Notifications</h2>
      <div className="gpt-group">
        <Row label="Push notifications" desc="Get notified about responses.">
          <button className="gpt-toggle"><span /></button>
        </Row>
        <Row label="Email updates" desc="Product news and feature releases.">
          <button className="gpt-toggle"><span /></button>
        </Row>
      </div>
    </div>
  );

  const renderDataControls = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">Data controls</h2>
      <div className="gpt-group">
        <Row label="Improve the model for everyone" desc="Allow your content to be used to train our models.">
          <button
            className={`gpt-toggle ${training ? 'active' : ''}`}
            onClick={() => setTraining((v) => !v)}
          >
            <span />
          </button>
        </Row>
        <Row label="Shared links">
          <FiChevronDown className="gpt-row-chevron" />
        </Row>
      </div>

      <div className="gpt-group">
        <Row label="Delete all chats" desc="Permanently remove all conversations.">
          <button className="gpt-danger-btn" onClick={clearChats}>Delete all</button>
        </Row>

        {isGuest ? (
          <Row label="Sign up to save your data" desc="Create an account to keep your chats and settings.">
            <button className="gpt-outline-btn" onClick={() => navigate('/signup')}>
              Sign up
            </button>
          </Row>
        ) : (
          <Row label="Export data" desc="Download a copy of your account data.">
            <button className="gpt-outline-btn" onClick={exportData}>Export</button>
          </Row>
        )}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">Security and login</h2>
      <div className="gpt-group">
        <Row label="Multi-factor authentication">
          <span className="gpt-row-value">Not enabled</span>
        </Row>
        <Row label="Password">
          <button className="gpt-outline-btn">Change</button>
        </Row>
        <Row label="Log out of all devices" desc="Sign out everywhere you're currently logged in.">
          <button className="gpt-danger-btn" onClick={handleLogout}>Log out</button>
        </Row>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">About</h2>
      <div className="gpt-group">
        <Row label="Version"><span className="gpt-row-value">1.0.0</span></Row>
        <Row label="Model"><span className="gpt-row-value">Groq · Llama 3</span></Row>
        <Row label="Plan">
          <span className="gpt-row-value">
            {isGuest ? 'Free' : (user?.subscription?.tier || 'Free')}
          </span>
        </Row>
      </div>
    </div>
  );

  const renderEmpty = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">{activeTab}</h2>
      <div className="gpt-empty">
        <FiSettings />
        <h3>Nothing here yet</h3>
        <p>This section is coming soon.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'General':            return renderGeneral();
      case 'Notifications':      return renderNotifications();
      case 'Personalization':    return renderPersonalization();
      case 'Data controls':      return renderDataControls();
      case 'Security and login': return renderSecurity();
      case 'About':              return renderAbout();
      default:                   return renderEmpty();
    }
  };

  return (
    <div className="gpt-settings-backdrop" onClick={handleClose}>
      <div
        className="gpt-settings-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="gpt-nav">
          <button className="gpt-nav-back" onClick={handleClose} aria-label="Back">
            <FiArrowLeft />
          </button>

          <div className="gpt-search">
            <FiSearch className="gpt-search-icon" />
            <input
              type="text"
              placeholder="Search settings"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <nav className="gpt-nav-list">
            {filteredTabs.map((t) => (
              <button
                key={t.id}
                className={`gpt-nav-item ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="gpt-nav-icon">{t.icon}</span>
                <span className="gpt-nav-label">{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="gpt-main">
          <button className="gpt-close" onClick={handleClose} aria-label="Close">
            <FiX />
          </button>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}