// ============================================================
//  Frontend/js/userProfile.js
//  Fetches user session data and populates UI elements if they exist.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.supabaseClient) return;

  const { data: { session } } = await window.supabaseClient.auth.getSession();
  
  if (session && session.user) {
    const user = session.user;
    const email = user.email;
    const meta = user.user_metadata || {};
    
    // Attempt to fetch profile from public.profiles
    let firstName = meta.first_name || '';
    let lastName = meta.last_name || '';
    
    try {
      const { data: profile } = await window.supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        firstName = profile.first_name || firstName;
        lastName = profile.last_name || lastName;
      }
    } catch (err) {
      console.warn('Could not fetch profile:', err);
    }
    
    const initial = (firstName.charAt(0) || email.charAt(0)).toUpperCase();
    const displayName = firstName ? `${firstName} ${lastName}`.trim() : email.split('@')[0];

    // Update UI elements if they exist
    const avatarEls = document.querySelectorAll('.profile-avatar-text');
    avatarEls.forEach(el => el.textContent = initial);

    const nameEls = document.querySelectorAll('.profile-name-text');
    nameEls.forEach(el => el.textContent = displayName);

    const emailEls = document.querySelectorAll('.profile-email-text');
    emailEls.forEach(el => el.textContent = email);

    const profileContainers = document.querySelectorAll('.user-profile-container');
    profileContainers.forEach(el => el.style.display = 'flex');

    // Make logout buttons work
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.CyberTutorAPI && window.CyberTutorAPI.auth) {
          window.CyberTutorAPI.auth.logout();
        } else {
          window.supabaseClient.auth.signOut().then(() => {
            localStorage.removeItem('cyber_tutor_access_token');
            window.location.reload();
          });
        }
      });
    });
  }
});
