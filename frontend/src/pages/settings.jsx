// src/pages/Settings.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  FiSettings, FiBell, FiSliders, FiGrid, FiMic, FiCreditCard,
  FiBarChart2, FiPieChart, FiDatabase, FiLock, FiHardDrive,
  FiShield, FiUserCheck, FiUsers, FiInfo, FiLogOut, FiArrowLeft,
  FiChevronDown, FiCheck, FiX, FiSearch, FiVolume2,
} from 'react-icons/fi';
// import './settings.css';

/* ---------------- Accent color map ---------------- */
const ACCENT_MAP = {
  Default: '#6c5ce7',
  Blue:    '#3b82f6',
  Green:   '#10a37f',
  Pink:    '#ec4899',
  Orange:  '#f97316',
  Red:     '#ef4444',
  Purple:  '#a855f7',
  Teal:    '#14b8a6',
};

/* ---------------- Voice options ---------------- */
const VOICE_OPTIONS = [
  { id: 'female',  label: 'Female (Samantha / Zira)' },
  { id: 'male',    label: 'Male (Daniel / David)' },
  { id: 'neutral', label: 'Neutral (default)' },
];

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
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.id;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <button
                key={val}
                type="button"
                className={`dd-item ${value === val ? 'active' : ''}`}
                onClick={() => {
                  onChange(val);
                  setOpen(false);
                }}
                role="option"
                aria-selected={value === val}
              >
                <span>{label}</span>
                {value === val && <FiCheck className="dd-check" />}
              </button>
            );
          })}
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

  /* ---------- Persisted prefs ---------- */
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
  const [pushNotif, setPushNotif] = useState(
    () => localStorage.getItem('pushNotif') === 'true'
  );
  const [emailNotif, setEmailNotif] = useState(
    () => localStorage.getItem('emailNotif') === 'true'
  );

  /* ---------- Voice settings (use cupidVoicePreference key) ---------- */
  const [voiceGender, setVoiceGender] = useState(
    () =>
      localStorage.getItem('cupidVoicePreference') ||
      localStorage.getItem('voiceGender') ||
      'female'
  );
  const [voiceRate, setVoiceRate] = useState(
    () => Number(localStorage.getItem('voiceRate')) || 1
  );
  const [voicePitch, setVoicePitch] = useState(
    () => Number(localStorage.getItem('voicePitch')) || 1
  );
  const [voiceVolume, setVoiceVolume] = useState(
    () => Number(localStorage.getItem('voiceVolume')) || 1
  );
  const [availableVoices, setAvailableVoices] = useState([]);

  const [showBanner, setShowBanner] = useState(true);

  /* ---------- Persist small prefs ---------- */
  useEffect(() => { localStorage.setItem('contrast', contrast); }, [contrast]);
  useEffect(() => { localStorage.setItem('accent', accent); }, [accent]);
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => { localStorage.setItem('dictation', dictation); }, [dictation]);
  useEffect(() => { localStorage.setItem('memory', memory); }, [memory]);
  useEffect(() => { localStorage.setItem('training', training); }, [training]);
  useEffect(() => { localStorage.setItem('pushNotif', pushNotif); }, [pushNotif]);
  useEffect(() => { localStorage.setItem('emailNotif', emailNotif); }, [emailNotif]);
  useEffect(() => { localStorage.setItem('voiceRate', voiceRate); }, [voiceRate]);
  useEffect(() => { localStorage.setItem('voicePitch', voicePitch); }, [voicePitch]);
  useEffect(() => { localStorage.setItem('voiceVolume', voiceVolume); }, [voiceVolume]);

  /* ---------- Persist + broadcast voice gender ---------- */
  useEffect(() => {
    localStorage.setItem('cupidVoicePreference', voiceGender);
    // Keep legacy key for backwards compat
    localStorage.setItem('voiceGender', voiceGender);
    // Notify MessageBubble and any other listener
    window.dispatchEvent(
      new CustomEvent('cupidVoiceChanged', { detail: voiceGender })
    );
  }, [voiceGender]);

  /* ---------- Apply accent color to ALL accent vars ---------- */
  useEffect(() => {
    const color = ACCENT_MAP[accent] || ACCENT_MAP.Default;
    const root = document.documentElement;
    root.style.setProperty('--accent-color', color);
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-hover', shadeColor(color, -15));
    root.style.setProperty('--accent-light', hexToRgba(color, 0.12));
  }, [accent]);

  /* ---------- Apply contrast ---------- */
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-contrast',
      contrast.toLowerCase()
    );
  }, [contrast]);

  /* ---------- Load available browser voices ---------- */
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /* ---------- Pick a voice matching gender ---------- */
  const pickVoice = () => {
    if (!availableVoices.length) return null;
    const femaleKeywords = ['female', 'samantha', 'zira', 'victoria', 'karen', 'moira', 'tessa', 'aria', 'hazel'];
    const maleKeywords   = ['male', 'daniel', 'david', 'alex', 'fred', 'mark', 'guy', 'josh', 'antoni'];

    const englishVoices = availableVoices.filter((v) => v.lang.startsWith('en'));
    const pool = englishVoices.length ? englishVoices : availableVoices;

    if (voiceGender === 'female') {
      return pool.find((v) =>
        femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
      ) || pool[0];
    }
    if (voiceGender === 'male') {
      return pool.find((v) =>
        maleKeywords.some((k) => v.name.toLowerCase().includes(k))
      ) || pool[0];
    }
    return pool[0];
  };

  /* ---------- Preview voice ---------- */
  const previewVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support speech synthesis.');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `Hi, I'm Cupid. This is how I sound as a ${voiceGender} voice.`
    );
    const v = pickVoice();
    if (v) utter.voice = v;
    utter.rate = voiceRate;
    utter.pitch = voicePitch;
    utter.volume = voiceVolume;
    window.speechSynthesis.speak(utter);
  };

  const tabs = [
    { id: 'General',            icon: <FiSettings />, label: 'General' },
    { id: 'Notifications',      icon: <FiBell />,     label: 'Notifications' },
    { id: 'Personalization',    icon: <FiSliders />,  label: 'Personalization' },
    { id: 'Voice',              icon: <FiMic />,      label: 'Voice' },
    { id: 'Data controls',      icon: <FiDatabase />, label: 'Data controls' },
    { id: 'Security and login', icon: <FiLock />,     label: 'Security and login' },
    { id: 'About',              icon: <FiInfo />,     label: 'About' },
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
      voiceGender, voiceRate, voicePitch, voiceVolume,
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
          <Dropdown value={theme} options={['System', 'Light', 'Dark']} onChange={setTheme} />
        </Row>

        <Row label="Contrast">
          <Dropdown
            value={contrast}
            options={['System', 'High', 'Standard']}
            onChange={setContrast}
          />
        </Row>

        <Row label="Accent color" desc="Choose your Cupid theme color.">
          <Dropdown
            value={accent}
            options={Object.keys(ACCENT_MAP)}
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
            aria-pressed={memory}
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
          <button
            className={`gpt-toggle ${pushNotif ? 'active' : ''}`}
            onClick={() => setPushNotif((v) => !v)}
            aria-pressed={pushNotif}
          >
            <span />
          </button>
        </Row>
        <Row label="Email updates" desc="Product news and feature releases.">
          <button
            className={`gpt-toggle ${emailNotif ? 'active' : ''}`}
            onClick={() => setEmailNotif((v) => !v)}
            aria-pressed={emailNotif}
          >
            <span />
          </button>
        </Row>
      </div>
    </div>
  );

  /* ---------------- Voice tab ---------------- */
  const renderVoice = () => (
    <div className="gpt-pane">
      <h2 className="gpt-pane-title">Voice</h2>

      <div className="gpt-group">
        <Row label="Voice gender" desc="Choose how Cupid sounds when speaking.">
          <Dropdown
            value={voiceGender}
            options={VOICE_OPTIONS}
            onChange={setVoiceGender}
            width={200}
          />
        </Row>

        <Row label="Preview voice" desc="Hear how Cupid will sound.">
          <button className="gpt-outline-btn gpt-preview-btn" onClick={previewVoice}>
            <FiVolume2 /> Play sample
          </button>
        </Row>
      </div>

      <div className="gpt-group">
        <Row label="Speaking rate" desc={`Speed: ${voiceRate.toFixed(2)}x`}>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={voiceRate}
            onChange={(e) => setVoiceRate(Number(e.target.value))}
            className="gpt-range"
          />
        </Row>

        <Row label="Pitch" desc={`Pitch: ${voicePitch.toFixed(2)}`}>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={voicePitch}
            onChange={(e) => setVoicePitch(Number(e.target.value))}
            className="gpt-range"
          />
        </Row>

        <Row label="Volume" desc={`Volume: ${Math.round(voiceVolume * 100)}%`}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={voiceVolume}
            onChange={(e) => setVoiceVolume(Number(e.target.value))}
            className="gpt-range"
          />
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
            aria-pressed={training}
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
      case 'Voice':              return renderVoice();
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

export function SettingsPage() {
  const { user, isGuest } = useAuth();
  const authenticated = user || isGuest;

  return authenticated ? <Settings /> : <Navigate to="/" replace />;
}

/* =========================================================
   Utility helpers
========================================================= */
function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}