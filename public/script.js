// ============================================ //
// script.js - Cupid with All Features          //
// ============================================ //

console.log('Cupid script loaded');

// ---------- STATE ----------
const state = {
  token: null,
  user: null,
  isGuest: false,
  guestSessionId: null,
  messages: [],
  messageCount: 0,
  isSending: false,
  currentSessionId: null,
  conversations: [],
  isLoadingHistory: false,
  chatColor: '#6c5ce7',
  theme: 'dark',
  systemTheme: 'dark',
};

// ---------- DOM REFS ----------
function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn('Element not found:', id);
  return el;
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
  initApp();
});

function initApp() {
  // Get all elements
  const authScreen = $('authScreen');
  const chatScreen = $('chatScreen');
  const loginForm = $('loginForm');
  const signupForm = $('signupForm');
  const loginBtn = $('loginBtn');
  const signupBtn = $('signupBtn');
  const guestBtn = $('guestBtn');
  const showSignup = $('showSignup');
  const showLogin = $('showLogin');
  const authError = $('authError');
  const loginEmail = $('loginEmail');
  const loginPassword = $('loginPassword');
  const signupName = $('signupName');
  const signupEmail = $('signupEmail');
  const signupPassword = $('signupPassword');
  const messagesContainer = $('messagesContainer');
  const messageInput = $('messageInput');
  const sendBtn = $('sendBtn');
  const tierBadge = $('tierBadge');
  const guestBadge = $('guestBadge');
  const logoutBtn = $('logoutBtn');
  const settingsBtn = $('settingsBtn');
  const welcomeMessage = $('welcomeMessage');
  const welcomeText = $('welcomeText');
  const upgradeModal = $('upgradeModal');
  const settingsModal = $('settingsModal');
  const dashboardModal = $('dashboardModal');
  const modalClose = $('modalClose');
  const settingsClose = $('settingsClose');
  const dashboardClose = $('dashboardClose');
  const upgradePlusBtn = $('upgradePlusBtn');
  const upgradeProBtn = $('upgradeProBtn');
  const settingsMode = $('settingsMode');
  const settingsEmail = $('settingsEmail');
  const settingsTier = $('settingsTier');
  const settingsSignupBtn = $('settingsSignupBtn');
  const clearHistoryBtn = $('clearHistoryBtn');
  const chatHistoryList = $('chatHistoryList');
  const mobileChatHistory = $('mobileChatHistory');
  const newChatBtn = $('newChatBtn');
  const mobileNewChatBtn = $('mobileNewChatBtn');
  const mobileMenuBtn = $('mobileMenuBtn');
  const mobileSidebar = $('mobileSidebar');
  const mobileSidebarOverlay = $('mobileSidebarOverlay');
  const mobileSidebarClose = $('mobileSidebarClose');
  const sidebarUserName = $('sidebarUserName');
  const sidebarUserTier = $('sidebarUserTier');
  const sidebarAvatar = $('sidebarAvatar');
  const sidebarLogoutBtn = $('sidebarLogoutBtn');
  const sidebarSettingsBtn = $('sidebarSettingsBtn');
  const sidebarDashboardBtn = $('sidebarDashboardBtn');
  const themeToggleBtn = $('themeToggleBtn');
  const darkModeToggle = $('darkModeToggle');
  const colorOptions = document.querySelectorAll('.color-option');
  const dashName = $('dashName');
  const dashEmail = $('dashEmail');
  const dashPlan = $('dashPlan');
  const dashMessages = $('dashMessages');
  const upgradeBtn = $('upgradeBtn');
  const settingsUpgradeBtn = $('settingsUpgradeBtn');
  const dashboardUpgradeBtn = $('dashboardUpgradeBtn');

  // Settings page elements
  const settingsPage = $('settingsPage');
  const settingsBackBtn = $('settingsBackBtn');
  const settingsCategoryItems = document.querySelectorAll('.settings-category-item');
  const settingsPanels = {
    general: $('settingsGeneral'),
    profile: $('settingsProfile'),
    data: $('settingsData'),
    about: $('settingsAbout'),
  };
  const themeOptions = document.querySelectorAll('.theme-option');
  const languageSelect = $('languageSelect');
  const settingsUserName = $('settingsUserName');
  const settingsUserEmail = $('settingsUserEmail');
  const settingsUserPlan = $('settingsUserPlan');

  // Forgot Password elements
  const forgotPasswordLink = $('forgotPasswordLink');
  const forgotPasswordModal = $('forgotPasswordModal');
  const forgotPasswordClose = $('forgotPasswordClose');
  const backToLogin = $('backToLogin');
  const resetPasswordBtn = $('resetPasswordBtn');
  const resetEmail = $('resetEmail');

  // Logout Modal elements
  const logoutModal = $('logoutModal');
  const logoutConfirmBtn = $('logoutConfirmBtn');
  const logoutCancelBtn = $('logoutCancelBtn');

  // Image Upload elements
  const imageUpload = $('imageUpload');
  let uploadedImage = null;

  // ---------- API BASE ----------
  const API_URL = 'http://localhost:5000/api';
  console.log('API URL:', API_URL);

  // ---------- THEME FUNCTIONS ----------
  function setTheme(theme) {
    state.theme = theme;
    
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === 'light');
      });
    } else if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === 'dark');
      });
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === 'system');
      });
    }
    
    localStorage.setItem('cupidTheme', theme);
    
    if (themeToggleBtn) {
      const icon = theme === 'light' ? 'bx-moon' : 'bx-sun';
      const label = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
      themeToggleBtn.innerHTML = `<i class="bx ${icon}"></i> ${label}`;
    }
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('cupidTheme') || 'dark';
  setTheme(savedTheme);

  // Theme toggle from dashboard
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }

  // Theme options in settings
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      setTheme(opt.dataset.theme);
    });
  });

  // ---------- CHAT COLOR FUNCTIONS ----------
  function setChatColor(color) {
    state.chatColor = color;
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-hover', color + 'dd');
    localStorage.setItem('cupidChatColor', color);
    
    colorOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.color === color);
    });
  }

  // Load saved color
  const savedColor = localStorage.getItem('cupidChatColor') || '#6c5ce7';
  setChatColor(savedColor);

  colorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      setChatColor(opt.dataset.color);
    });
  });

  // ---------- SCREEN CONTROLS ----------
  function showScreen(screen) {
    if (!authScreen || !chatScreen) return;
    
    if (screen === authScreen) {
      authScreen.style.display = 'flex';
      chatScreen.style.display = 'none';
    } else if (screen === chatScreen) {
      authScreen.style.display = 'none';
      chatScreen.style.display = 'flex';
    }
  }

  // ---------- HELPERS ----------
  function showError(message) {
    if (authError) {
      authError.textContent = message;
      authError.classList.remove('hidden');
    }
  }

  function hideError() {
    if (authError) {
      authError.classList.add('hidden');
    }
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    return new Date(date).toLocaleDateString();
  }

  function getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (state.token) {
      headers['Authorization'] = 'Bearer ' + state.token;
    }
    return headers;
  }

  // ---------- SCROLL TO BOTTOM ----------
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // ---------- UI HELPERS ----------
  function addMessageToUI(message, saveToState = true) {
    const isUser = message.role === 'user';
    const div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user' : 'assistant');

    // Check if it's an image message
    if (message.imageUrl) {
      const img = document.createElement('img');
      img.src = message.imageUrl;
      img.alt = 'Generated image';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.marginTop = '8px';
      div.appendChild(img);
      
      const textSpan = document.createElement('span');
      textSpan.className = 'message-text';
      textSpan.textContent = message.content || '📷 Image';
      div.appendChild(textSpan);
    } else {
      const textSpan = document.createElement('span');
      textSpan.className = 'message-text';
      textSpan.textContent = message.content;
      div.appendChild(textSpan);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(message.timestamp || new Date());
    div.appendChild(timeSpan);

    const welcome = document.getElementById('welcomeMessage');
    if (welcome && welcome.parentNode) {
      welcome.remove();
    }

    messagesContainer.appendChild(div);
    scrollToBottom();

    if (saveToState) {
      state.messages.push(message);
    }
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    if (messagesContainer) {
      messagesContainer.appendChild(div);
      scrollToBottom();
    }
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  // ---------- CLOSE ALL DROPDOWNS ----------
  function closeAllDropdowns() {
    document.querySelectorAll('.history-dropdown').forEach(dropdown => {
      dropdown.classList.add('hidden');
      dropdown.style.display = 'none';
    });
  }

  // ---------- RENAME CHAT ----------
  async function handleRename(sessionId) {
    closeAllDropdowns();
    
    const conversation = state.conversations.find(c => c.sessionId === sessionId);
    if (!conversation) return;
    
    const newTitle = prompt('Rename conversation:', conversation.title);
    if (newTitle === null || newTitle.trim() === '') return;
    
    try {
      conversation.title = newTitle.trim();
      renderConversations();
      console.log('Renamed conversation to:', newTitle.trim());
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename conversation');
    }
  }

  // ---------- DELETE CHAT ----------
  async function handleDelete(sessionId) {
    closeAllDropdowns();
    
    if (!confirm('Delete this conversation?')) return;
    
    try {
      const res = await fetch(API_URL + '/chat/conversation/' + sessionId, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to delete conversation');
      
      state.conversations = state.conversations.filter(c => c.sessionId !== sessionId);
      
      if (state.currentSessionId === sessionId) {
        state.currentSessionId = null;
        state.messages = [];
        showWelcomeMessage();
      }
      
      renderConversations();
      console.log('Conversation deleted');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete conversation');
    }
  }

  // ---------- AUTH ----------
  if (showSignup) {
    showSignup.addEventListener('click', () => {
      hideError();
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
    });
  }

  if (showLogin) {
    showLogin.addEventListener('click', () => {
      hideError();
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }

  // ---------- SIGNUP ----------
  if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
      hideError();
      const name = signupName ? signupName.value.trim() : '';
      const email = signupEmail ? signupEmail.value.trim() : '';
      const password = signupPassword ? signupPassword.value : '';

      console.log('📝 Signup data:', { name, email, password: password ? '****' : 'empty' });

      if (!name || !email || !password) {
        console.log('❌ Missing fields');
        showError('Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      try {
        const payload = { name, email, password };
        console.log('📤 Sending payload:', payload);

        const res = await fetch(API_URL + '/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log('📥 Response:', data);

        if (!res.ok) {
          showError(data.error || 'Signup failed');
          return;
        }

        state.token = data.token;
        state.user = data.user;
        state.isGuest = false;
        state.messageCount = 0;

        localStorage.setItem('cupidToken', data.token);
        localStorage.setItem('cupidUser', JSON.stringify(data.user));

        console.log('✅ Signup successful');
        await loadConversations();
        enterChat();

      } catch (error) {
        console.error('Signup error:', error);
        showError('Network error. Please try again.');
      }
    });
  }

  // ---------- LOGIN ----------
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      hideError();
      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      if (!email || !password) {
        showError('Please fill in all fields');
        return;
      }

      try {
        console.log('Logging in:', email);
        const res = await fetch(API_URL + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          showError(data.error || 'Login failed');
          return;
        }

        state.token = data.token;
        state.user = data.user;
        state.isGuest = false;
        state.messageCount = data.user.usage?.totalMessages || 0;

        localStorage.setItem('cupidToken', data.token);
        localStorage.setItem('cupidUser', JSON.stringify(data.user));

        console.log('Login successful');
        await loadConversations();
        enterChat();
      } catch (error) {
        showError('Network error. Please try again.');
        console.error('Login error:', error);
      }
    });
  }

  // Guest Mode
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      console.log('Guest mode activated');
      hideError();
      state.isGuest = true;
      state.token = null;
      state.user = null;
      state.guestSessionId = 'guest_' + Date.now();
      state.messageCount = 0;
      state.currentSessionId = state.guestSessionId;

      localStorage.removeItem('cupidToken');
      localStorage.removeItem('cupidUser');
      localStorage.setItem('guestSessionId', state.guestSessionId);

      enterChat();
    });
  }

  // ---------- LOAD CONVERSATIONS ----------
  async function loadConversations() {
    if (state.isGuest || !state.token) return;
    
    try {
      state.isLoadingHistory = true;
      const res = await fetch(API_URL + '/chat/conversations', {
        headers: getHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to load conversations');
      
      const data = await res.json();
      state.conversations = data.conversations || [];
      
      renderConversations();
      
      if (state.conversations.length > 0 && !state.currentSessionId) {
        const mostRecent = state.conversations[0];
        await loadConversation(mostRecent.sessionId);
      }
      
      console.log('Loaded ' + state.conversations.length + ' conversations');
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      state.isLoadingHistory = false;
    }
  }

  // ---------- LOAD SINGLE CONVERSATION ----------
  async function loadConversation(sessionId) {
    if (state.isGuest || !state.token) return;
    
    try {
      const res = await fetch(API_URL + '/chat/conversation/' + sessionId, {
        headers: getHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to load conversation');
      
      const data = await res.json();
      state.currentSessionId = sessionId;
      state.messages = data.messages || [];
      
      messagesContainer.innerHTML = '';
      
      if (state.messages.length === 0) {
        showWelcomeMessage();
      } else {
        state.messages.forEach(msg => {
          addMessageToUI(msg, false);
        });
        scrollToBottom();
      }
      
      renderConversations();
      updateUI();
      
      console.log('Loaded ' + state.messages.length + ' messages');
    } catch (error) {
      console.error('Load conversation error:', error);
    }
  }

  // ---------- RENDER CONVERSATIONS ----------
  function renderConversations() {
    const renderList = (container) => {
      if (!container) return;
      
      if (state.isGuest) {
        container.innerHTML = `
          <div class="chat-history-label">Recent</div>
          <div class="history-item" style="opacity:0.5;cursor:default;">
            <i class="bx bx-lock"></i>
            <span>Sign up to save chats</span>
          </div>
        `;
        return;
      }
      
      if (state.conversations.length === 0) {
        container.innerHTML = `
          <div class="chat-history-label">Recent</div>
          <div class="history-item" style="opacity:0.5;cursor:default;">
            <i class="bx bx-message"></i>
            <span>No conversations yet</span>
          </div>
        `;
        return;
      }
      
      let html = '<div class="chat-history-label">Recent</div>';
      
      state.conversations.forEach((conv) => {
        const isActive = conv.sessionId === state.currentSessionId;
        html += `
          <div class="history-item-wrapper" data-session="${conv.sessionId}">
            <div class="history-item ${isActive ? 'active' : ''}" data-session="${conv.sessionId}">
              <i class="bx bx-message"></i>
              <span class="history-title">${conv.title}</span>
              <span class="history-time">${formatRelativeTime(conv.lastMessageAt)}</span>
              <button class="history-menu-btn" data-session="${conv.sessionId}">
                <i class="bx bx-dots-vertical-rounded"></i>
              </button>
            </div>
            <div class="history-dropdown hidden" data-session="${conv.sessionId}">
              <button class="dropdown-item rename-btn" data-session="${conv.sessionId}">
                <i class="bx bx-edit"></i> Rename
              </button>
              <button class="dropdown-item delete-btn" data-session="${conv.sessionId}">
                <i class="bx bx-trash"></i> Delete
              </button>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
      
      container.querySelectorAll('.history-item[data-session]').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('.history-menu-btn')) return;
          const sessionId = item.dataset.session;
          loadConversation(sessionId);
          closeMobileSidebar();
          closeAllDropdowns();
        });
      });
      
      container.querySelectorAll('.history-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sessionId = btn.dataset.session;
          const dropdown = container.querySelector(`.history-dropdown[data-session="${sessionId}"]`);
          const isOpen = dropdown && !dropdown.classList.contains('hidden');
          
          closeAllDropdowns();
          
          if (!isOpen && dropdown) {
            dropdown.classList.remove('hidden');
            dropdown.style.display = 'block';
          }
        });
      });
      
      container.querySelectorAll('.rename-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sessionId = btn.dataset.session;
          handleRename(sessionId);
        });
      });
      
      container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sessionId = btn.dataset.session;
          handleDelete(sessionId);
        });
      });
    };

    renderList(chatHistoryList);
    renderList(mobileChatHistory);
  }

  // ---------- SHOW WELCOME MESSAGE ----------
  function showWelcomeMessage() {
    messagesContainer.innerHTML = `
      <div class="welcome-message" id="welcomeMessage">
        <div class="welcome-avatar">✦</div>
        <h2>Hello</h2>
        <p id="welcomeText">${state.isGuest ? "You're in Guest mode. Sign up to save your chats." : 'How can I help you today?'}</p>
        <p class="welcome-sub">Try: "Help me plan my day" or "Draw a Nigerian sunset"</p>
      </div>
    `;
  }

  // ---------- ENTER CHAT ----------
  function enterChat() {
    console.log('Entering chat...');
    
    authScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    if (sidebarUserName) {
      sidebarUserName.textContent = state.isGuest ? 'Guest' : state.user?.name || 'User';
    }
    if (sidebarUserTier) {
      sidebarUserTier.textContent = state.isGuest ? 'Free' : state.user?.subscription?.tier || 'Free';
    }
    if (sidebarAvatar) {
      sidebarAvatar.textContent = state.isGuest ? 'G' : (state.user?.name?.charAt(0) || 'U');
    }
    
    if (settingsUserName) {
      settingsUserName.textContent = state.isGuest ? 'Guest' : state.user?.name || 'User';
    }
    if (settingsUserEmail) {
      settingsUserEmail.textContent = state.isGuest ? 'Not logged in' : state.user?.email || '';
    }
    if (settingsUserPlan) {
      settingsUserPlan.textContent = state.isGuest ? 'Free' : state.user?.subscription?.tier || 'Free';
    }
    
    if (state.messages.length === 0) {
      showWelcomeMessage();
    }
    
    updateUI();
    messageInput.focus();
  }

  // ---------- UPDATE UI ----------
  function updateUI() {
    const tier = state.user?.subscription?.tier || 'free';
    const isPro = tier === 'pro';
    const isPlus = tier === 'plus';
    const used = state.messageCount || 0;

    if (tierBadge) {
      tierBadge.textContent = state.isGuest ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1);
      tierBadge.className = 'tier-badge';
      if (isPro) tierBadge.classList.add('pro');
      if (isPlus) tierBadge.classList.add('plus');
    }

    if (guestBadge) {
      guestBadge.classList.toggle('hidden', !state.isGuest);
    }

    if (settingsMode) {
      settingsMode.textContent = state.isGuest ? 'Guest' : 'Registered';
    }
    if (settingsEmail) {
      settingsEmail.textContent = state.isGuest ? 'Not logged in' : state.user?.email || '';
    }
    if (settingsTier) {
      settingsTier.textContent = state.isGuest ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1);
    }

    if (dashName) dashName.textContent = state.isGuest ? 'Guest' : state.user?.name || '-';
    if (dashEmail) dashEmail.textContent = state.isGuest ? 'Not logged in' : state.user?.email || '-';
    if (dashPlan) dashPlan.textContent = state.isGuest ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1);
    if (dashMessages) dashMessages.textContent = used;

    if (settingsUserName) {
      settingsUserName.textContent = state.isGuest ? 'Guest' : state.user?.name || 'User';
    }
    if (settingsUserEmail) {
      settingsUserEmail.textContent = state.isGuest ? 'Not logged in' : state.user?.email || '';
    }
    if (settingsUserPlan) {
      settingsUserPlan.textContent = state.isGuest ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1);
    }

    if (settingsSignupBtn) {
      settingsSignupBtn.classList.toggle('hidden', !state.isGuest);
    }
  }

  // ---------- IMAGE UPLOAD ----------
  if (imageUpload) {
    imageUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedImage = event.target.result;
          addMessageToUI({
            role: 'user',
            content: '📷 Uploaded image for editing',
            timestamp: new Date().toISOString(),
            isImage: true,
            imageUrl: uploadedImage,
          }, true);
          setTimeout(function() {
            addMessageToUI({
              role: 'assistant',
              content: '✂️ I can remove the background from this image. Just say "Remove background" or "Make it transparent"!',
              timestamp: new Date().toISOString(),
            }, true);
          }, 500);
        };
        reader.readAsDataURL(file);
        // Reset input so same file can be uploaded again
        imageUpload.value = '';
      }
    });
  }

  // ---------- SEND MESSAGE ----------
  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || state.isSending) return;

    state.isSending = true;
    messageInput.disabled = true;
    sendBtn.disabled = true;

    // ---------- CHECK FOR IMAGE EDITING COMMANDS ----------
    const editKeywords = ['remove background', 'make transparent', 'remove bg', 'edit image', 'edit picture', 'background'];
    const isEditRequest = editKeywords.some(function(keyword) {
      return text.toLowerCase().includes(keyword);
    });

    if (isEditRequest && uploadedImage) {
      console.log('✂️ Image editing detected!');
      try {
        const res = await fetch(API_URL + '/images/remove-bg', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ imageUrl: uploadedImage }),
        });
        
        const data = await res.json();
        if (data.success) {
          addMessageToUI({
            role: 'assistant',
            content: '✂️ Background removed successfully!',
            timestamp: new Date().toISOString(),
            isImage: true,
            imageUrl: data.imageUrl,
          }, true);
          uploadedImage = null;
          state.isSending = false;
          messageInput.disabled = false;
          sendBtn.disabled = false;
          messageInput.focus();
          updateUI();
          scrollToBottom();
          return;
        }
      } catch (error) {
        console.error('❌ Image edit error:', error);
      }
    }

    if (!state.currentSessionId) {
      state.currentSessionId = state.isGuest 
        ? state.guestSessionId 
        : 'session_' + Date.now();
    }

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessageToUI(userMessage, true);
    messageInput.value = '';
    state.messageCount = (state.messageCount || 0) + 1;

    showTyping();

    try {
      const body = {
        message: text,
        sessionId: state.currentSessionId,
      };

      console.log('📤 Sending message:', { text, sessionId: state.currentSessionId, isGuest: state.isGuest });

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (!state.isGuest && state.token) {
        headers['Authorization'] = 'Bearer ' + state.token;
      }

      const res = await fetch(API_URL + '/chat/send', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      hideTyping();

      if (!res.ok) {
        if (res.status === 402) {
          const errorMsg = data.message || 'Upgrade required';
          addMessageToUI({
            role: 'assistant',
            content: errorMsg + '\n\nClick "Upgrade" to get unlimited access.',
            timestamp: new Date().toISOString(),
          }, true);
          updateUI();
          state.isSending = false;
          return;
        }
        throw new Error(data.error || 'Failed to get response');
      }

      // Check if response is an image
      if (data.isImage && data.imageUrl) {
        addMessageToUI({
          role: 'assistant',
          content: data.message,
          imageUrl: data.imageUrl,
          timestamp: new Date().toISOString(),
        }, true);
      } else {
        addMessageToUI({
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        }, true);
      }

      if (data.usage) {
        state.messageCount = data.usage.totalMessages || state.messageCount;
      }

      if (!state.isGuest) {
        await loadConversations();
      }

    } catch (error) {
      hideTyping();
      console.error('Send error:', error);
      addMessageToUI({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }, true);
    }

    state.isSending = false;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
    updateUI();
    scrollToBottom();
  }

  // ---------- SETTINGS PAGE ----------
  function openSettingsPage() {
    updateUI();
    settingsPage.classList.remove('hidden');
  }

  function closeSettingsPage() {
    settingsPage.classList.add('hidden');
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettingsPage);
  }

  if (sidebarSettingsBtn) {
    sidebarSettingsBtn.addEventListener('click', openSettingsPage);
  }

  if (settingsBackBtn) {
    settingsBackBtn.addEventListener('click', closeSettingsPage);
  }

  settingsCategoryItems.forEach(item => {
    item.addEventListener('click', () => {
      settingsCategoryItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const panelId = item.dataset.panel;
      Object.keys(settingsPanels).forEach(key => {
        settingsPanels[key].classList.toggle('active', key === panelId);
      });
    });
  });

  // ---------- FORGOT PASSWORD ----------
  function showForgotStatus(message, type) {
    const modalContent = document.querySelector('#forgotPasswordModal .modal-content');
    const oldStatus = document.querySelector('#forgotPasswordModal .status');
    if (oldStatus) oldStatus.remove();

    const statusDiv = document.createElement('div');
    statusDiv.className = 'status ' + type;
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      text-align: center;
      font-size: 14px;
      ${type === 'error' ? 'background: rgba(255,68,68,0.1); color: #ff6b6b; border: 1px solid rgba(255,68,68,0.2);' : ''}
      ${type === 'success' ? 'background: rgba(0,206,201,0.1); color: #00cec9; border: 1px solid rgba(0,206,201,0.2);' : ''}
    `;
    
    const h2 = modalContent.querySelector('h2');
    if (h2) h2.after(statusDiv);
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      forgotPasswordModal.classList.remove('hidden');
      resetEmail.value = '';
      var oldStatus = document.querySelector('#forgotPasswordModal .status');
      if (oldStatus) oldStatus.remove();
    });
  }

  if (forgotPasswordClose) {
    forgotPasswordClose.addEventListener('click', function() {
      forgotPasswordModal.classList.add('hidden');
    });
  }

  if (backToLogin) {
    backToLogin.addEventListener('click', function() {
      forgotPasswordModal.classList.add('hidden');
    });
  }

  if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', async function() {
      var email = resetEmail.value.trim();
      
      var oldStatus = document.querySelector('#forgotPasswordModal .status');
      if (oldStatus) oldStatus.remove();

      if (!email) {
        showForgotStatus('Please enter your email address', 'error');
        return;
      }

      resetPasswordBtn.disabled = true;
      resetPasswordBtn.textContent = 'Sending...';

      try {
        var res = await fetch(API_URL + '/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
        });

        var data = await res.json();

        if (!res.ok) {
          showForgotStatus(data.error || 'Failed to send reset link', 'error');
          resetPasswordBtn.disabled = false;
          resetPasswordBtn.textContent = 'Send Reset Link';
          return;
        }

        showForgotStatus('✅ Password reset link sent to your email! Check your inbox.', 'success');
        resetPasswordBtn.textContent = 'Sent!';
        
        setTimeout(function() {
          forgotPasswordModal.classList.add('hidden');
          resetPasswordBtn.disabled = false;
          resetPasswordBtn.textContent = 'Send Reset Link';
          resetEmail.value = '';
        }, 3000);

      } catch (error) {
        showForgotStatus('Network error. Please try again.', 'error');
        resetPasswordBtn.disabled = false;
        resetPasswordBtn.textContent = 'Send Reset Link';
      }
    });
  }

  if (forgotPasswordModal) {
    forgotPasswordModal.addEventListener('click', function(e) {
      if (e.target === forgotPasswordModal) forgotPasswordModal.classList.add('hidden');
    });
  }

  // ---------- LOGOUT MODAL ----------
  function showLogoutModal() {
    logoutModal.classList.remove('hidden');
  }

  function hideLogoutModal() {
    logoutModal.classList.add('hidden');
  }

  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', function() {
      hideLogoutModal();
      performLogout();
    });
  }

  if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', hideLogoutModal);
  }

  if (logoutModal) {
    logoutModal.addEventListener('click', function(e) {
      if (e.target === logoutModal) hideLogoutModal();
    });
  }

  // ---------- PERFORM LOGOUT ----------
  function performLogout() {
    state.token = null;
    state.user = null;
    state.isGuest = false;
    state.messages = [];
    state.messageCount = 0;
    state.currentSessionId = null;
    state.conversations = [];
    
    localStorage.removeItem('cupidToken');
    localStorage.removeItem('cupidUser');
    localStorage.removeItem('guestSessionId');
    
    authScreen.style.display = 'flex';
    chatScreen.style.display = 'none';
    closeSettingsPage();
    
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginEmail.value = '';
    loginPassword.value = '';
    signupName.value = '';
    signupEmail.value = '';
    signupPassword.value = '';
    
    closeMobileSidebar();
    renderConversations();
    hideLogoutModal();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }

  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', showLogoutModal);
  }

  // ---------- MOBILE SIDEBAR ----------
  function openMobileSidebar() {
    mobileSidebar.classList.add('open');
    mobileSidebarOverlay.classList.add('show');
  }

  function closeMobileSidebar() {
    mobileSidebar.classList.remove('open');
    mobileSidebarOverlay.classList.remove('show');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileSidebar);
  }

  if (mobileSidebarClose) {
    mobileSidebarClose.addEventListener('click', closeMobileSidebar);
  }

  if (mobileSidebarOverlay) {
    mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  // ---------- NEW CHAT ----------
  function startNewChat() {
    state.currentSessionId = state.isGuest 
      ? 'guest_' + Date.now() 
      : 'session_' + Date.now();
    state.messages = [];
    showWelcomeMessage();
    renderConversations();
    messageInput.focus();
    closeMobileSidebar();
    console.log('New chat started:', state.currentSessionId);
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', startNewChat);
  }

  if (mobileNewChatBtn) {
    mobileNewChatBtn.addEventListener('click', startNewChat);
  }

  // ---------- EVENT LISTENERS ----------
  if (messageInput) {
    messageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  // ---------- MODALS ----------
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', function() {
      upgradeModal.classList.remove('hidden');
    });
  }

  if (settingsUpgradeBtn) {
    settingsUpgradeBtn.addEventListener('click', function() {
      closeSettingsPage();
      upgradeModal.classList.remove('hidden');
    });
  }

  if (dashboardUpgradeBtn) {
    dashboardUpgradeBtn.addEventListener('click', function() {
      dashboardModal.classList.add('hidden');
      upgradeModal.classList.remove('hidden');
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', function() {
      upgradeModal.classList.add('hidden');
    });
  }

  if (sidebarDashboardBtn) {
    sidebarDashboardBtn.addEventListener('click', function() {
      updateUI();
      dashboardModal.classList.remove('hidden');
    });
  }

  if (dashboardClose) {
    dashboardClose.addEventListener('click', function() {
      dashboardModal.classList.add('hidden');
    });
  }

  if (settingsClose) {
    settingsClose.addEventListener('click', function() {
      settingsModal.classList.add('hidden');
    });
  }

  if (upgradeModal) {
    upgradeModal.addEventListener('click', function(e) {
      if (e.target === upgradeModal) upgradeModal.classList.add('hidden');
    });
  }

  if (settingsModal) {
    settingsModal.addEventListener('click', function(e) {
      if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });
  }

  if (dashboardModal) {
    dashboardModal.addEventListener('click', function(e) {
      if (e.target === dashboardModal) dashboardModal.classList.add('hidden');
    });
  }

  // ---------- UPGRADE BUTTONS ----------
  if (upgradePlusBtn) {
    upgradePlusBtn.addEventListener('click', function() {
      alert('Cupid Plus: $1.99 for 24 hours\n\nStripe integration coming soon!');
      upgradeModal.classList.add('hidden');
    });
  }

  if (upgradeProBtn) {
    upgradeProBtn.addEventListener('click', function() {
      alert('Cupid Pro: $15/month\n\nFirst month 30% off ($10.50)\n\nStripe integration coming soon!');
      upgradeModal.classList.add('hidden');
    });
  }

  if (settingsSignupBtn) {
    settingsSignupBtn.addEventListener('click', function() {
      settingsModal.classList.add('hidden');
      performLogout();
    });
  }

  // ---------- CLEAR HISTORY ----------
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async function() {
      if (!state.currentSessionId || state.isGuest) {
        alert('No conversation to clear or you are in guest mode.');
        return;
      }
      
      if (confirm('Clear all messages in this conversation?')) {
        try {
          var res = await fetch(API_URL + '/chat/conversation/' + state.currentSessionId, {
            method: 'DELETE',
            headers: getHeaders()
          });
          
          if (!res.ok) throw new Error('Failed to delete conversation');
          
          state.messages = [];
          showWelcomeMessage();
          await loadConversations();
          settingsModal.classList.add('hidden');
        } catch (error) {
          console.error('Clear history error:', error);
          alert('Failed to clear history. Please try again.');
        }
      }
    });
  }

  // ---------- DARK MODE TOGGLE ----------
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function(e) {
      setTheme(e.target.checked ? 'dark' : 'light');
    });
  }

  // ---------- INIT ----------
  function init() {
    console.log('Initializing Cupid...');
    var token = localStorage.getItem('cupidToken');
    var userStr = localStorage.getItem('cupidUser');
    var guestSession = localStorage.getItem('guestSessionId');

    authScreen.style.display = 'flex';
    chatScreen.style.display = 'none';

    if (token && userStr) {
      try {
        var user = JSON.parse(userStr);
        state.token = token;
        state.user = user;
        state.isGuest = false;
        console.log('Logged in as:', user.email);
        loadConversations().then(function() {
          enterChat();
        });
        return;
      } catch (e) {
        console.warn('Invalid user data, clearing...');
        localStorage.removeItem('cupidUser');
      }
    }

    if (guestSession) {
      state.isGuest = true;
      state.guestSessionId = guestSession;
      state.messageCount = 0;
      state.currentSessionId = guestSession;
      console.log('Guest mode from localStorage');
      enterChat();
      return;
    }

    console.log('Showing auth screen');
  }

  init();
  console.log('Cupid is ready!');
}

// ---------- UPGRADE BUTTONS ----------
if (upgradePlusBtn) {
  upgradePlusBtn.addEventListener('click', async function() {
    try {
      const res = await fetch(API_URL + '/subscription/simulate-payment', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ plan: 'plus' })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + data.message);
        upgradeModal.classList.add('hidden');
        // Refresh user data
        await loadConversations();
        updateUI();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Payment failed. Please try again.');
    }
  });
}

if (upgradeProBtn) {
  upgradeProBtn.addEventListener('click', async function() {
    try {
      const res = await fetch(API_URL + '/subscription/simulate-payment', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ plan: 'pro' })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + data.message);
        upgradeModal.classList.add('hidden');
        // Refresh user data
        await loadConversations();
        updateUI();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Payment failed. Please try again.');
    }
  });
}