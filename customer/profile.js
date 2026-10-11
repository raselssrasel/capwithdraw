/* ==========================================================================
   CapFlow — profile.js  (কাস্টমার প্রোফাইল)
   এখন আসল লগইন করা ইউজারের তথ্য দেখায় (auth + profiles টেবিল থেকে)।
   ========================================================================== */

(function () {
  function initials(name) {
    if (!name) return 'U';
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || 'U';
  }

  async function render() {
    try {
      const db = window.cfSupabase;
      const { data: auth } = await db.auth.getUser();
      const user = auth && auth.user;
      if (!user) return;

      const { data: prof } = await db
        .from('profiles').select('full_name, phone, created_at')
        .eq('id', user.id).single();

      const name  = (prof && prof.full_name) || 'ইউজার';
      const phone = (prof && prof.phone) || 'যোগ করা হয়নি';

      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('pf-name',  name);
      set('pf-email', user.email || '');
      set('pf-phone', phone);
      const av = document.getElementById('pf-ava'); if (av) av.textContent = initials(name);

      // সদস্য হওয়ার তারিখ
      if (prof && prof.created_at) {
        const d = new Date(prof.created_at);
        const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
        set('pf-since', months[d.getMonth()] + ' ' + d.getFullYear() + ' থেকে');
      }

      // স্ট্যাটস আপাতত ০ (আসল অর্ডার যুক্ত হলে বদলাবে)
      set('pf-s-total', '0');
      set('pf-s-done', '0');
      set('pf-s-bdt', '৳0');
    } catch (e) {
      console.warn('প্রোফাইল আনতে সমস্যা:', e.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    cfRenderBottomNav('profile'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders');
    cfSetupThemeToggle();
    render();
  });
})();
