// ============================================================
//  Frontend/js/protectRoute.js
//  Protects frontend routes. Include this in the <head> of 
//  all protected pages to prevent flash of unauthenticated content.
// ============================================================

(function () {
  'use strict';

  // Synchronous quick check based on localStorage token
  // Used to prevent UI flickering before Supabase JS initializes
  const token = localStorage.getItem('cyber_tutor_access_token');
  const path = window.location.pathname;
  
  const isAuthPage = path.includes('auth.html');
  const isPublicLanding = path.endsWith('index.html') || path === '/';

  // Helper to resolve relative path to auth
  const getAuthPath = () => {
    if (path.includes('/pages/')) return '../../auth/auth.html';
    return './auth/auth.html';
  };

  const getAppPath = () => {
    if (path.includes('/auth/')) return '../Frontend/pages/chat.html';
    return './Frontend/pages/chat.html';
  };

  // Unauthenticated user trying to access private page
  if (!token && !isAuthPage && !isPublicLanding) {
    window.location.replace(getAuthPath() + '?redirect=' + encodeURIComponent(path));
    return;
  }

  // Authenticated user trying to access auth page
  if (token && isAuthPage) {
    window.location.replace(getAppPath());
    return;
  }

  // Asynchronous definitive check using Supabase
  document.addEventListener('DOMContentLoaded', async () => {
    if (window.supabaseClient) {
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      
      if ((!session || error) && !isAuthPage && !isPublicLanding) {
        localStorage.removeItem('cyber_tutor_access_token');
        localStorage.removeItem('cyber_tutor_refresh_token');
        window.location.replace(getAuthPath() + '?redirect=' + encodeURIComponent(path));
      }
    }
  });

})();
