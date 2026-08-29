/* ═══════════════════════════════════════════════════════════
   CYBER TUTOR AI — Chat Interface JS
   All core logic preserved. UI updated for premium feel.
   ═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'cyber-tutor-chats';

// ── State ──
let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentSessionId = null;
let currentMessages = [];
let isTyping = false;
let currentModel = localStorage.getItem('cyber_tutor_model') || 'auto';

// ── DOM refs ──
const messagesEl    = document.getElementById('messages');
const chatInput     = document.getElementById('chatInput');
const sendBtn       = document.getElementById('sendBtn');
const historyList   = document.getElementById('historyList');
const emptyState    = document.getElementById('emptyState');
const sidebar       = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const modelSwitcher = document.getElementById('modelSwitcher');
const modelDropdown = document.getElementById('modelDropdown');
const currentModelDisplay = document.getElementById('currentModelDisplay');
const modelOptions  = document.querySelectorAll('.model-option');

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  startNewChat();
  initModelSwitcher();

  // Check for topic from URL
  const params = new URLSearchParams(window.location.search);
  const topic  = params.get('topic');
  if (topic) {
    const greetings = {
      networking: 'Hi! I want to learn about Networking Basics.',
      linux:      'Hi! Can you help me with Linux Commands?',
      websec:     'Hi! Teach me about Web Security.',
      crypto:     'Hi! I want to understand Cryptography.',
      ethical:    'Hi! How do I get started with Ethical Hacking?',
      career:     'Hi! What career paths exist in cybersecurity?',
    };
    if (greetings[topic]) {
      setTimeout(() => sendMessage(greetings[topic]), 500);
    }
  }

  // Suggestion chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.textContent.trim()));
  });

  // Mobile sidebar toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', e => {
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== sidebarToggle) {
      sidebar.classList.remove('open');
      sidebarToggle && sidebarToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// ── Model Switcher Logic ──
function initModelSwitcher() {
  if (!modelSwitcher || !modelDropdown) return;

  // Set initial state from localStorage
  updateModelUI(currentModel);

  // Toggle dropdown
  modelSwitcher.addEventListener('click', (e) => {
    // Only toggle if clicked on the switcher button itself, not the dropdown menu
    if (e.target.closest('.model-dropdown')) return;
    const isExpanded = modelSwitcher.getAttribute('aria-expanded') === 'true';
    modelSwitcher.setAttribute('aria-expanded', !isExpanded);
  });

  // Handle option selection
  modelOptions.forEach(option => {
    option.addEventListener('click', () => {
      const selected = option.getAttribute('data-model');
      currentModel = selected;
      localStorage.setItem('cyber_tutor_model', selected);
      updateModelUI(selected);
      modelSwitcher.setAttribute('aria-expanded', 'false');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!modelSwitcher.contains(e.target)) {
      modelSwitcher.setAttribute('aria-expanded', 'false');
    }
  });
}

function updateModelUI(modelId) {
  if (!currentModelDisplay || !modelOptions) return;
  
  // Update active styling
  modelOptions.forEach(opt => {
    if (opt.getAttribute('data-model') === modelId) {
      opt.classList.add('active');
      opt.setAttribute('aria-selected', 'true');
      currentModelDisplay.textContent = opt.querySelector('.model-name').textContent;
    } else {
      opt.classList.remove('active');
      opt.setAttribute('aria-selected', 'false');
    }
  });
}

// ── Helper ──
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ── New Chat ──
window.startNewChat = function () {
  currentSessionId = generateUUID();
  currentMessages = [];
  messagesEl.innerHTML = '';
  showEmptyState(true);

  // Re-attach chip listeners after DOM cleared
  setTimeout(() => {
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.textContent.trim()));
    });
  }, 0);

  chatInput && chatInput.focus();
};

// ── Input handling ──
if (chatInput) {
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerSend();
    }
  });
  // Auto-grow textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
  });
}

if (sendBtn) sendBtn.addEventListener('click', triggerSend);

function triggerSend () {
  const text = chatInput?.value.trim();
  if (text) sendMessage(text);
}

// ── Send message ──
async function sendMessage (text) {
  if (isTyping) return;
  showEmptyState(false);

  appendMessage('user', text);
  currentMessages.push({ role: 'user', content: text });

  if (chatInput) { chatInput.value = ''; chatInput.style.height = 'auto'; }
  if (sendBtn)   sendBtn.disabled = true;

  const typingEl = appendTyping();
  isTyping = true;

  try {
    const reply = await callCyberTutorAI(text);
    typingEl.remove();
    appendMessage('bot', reply);
    currentMessages.push({ role: 'assistant', content: reply });
    saveSession(text);
  } catch (err) {
    typingEl.remove();
    
    let errMsg = 'Something went wrong. Please try again.';
    if (err.status === 503 || err.status === 429) {
      if (err.message && err.message.toLowerCase().includes('timeout')) {
        errMsg = 'Connection timed out. Try another model.';
      } else {
        errMsg = 'Model is busy or unavailable. Please try again.';
      }
    } else if (err.message && err.message.includes('Failed to fetch')) {
      errMsg = 'Could not reach the server. Please check your connection.';
    } else if (err.message && err.message.toLowerCase().includes('timeout')) {
      errMsg = 'Connection timed out. Try another model.';
    }
    
    appendMessage('bot', `⚠️ ${errMsg}`);
    console.error('API error:', err);
  }

  isTyping = false;
  if (sendBtn) sendBtn.disabled = false;
  chatInput && chatInput.focus();
}

// ── API call via Backend ──
async function callCyberTutorAI (userMessage) {
  if (!window.CyberTutorAPI) {
    throw new Error('CyberTutorAPI client is missing. Make sure api.js is loaded and the backend is running.');
  }
  
  console.log(`[Frontend Flow] Preparing to send request to backend.`);
  console.log(`[Frontend Flow] Selected Model: '${currentModel}'`);
  console.log(`[Frontend Flow] Session ID: '${currentSessionId}'`);
  console.log(`[Frontend Flow] Payload keys: message, model, session_id`);
  
  const data = await window.CyberTutorAPI.ai.chat(userMessage, currentModel, currentSessionId);
  return data.reply || '(No response)';
}

// ── Render helpers ──
function appendMessage (role, text) {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const div = document.createElement('div');
  div.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = role === 'bot' ? '🛡' : '👤';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = formatText(text);

  const time = document.createElement('span');
  time.className = 'msg-time';
  time.textContent = now;
  time.setAttribute('aria-label', `Sent at ${now}`);

  content.appendChild(bubble);
  content.appendChild(time);

  div.appendChild(avatar);
  div.appendChild(content);
  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

function appendTyping () {
  const div = document.createElement('div');
  div.className = 'message bot';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = '🛡';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.setAttribute('aria-label', 'AI is typing');
  bubble.innerHTML = `<div class="typing-indicator" aria-hidden="true">
    <span></span><span></span><span></span>
  </div>`;

  content.appendChild(bubble);
  div.appendChild(avatar);
  div.appendChild(content);
  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

function scrollToBottom () {
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function showEmptyState (show) {
  if (!emptyState) return;
  emptyState.style.display = show ? 'flex' : 'none';
}

// Basic text formatter (bold, inline code, newlines)
function formatText (text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// ── Session persistence ──
function saveSession (firstMsg) {
  const snippet = firstMsg.substring(0, 50) + (firstMsg.length > 50 ? '…' : '');
  const existing = chatHistory.findIndex(h => h.id === currentSessionId);

  if (existing >= 0) {
    chatHistory[existing].messages = currentMessages;
    chatHistory[existing].updated = Date.now();
  } else {
    chatHistory.unshift({
      id:       currentSessionId,
      label:    snippet,
      messages: currentMessages,
      updated:  Date.now(),
    });
  }

  // Keep last 20 sessions
  chatHistory = chatHistory.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  renderHistory();
}

function renderHistory () {
  if (!historyList) return;
  historyList.innerHTML = '';
  if (chatHistory.length === 0) {
    historyList.innerHTML = '<p class="history-empty">No conversations yet</p>';
    return;
  }
  chatHistory.forEach(session => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('title', session.label);
    item.setAttribute('aria-label', `Load conversation: ${session.label}`);
    item.textContent = session.label;
    item.addEventListener('click', () => loadSession(session));
    item.addEventListener('keydown', e => { if (e.key === 'Enter') loadSession(session); });
    historyList.appendChild(item);
  });
}

function loadSession (session) {
  currentSessionId = session.id;
  currentMessages  = session.messages || [];
  messagesEl.innerHTML = '';
  showEmptyState(false);
  currentMessages.forEach(m => appendMessage(m.role === 'user' ? 'user' : 'bot', m.content));
  sidebar && sidebar.classList.remove('open');
  sidebarToggle && sidebarToggle.setAttribute('aria-expanded', 'false');
}
