// ============================================================
//  Frontend/js/api.js
//  Central API client for all backend calls.
//  Import this file in any page that needs backend access.
// ============================================================

(function (window) {
  'use strict';

  // ── Base URL ────────────────────────────────────────────
  // In development, backend runs on :5000
  // In production, set this to your deployed backend URL
  const API_BASE = window.CYBER_TUTOR_API_BASE || 'http://localhost:5000/api';

  // ── Auth token helper ────────────────────────────────────
  function getToken() {
    return localStorage.getItem('cyber_tutor_access_token') || '';
  }

  function setToken(token, refreshToken) {
    localStorage.setItem('cyber_tutor_access_token', token);
    if (refreshToken) localStorage.setItem('cyber_tutor_refresh_token', refreshToken);
  }

  function clearToken() {
    localStorage.removeItem('cyber_tutor_access_token');
    localStorage.removeItem('cyber_tutor_refresh_token');
  }

  // ── Core fetch wrapper ────────────────────────────────────
  async function apiFetch(path, options = {}) {
    const token = getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // Parse JSON response
    let body;
    try {
      body = await res.json();
    } catch {
      body = { error: 'Invalid JSON from server.' };
    }

    if (!res.ok) {
      const err = new Error(body.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.body   = body;
      throw err;
    }

    return body;
  }

  // ── Auth ─────────────────────────────────────────────────
  const auth = {
    async logout() {
      try {
        if (window.supabaseClient) {
          await window.supabaseClient.auth.signOut();
        } else {
          await apiFetch('/auth/logout', { method: 'POST' });
        }
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        clearToken();
        // Redirect to auth after logout
        const isAuthPage = window.location.pathname.includes('auth.html');
        if (!isAuthPage) {
          window.location.href = window.location.pathname.includes('/pages/') 
            ? '../../auth/auth.html' 
            : './auth/auth.html';
        }
      }
    },

    async me() {
      if (window.supabaseClient) {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
      }
      return apiFetch('/auth/me');
    },
  };

  // ── User ─────────────────────────────────────────────────
  const user = {
    async getProfile() {
      return apiFetch('/user/profile');
    },

    async updateProfile(updates) {
      return apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  };

  // ── Chat ─────────────────────────────────────────────────
  const chat = {
    async getSessions() {
      return apiFetch('/chat/sessions');
    },

    async createSession(title = 'New Chat', modelUsed = 'auto') {
      return apiFetch('/chat/session', {
        method: 'POST',
        body: JSON.stringify({ title, model_used: modelUsed }),
      });
    },

    async getMessages(sessionId) {
      return apiFetch(`/chat/${sessionId}/messages`);
    },

    async sendMessage(sessionId, role, content, tokenCount = null) {
      return apiFetch(`/chat/${sessionId}/message`, {
        method: 'POST',
        body: JSON.stringify({ role, content, token_count: tokenCount }),
      });
    },

    async deleteSession(sessionId) {
      return apiFetch(`/chat/${sessionId}`, { method: 'DELETE' });
    },
  };

  // ── AI ───────────────────────────────────────────────────
  const ai = {
    /**
     * Send a message to the AI and get a response.
     * @param {string} message — The user's message
     * @param {string} model  — 'auto' | 'openai' | 'claude' | 'gemini'
     * @param {string} [sessionId] — optional: auto-saves to chat history
     */
    async chat(message, model = 'auto', sessionId = null) {
      return apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, model, session_id: sessionId }),
      });
    },
  };

  // ── Quiz ─────────────────────────────────────────────────
  const quiz = {
    async submit(topic, score, totalQuestions) {
      return apiFetch('/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ topic, score, total_questions: totalQuestions }),
      });
    },

    async getHistory(options = {}) {
      const params = new URLSearchParams();
      if (options.limit)  params.set('limit',  options.limit);
      if (options.offset) params.set('offset', options.offset);
      if (options.topic)  params.set('topic',  options.topic);
      const qs = params.toString() ? `?${params}` : '';
      return apiFetch(`/quiz/history${qs}`);
    },
  };

  // ── Progress ──────────────────────────────────────────────
  const progress = {
    async getAll() {
      return apiFetch('/progress');
    },

    async updateTopic(topic, completedLessons, totalLessons) {
      return apiFetch('/progress/update', {
        method: 'POST',
        body: JSON.stringify({ topic, completed_lessons: completedLessons, total_lessons: totalLessons }),
      });
    },

    async updateRoadmap(roadmapLevel, currentStep, completedSteps, status) {
      return apiFetch('/progress/roadmap', {
        method: 'POST',
        body: JSON.stringify({
          roadmap_level:   roadmapLevel,
          current_step:    currentStep,
          completed_steps: completedSteps,
          status,
        }),
      });
    },
  };

  // ── Settings ──────────────────────────────────────────────
  const settings = {
    async get() {
      return apiFetch('/settings');
    },

    async update(updates) {
      return apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  };

  // ── Expose as global CyberTutorAPI ────────────────────────
  window.CyberTutorAPI = {
    auth,
    user,
    chat,
    ai,
    quiz,
    progress,
    settings,
    // Token helpers (for Supabase client-side auth integration)
    getToken,
    setToken,
    clearToken,
  };

})(window);
