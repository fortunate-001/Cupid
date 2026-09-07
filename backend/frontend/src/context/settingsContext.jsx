import { useEffect, useState } from "react";
import {
  FiSettings,
  FiUser,
  FiShield,
  FiVolume2,
  FiCheck,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import { HiOutlinePaintBrush } from "react-icons/hi2";
import { LuBrain } from "react-icons/lu";
import api from "../../api/client";

const tabs = [
  { name: "General", icon: <FiSettings /> },
  { name: "Appearance", icon: <HiOutlinePaintBrush /> },
  { name: "Profile", icon: <FiUser /> },
  { name: "Memory", icon: <LuBrain /> },
  { name: "Account", icon: <FiShield /> },
];

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    name: "",
    email: "",
    avatar: "",
    subscription: { tier: "free" },
    aiSettings: {
      personality: "friendly",
      responseStyle: "normal",
      language: "English",
      rememberConversations: true,
      voiceGender: "female",
      voiceEnabled: true,
      theme: "system",
    },
  });

  // ============================
  // LOAD SETTINGS
  // ============================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/settings");

      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // UPDATE AI SETTINGS
  // ============================

  const updateAISetting = async (key, value) => {
    try {
      setSaving(true);

      const updated = {
        ...settings,
        aiSettings: {
          ...settings.aiSettings,
          [key]: value,
        },
      };

      setSettings(updated);

      await api.put("/settings", { [key]: value });

      // Theme updates instantly
      if (key === "theme") {
        document.documentElement.setAttribute("data-theme", value);
        localStorage.setItem("theme", value);
      }
    } catch (err) {
      console.error(err);
      fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // UPDATE PROFILE
  // ============================

  const updateProfile = async () => {
    try {
      setSaving(true);

      await api.put("/settings/profile", {
        name: settings.name,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner" />
        <p>Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-layout">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={activeTab === tab.name ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </aside>

      {/* Content */}
      <section className="settings-content">
        {/* GENERAL */}
        {activeTab === "General" && (
          <div className="settings-section">
            <h2>General Settings</h2>
            <p>Customize Cupid's personality and voice.</p>

            {/* Personality */}
            <div className="setting-item">
              <div>
                <strong>Personality</strong>
                <p>Choose how Cupid chats with you.</p>
              </div>

              <select
                value={settings.aiSettings.personality}
                onChange={(e) =>
                  updateAISetting("personality", e.target.value)
                }
              >
                <option value="friendly">Friendly 😊</option>
                <option value="professional">Professional 💼</option>
                <option value="casual">Casual 😎</option>
                <option value="creative">Creative 🎨</option>
              </select>
            </div>

            {/* Response Style */}
            <div className="setting-item">
              <div>
                <strong>Response Style</strong>
                <p>Choose Cupid's response length.</p>
              </div>

              <select
                value={settings.aiSettings.responseStyle}
                onChange={(e) =>
                  updateAISetting("responseStyle", e.target.value)
                }
              >
                <option value="short">Short</option>
                <option value="normal">Normal</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            {/* Language */}
            <div className="setting-item">
              <div>
                <strong>Language</strong>
                <p>Preferred language.</p>
              </div>

              <select
                value={settings.aiSettings.language}
                onChange={(e) =>
                  updateAISetting("language", e.target.value)
                }
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="Portuguese">Portuguese</option>
              </select>
            </div>

            {/* Voice */}
            <div className="setting-item voice-setting">
              <div>
                <strong>
                  <FiVolume2 /> Cupid Voice
                </strong>

                <p>Select Male or Female voice.</p>
              </div>

              <div className="voice-options">
                <button
                  className={
                    settings.aiSettings.voiceGender === "female"
                      ? "voice-option active"
                      : "voice-option"
                  }
                  onClick={() =>
                    updateAISetting("voiceGender", "female")
                  }
                >
                  ♀ Female
                  {settings.aiSettings.voiceGender === "female" && <FiCheck />}
                </button>

                <button
                  className={
                    settings.aiSettings.voiceGender === "male"
                      ? "voice-option active"
                      : "voice-option"
                  }
                  onClick={() =>
                    updateAISetting("voiceGender", "male")
                  }
                >
                  ♂ Male
                  {settings.aiSettings.voiceGender === "male" && <FiCheck />}
                </button>
              </div>
            </div>

            {/* Voice Enabled */}
            <div className="setting-item">
              <div>
                <strong>Read Responses Aloud</strong>
                <p>Enable Cupid voice playback.</p>
              </div>

              <button
                className={
                  settings.aiSettings.voiceEnabled
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={() =>
                  updateAISetting(
                    "voiceEnabled",
                    !settings.aiSettings.voiceEnabled
                  )
                }
              >
                <span />
              </button>
            </div>
          </div>
        )}

        {/* APPEARANCE */}
        {activeTab === "Appearance" && (
          <div className="settings-section">
            <h2>Appearance</h2>

            <div className="setting-item">
              <div>
                <strong>Theme</strong>
                <p>Choose how Cupid looks.</p>
              </div>

              <div className="theme-options">
                {["system", "light", "dark"].map((theme) => (
                  <button
                    key={theme}
                    className={
                      settings.aiSettings.theme === theme
                        ? "theme-option active"
                        : "theme-option"
                    }
                    onClick={() =>
                      updateAISetting("theme", theme)
                    }
                  >
                    {theme === "light" && <FiSun />}
                    {theme === "dark" && <FiMoon />}
                    {theme === "system" && <FiSettings />}
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "Profile" && (
          <div className="settings-section">
            <h2>Profile</h2>

            <div className="profile-card">
              <div className="avatar-circle">
                {settings.name?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <h3>{settings.name}</h3>
                <p>{settings.email}</p>
              </div>
            </div>

            <label>Name</label>

            <input
              value={settings.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  name: e.target.value,
                })
              }
            />

            <button className="save-btn" onClick={updateProfile}>
              Save Profile
            </button>
          </div>
        )}

        {/* MEMORY */}
        {activeTab === "Memory" && (
          <div className="settings-section">
            <h2>Memory</h2>

            <div className="setting-item">
              <div>
                <strong>Remember Conversations</strong>
                <p>Cupid remembers previous chats for better replies.</p>
              </div>

              <button
                className={
                  settings.aiSettings.rememberConversations
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={() =>
                  updateAISetting(
                    "rememberConversations",
                    !settings.aiSettings.rememberConversations
                  )
                }
              >
                <span />
              </button>
            </div>

            <button className="danger-btn">
              Clear All Memories
            </button>
          </div>
        )}

        {/* ACCOUNT */}
        {activeTab === "Account" && (
          <div className="settings-section">
            <h2>Account</h2>

            <div className="account-card">
              <strong>Current Plan</strong>
              <span>{settings.subscription.tier.toUpperCase()}</span>
            </div>

            <div className="account-card">
              <strong>Email</strong>
              <span>{settings.email}</span>
            </div>

            <button className="logout-btn">
              Logout
            </button>
          </div>
        )}

        {saving && <div className="settings-saving">Saving changes...</div>}
      </section>
    </div>
  );
}