// ============================================================
//  Frontend/js/supabaseClient.js
//  Initializes the Supabase client for the frontend and manages
//  session synchronization with the legacy API client.
// ============================================================

(function (window) {
  'use strict';

  // Make sure the Supabase CDN script is loaded before this file.
  if (!window.supabase) {
    console.error('Supabase SDK not loaded! Make sure to include the CDN script.');
    return;
  }

  // ── Configuration ──
  const SUPABASE_URL = 'https://lbjlncfmsbzxclukehtl.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiamxuY2Ztc2J6eGNsdWtlaHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODA4ODEsImV4cCI6MjA5Mjk1Njg4MX0.aO-FKk8yaSpvgApcj-9TjaoBs1yRW-OIpCshNFZNz2c';

  // ── Initialize Client ──
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Expose globally
  window.supabaseClient = supabaseClient;

  // ── Session Synchronization ──
  // Listen for auth events and sync the token with localStorage so that
  // apiFetch (in api.js) automatically sends it to the backend.
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session && session.access_token) {
        localStorage.setItem('cyber_tutor_access_token', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('cyber_tutor_refresh_token', session.refresh_token);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('cyber_tutor_access_token');
      localStorage.removeItem('cyber_tutor_refresh_token');
      
      // If we are on a protected page, redirect to auth
      const isAuthPage = window.location.pathname.includes('auth.html');
      const isPublicLanding = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
      
      if (!isAuthPage && !isPublicLanding) {
        window.location.href = window.location.pathname.includes('/pages/') ? '../../auth/auth.html' : './auth/auth.html'; // Adjust path depending on depth if needed, but protectRoute will handle it robustly
      }
    }
  });

})(window);
