/* ═══════════════════════════════════════════════════════════
   CYBER TUTOR AI — Authentication JS
   UI-only | Ready for Supabase integration
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   THEME
   ══════════════════════════════════ */
const html     = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const saved    = localStorage.getItem('cta-theme') || 'dark';
html.setAttribute('data-theme', saved);

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cta-theme', next);
});

/* ══════════════════════════════════
   LUCIDE ICONS
   ══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

/* ══════════════════════════════════
   TOAST
   ══════════════════════════════════ */
let toastTimer = null;

function showToast(msg, type = 'info') {
  const toast    = document.getElementById('toast');
  const iconEl   = toast.querySelector('.toast-icon');
  const msgEl    = toast.querySelector('.toast-msg');
  const icons    = { success: '✅', error: '❌', info: 'ℹ️' };

  iconEl.textContent = icons[type] || '🔔';
  msgEl.textContent  = msg;
  toast.className    = `toast show ${type}`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 3800);
}

/* ══════════════════════════════════
   TAB SWITCHING
   ══════════════════════════════════ */
let activeTab = 'login';

function switchTab(tab) {
  if (tab === activeTab) return;
  activeTab = tab;

  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => {
    const isActive = t.id === `tab-${tab}`;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });

  // Slide indicator
  const indicator = document.getElementById('tabIndicator');
  indicator.classList.toggle('right', tab === 'signup');

  // Swap panels
  document.querySelectorAll('.auth-panel').forEach(p => {
    p.classList.remove('active');
  });
  const panel = document.getElementById(`panel-${tab}`);
  panel.classList.add('active');

  // Reset all errors
  clearAllErrors();
}

/* ══════════════════════════════════
   PASSWORD VISIBILITY TOGGLE
   ══════════════════════════════════ */
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';

  // Swap icon
  btn.innerHTML = isHidden
    ? '<i data-lucide="eye-off"></i>'
    : '<i data-lucide="eye"></i>';
  lucide.createIcons({ nodes: [btn] });
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

/* ══════════════════════════════════
   PASSWORD STRENGTH
   ══════════════════════════════════ */
const strengthLevels = [
  { label: '',       color: '' },
  { label: 'Weak',   color: 'weak' },
  { label: 'Fair',   color: 'fair' },
  { label: 'Good',   color: 'good' },
  { label: 'Strong', color: 'strong' },
];
const strengthColors = {
  weak:   '#ff4d6d',
  fair:   '#f59e0b',
  good:   '#60a5fa',
  strong: '#00ff9d',
};

function checkStrength(value) {
  const segs  = [document.getElementById('s1'), document.getElementById('s2'),
                 document.getElementById('s3'), document.getElementById('s4')];
  const label = document.getElementById('strengthLabel');

  let score = 0;
  if (value.length >= 8)              score++;
  if (/[A-Z]/.test(value))           score++;
  if (/[0-9]/.test(value))           score++;
  if (/[^A-Za-z0-9]/.test(value))    score++;

  const level = strengthLevels[score];

  segs.forEach((seg, i) => {
    seg.className = 'strength-seg';
    if (i < score) seg.classList.add(level.color);
  });

  label.textContent  = value.length ? level.label : '';
  label.style.color  = value.length ? (strengthColors[level.color] || '') : '';
}

/* ══════════════════════════════════
   PASSWORD MATCH
   ══════════════════════════════════ */
function checkMatch() {
  const pass    = document.getElementById('su-password').value;
  const confirm = document.getElementById('confirm-password').value;
  const icon    = document.getElementById('matchIcon');
  const errEl   = document.getElementById('confirm-err');

  if (!confirm) { icon.textContent = ''; return; }

  if (pass === confirm) {
    icon.textContent = '✅';
    errEl.textContent = '';
    document.getElementById('fg-confirm').classList.remove('has-error');
  } else {
    icon.textContent = '❌';
  }
}

/* ══════════════════════════════════
   USERNAME AVAILABILITY (simulated)
   ══════════════════════════════════ */
const takenUsernames = ['admin', 'root', 'cybertutor', 'test', 'user', 'hacker'];
let usernameTimer = null;

function checkUsername(input) {
  const status = document.getElementById('usernameStatus');
  const val    = input.value.trim().toLowerCase();
  clearTimeout(usernameTimer);

  if (!val) { status.textContent = ''; return; }

  status.textContent = '⏳';

  usernameTimer = setTimeout(() => {
    if (val.length < 3) {
      status.textContent = '❌';
      setFieldError('fg-username', 'username-err', 'Username must be at least 3 characters.');
    } else if (takenUsernames.includes(val)) {
      status.textContent = '❌';
      setFieldError('fg-username', 'username-err', `"${val}" is already taken.`);
    } else if (!/^[a-z0-9_]+$/.test(val)) {
      status.textContent = '❌';
      setFieldError('fg-username', 'username-err', 'Only letters, numbers, and underscores.');
    } else {
      status.textContent = '✅';
      clearFieldError('fg-username', 'username-err');
    }
  }, 600);
}

/* ══════════════════════════════════
   FORGOT PASSWORD
   ══════════════════════════════════ */
async function showForgot(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showToast('Enter your email first, then click Forgot password.', 'info');
    document.getElementById('login-email').focus();
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  
  if (!window.supabaseClient) {
    showToast('Auth service unavailable', 'error');
    return;
  }

  const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth/auth.html?reset=true'
  });

  if (error) {
    showToast(error.message, 'error');
  } else {
    showToast(`Password reset link sent to ${email}`, 'success');
  }
}

/* ══════════════════════════════════
   VALIDATION HELPERS
   ══════════════════════════════════ */
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isValidPhone(v) {
  return /^[\d\s\+\-\(\)]{7,15}$/.test(v);
}

function setFieldError(groupId, errId, msg) {
  const group = document.getElementById(groupId);
  const err   = document.getElementById(errId);
  if (group) group.classList.add('has-error');
  if (err)   err.textContent = msg;
}

function clearFieldError(groupId, errId) {
  const group = document.getElementById(groupId);
  const err   = document.getElementById(errId);
  if (group) group.classList.remove('has-error');
  if (err)   err.textContent = '';
}

function clearAllErrors() {
  document.querySelectorAll('.field-group').forEach(g => g.classList.remove('has-error'));
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  const matchIcon = document.getElementById('matchIcon');
  if (matchIcon) matchIcon.textContent = '';
  // Reset strength
  ['s1','s2','s3','s4'].forEach(id => {
    const seg = document.getElementById(id);
    if (seg) seg.className = 'strength-seg';
  });
  const sl = document.getElementById('strengthLabel');
  if (sl) sl.textContent = '';
}

/* ══════════════════════════════════
   LOGIN
   ══════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  clearAllErrors();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let valid      = true;

  // Validate email/phone
  if (!email) {
    setFieldError('fg-login-email', 'login-email-err', 'Email or phone is required.');
    valid = false;
  } else if (!isValidEmail(email) && !isValidPhone(email)) {
    setFieldError('fg-login-email', 'login-email-err', 'Enter a valid email or phone number.');
    valid = false;
  }

  // Validate password
  if (!password) {
    setFieldError('fg-login-pass', 'login-pass-err', 'Password is required.');
    valid = false;
  }

  if (!valid) return;

  // Loading state
  setLoading('loginBtn', true);

  if (!window.supabaseClient) {
    showToast('Auth service unavailable', 'error');
    setLoading('loginBtn', false);
    return;
  }

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  setLoading('loginBtn', false);

  if (error) {
    console.error('Supabase Login Error:', error);
    let errMsg = error.message;
    
    if (errMsg.includes('Email not confirmed')) {
      errMsg = 'Please verify your email before signing in.';
    } else if (errMsg.includes('Invalid login credentials')) {
      errMsg = 'Incorrect email or password.';
    }
    
    showToast(errMsg, 'error');
    setFieldError('fg-login-pass', 'login-pass-err', errMsg);
  } else {
    showToast('Welcome back! Redirecting…', 'success');
    setTimeout(() => {
      // check if a redirect parameter exists, else go to chat
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '../Frontend/pages/chat.html';
      window.location.href = redirect;
    }, 1000);
  }
}

/* ══════════════════════════════════
   SIGN UP
   ══════════════════════════════════ */
async function handleSignup(e) {
  e.preventDefault();
  clearAllErrors();

  const fname    = document.getElementById('fname').value.trim();
  const lname    = document.getElementById('lname').value.trim();
  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const password = document.getElementById('su-password').value;
  const confirm  = document.getElementById('confirm-password').value;
  const terms    = document.getElementById('terms').checked;
  let valid      = true;

  // First name
  if (!fname) {
    setFieldError('fg-fname', 'fname-err', 'First name is required.');
    valid = false;
  }

  // Last name
  if (!lname) {
    setFieldError('fg-lname', 'lname-err', 'Last name is required.');
    valid = false;
  }

  // Username
  if (!username) {
    setFieldError('fg-username', 'username-err', 'Username is required.');
    valid = false;
  } else if (username.length < 3) {
    setFieldError('fg-username', 'username-err', 'Username must be at least 3 characters.');
    valid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    setFieldError('fg-username', 'username-err', 'Only letters, numbers, and underscores.');
    valid = false;
  }

  // Email
  if (!email) {
    setFieldError('fg-su-email', 'su-email-err', 'Email is required.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('fg-su-email', 'su-email-err', 'Enter a valid email address.');
    valid = false;
  }

  // Phone (optional but validate format if provided)
  if (phone && !isValidPhone(phone)) {
    setFieldError('fg-phone', 'phone-err', 'Enter a valid phone number.');
    valid = false;
  }

  // Password
  if (!password) {
    setFieldError('fg-su-pass', 'su-pass-err', 'Password is required.');
    valid = false;
  } else if (password.length < 8) {
    setFieldError('fg-su-pass', 'su-pass-err', 'Password must be at least 8 characters.');
    valid = false;
  }

  // Confirm password
  if (!confirm) {
    setFieldError('fg-confirm', 'confirm-err', 'Please confirm your password.');
    valid = false;
  } else if (password !== confirm) {
    setFieldError('fg-confirm', 'confirm-err', 'Passwords do not match.');
    document.getElementById('matchIcon').textContent = '❌';
    valid = false;
  }

  // Terms
  if (!terms) {
    document.getElementById('terms-err').textContent = 'You must accept the Terms & Privacy Policy.';
    valid = false;
  }

  if (!valid) {
    // Scroll to first error
    const firstErr = document.querySelector('.field-group.has-error input');
    if (firstErr) firstErr.focus();
    return;
  }

  // Loading state
  setLoading('signupBtn', true);

  if (!window.supabaseClient) {
    showToast('Auth service unavailable', 'error');
    setLoading('signupBtn', false);
    return;
  }

  const { data, error } = await window.supabaseClient.auth.signUp({
    email,
    password,
    phone: phone || undefined,
    options: {
      data: {
        first_name: fname,
        last_name: lname,
        username: username
      }
    }
  });

  setLoading('signupBtn', false);

  if (error) {
    let errMsg = error.message;
    if (errMsg.includes('already registered')) {
      showToast('This email is already in use.', 'error');
      setFieldError('fg-su-email', 'su-email-err', 'Email is already taken.');
    } else {
      showToast(errMsg, 'error');
    }
  } else {
    // Success
    showToast(`Account created! Welcome, ${fname} 🎉`, 'success');
    document.getElementById('signupForm').reset();
    clearAllErrors();

    setTimeout(() => {
      // If email confirmation is required, Supabase returns user but session is null
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showToast('This email is already registered. Please sign in.', 'info');
      } else if (!data.session) {
        showToast('Please check your email to verify your account.', 'info');
      }
      switchTab('login');
    }, 1600);
  }
}

/* ══════════════════════════════════
   SSO (Google)
   ══════════════════════════════════ */
async function handleSSO(provider) {
  if (!window.supabaseClient) return;
  showToast(`Redirecting to ${provider}…`, 'info');
  const { error } = await window.supabaseClient.auth.signInWithOAuth({
    provider: provider.toLowerCase(),
    options: {
      redirectTo: window.location.origin + '/pages/chat.html'
    }
  });
  if (error) {
    showToast(error.message, 'error');
  }
}

/* ══════════════════════════════════
   LOADING STATE HELPER
   ══════════════════════════════════ */
function setLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle('loading', isLoading);
  btn.disabled = isLoading;
}


