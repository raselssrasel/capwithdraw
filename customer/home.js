/* ==========================================================================
   CapFlow — home.js  (কাস্টমার হোম)
   এখন আসল লগইন করা ইউজারের নাম দেখায় (profiles টেবিল থেকে)।
   সাম্প্রতিক অর্ডার আপাতত নমুনা (পরে আসল অর্ডার থেকে আসবে)।
   ========================================================================== */

(function () {
  /* নাম থেকে initials বানাই (Sadia Rahman -> SR) */
  function initials(name) {
    if (!name) return 'U';
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || 'U';
  }

  /* আসল ইউজারের নাম দেখানো */
  async function renderUser() {
    const nameEl = document.getElementById('hm-name');
    const avaEl  = document.getElementById('hm-ava');
    try {
      const db = window.cfSupabase;
      const { data: auth } = await db.auth.getUser();
      const user = auth && auth.user;
      if (!user) return;  // guard এমনিতেই welcome এ পাঠাবে

      // profiles টেবিল থেকে নাম আনি
      const { data: prof } = await db
        .from('profiles').select('full_name').eq('id', user.id).single();

      const name = (prof && prof.full_name) || user.email || 'ইউজার';
      nameEl.textContent = name;
      avaEl.textContent  = initials(prof && prof.full_name ? prof.full_name : '');
    } catch (e) {
      console.warn('নাম আনতে সমস্যা:', e.message);
    }
  }

  /* সাম্প্রতিক অর্ডার — আপাতত নমুনা (কোনো আসল অর্ডার নেই, পরে যুক্ত হবে)।
     এখন খালি রাখি যাতে ভুয়া অর্ডার না দেখায়। */
  function renderRecent() {
    const box = document.getElementById('hm-recent');
    if (box) box.innerHTML =
      '<div style="text-align:center;color:var(--muted);font-size:13px;padding:24px 0">এখনো কোনো অর্ডার নেই।</div>';
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderRecent();
    cfRenderBottomNav('home'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders');
    cfSetupThemeToggle();
    renderUser();
    // লাইভ বায়ার অনলাইন সংখ্যা
    if(window.CFChat && CFChat.buyersOnline){
      CFChat.buyersOnline().then(n=>{ const el=document.getElementById('hm-online'); if(el) el.textContent=n; });
    }   // async — নাম এসে বসবে
  });
})();
