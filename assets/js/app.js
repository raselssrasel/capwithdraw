/* ==========================================================================
   CapFlow — app.js
   সব পেজে কমন কাজ: বটম-নেভিগেশন, ফ্ল্যাগ, আইকন, পেমেন্ট চিপ।
   এক জায়গায় রাখা হয়েছে যাতে এক বদল সব পেজে কাজ করে।
   ========================================================================== */

/* ---------- ছোট আইকন (inline SVG) ---------- */
const CF_ICONS = {
  home:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  withdraw:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7H8a4 4 0 0 0 0 8h5"/><path d="M13 11l4 4-4 4"/></svg>',
  orders:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1.5"/></svg>',
  chat:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4.2A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  globe:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  sun:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  dash:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  offer:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  approve: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  dispute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
};

/* ---------- ফ্ল্যাগ চিপ (ছোট SVG) ---------- */
const CF_FLAGS = {
  bd: '<span class="flag"><svg viewBox="0 0 22 16"><rect width="22" height="16" fill="#0A6E4E"/><circle cx="9.5" cy="8" r="4.5" fill="#E8463C"/></svg></span>',
  us: '<span class="flag"><svg viewBox="0 0 22 16"><rect width="22" height="16" fill="#fff"/><g fill="#B22234"><rect width="22" height="1.3"/><rect y="2.5" width="22" height="1.3"/><rect y="5" width="22" height="1.3"/><rect y="7.4" width="22" height="1.3"/><rect y="9.8" width="22" height="1.3"/><rect y="12.3" width="22" height="1.3"/><rect y="14.7" width="22" height="1.3"/></g><rect width="10" height="8.6" fill="#3C3B6E"/></svg></span>'
};

/* সার্ভার আইডি → কাস্টমার যা দেখবে (চিপ + নাম) */
function cfServerDisplay(id) {
  if (id === 'bd')    return CF_FLAGS.bd + 'বাংলাদেশ';
  if (id === 'us')    return CF_FLAGS.us + 'ইউএসএ';
  if (id === 'all' || id === 'other') return '<span class="flag-ico">' + CF_ICONS.globe + '</span>অন্য সব সার্ভার';
  return id;
}

/* পেমেন্ট আইডি → ব্র্যান্ড চিপ */
function cfPayChip(id) {
  const map = {
    bkash: '<span class="pay-chip pay-bkash">bKash</span>',
    nagad: '<span class="pay-chip pay-nagad">Nagad</span>',
    bank:  '<span class="pay-chip pay-bank">Bank</span>'
  };
  return map[id] || '';
}

/* সংখ্যা কমা দিয়ে (1240 → 1,240) */
function cfNum(n) { return n.toLocaleString('en-US'); }

/* ==========================================================================
   ডার্ক / লাইট মোড
   - ইউজার টগল করলে পছন্দ localStorage-এ সেভ হয় (পরেরবারও মনে থাকে)
   - ইউজার না বাছলে ফোনের নিজের সেটিং মানে
   ========================================================================== */

const CF_THEME_KEY = 'capflow-theme';

/* সেভ করা থিম প্রয়োগ করা (পেজ লোডের শুরুতেই) */
function cfInitTheme() {
  let saved = null;
  try { saved = localStorage.getItem(CF_THEME_KEY); } catch (e) {}
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }
  // saved না থাকলে কিছু করি না → ফোনের সেটিং (prefers-color-scheme) চলবে
}

/* এখন ডার্ক কিনা বের করা */
function cfIsDark() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark')  return true;
  if (attr === 'light') return false;
  // কিছু বাছা না থাকলে ফোনের সেটিং দেখি
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/* টগল: ডার্ক ↔ লাইট */
function cfToggleTheme() {
  const next = cfIsDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(CF_THEME_KEY, next); } catch (e) {}
  cfUpdateThemeIcon();
}

/* টগল বাটনের আইকন হালনাগাদ (ডার্ক হলে সূর্য, লাইট হলে চাঁদ) */
function cfUpdateThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = cfIsDark() ? CF_ICONS.sun : CF_ICONS.moon;
}

/* টগল বাটন বসানো (যেখানে id="theme-toggle" আছে সেখানে) */
function cfSetupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  cfUpdateThemeIcon();
  btn.addEventListener('click', cfToggleTheme);
}

/* পেজ লোডের একদম শুরুতে থিম ঠিক করা (ঝলকানি এড়াতে) */
cfInitTheme();

/* ---------- বটম নেভিগেশন (কাস্টমার) ---------- */
function cfRenderBottomNav(active) {
  const items = [
    { key: 'home',     label: 'Home',     href: 'home.html' },
    { key: 'withdraw', label: 'Withdraw', href: 'marketplace.html' },
    { key: 'orders',   label: 'Orders',   href: 'orders.html' },
    { key: 'dispute',  label: 'Dispute',  href: 'dispute.html' },
    { key: 'profile',  label: 'Profile',  href: 'profile.html' }
  ];
  const html = items.map(it => {
    const cls = it.key === active ? 'active' : '';
    return `<a class="${cls}" href="${it.href}">${CF_ICONS[it.key]}<span>${it.label}</span></a>`;
  }).join('');

  const nav = document.getElementById('bottom-nav');
  if (nav) nav.innerHTML = html;
}

/* ---------- বটম নেভিগেশন (বায়ার) ---------- */
function cfRenderBuyerNav(active) {
  const items = [
    { key: 'dash',    ico: 'dash',    label: 'ড্যাশবোর্ড', href: 'dashboard.html' },
    { key: 'orders',  ico: 'orders',  label: 'অর্ডার',     href: 'orders.html' },
    { key: 'offer',   ico: 'offer',   label: 'অফার',       href: 'offer.html' },
    { key: 'profile', ico: 'profile', label: 'প্রোফাইল',   href: 'profile.html' }
  ];
  const html = items.map(it => {
    const cls = it.key === active ? 'active' : '';
    return `<a class="${cls}" href="${it.href}">${CF_ICONS[it.ico]}<span>${it.label}</span></a>`;
  }).join('');
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.innerHTML = html;
}

/* ---------- বটম নেভিগেশন (অ্যাডমিন) ---------- */
function cfRenderAdminNav(active) {
  const items = [
    { key: 'overview', ico: 'dash',    label: 'ওভারভিউ',   href: 'dashboard.html' },
    { key: 'approvals',ico: 'approve', label: 'বায়ার',      href: 'buyers.html' },
    { key: 'offers',   ico: 'offer',   label: 'অফার',       href: 'offers.html' },
    { key: 'orders',   ico: 'orders',  label: 'অর্ডার',     href: 'orders.html' },
    { key: 'disputes', ico: 'dispute', label: 'বিরোধ',      href: 'disputes.html' }
  ];
  const html = items.map(it => {
    const cls = it.key === active ? 'active' : '';
    return `<a class="${cls}" href="${it.href}">${CF_ICONS[it.ico]}<span>${it.label}</span></a>`;
  }).join('');
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.innerHTML = html;
}

/* ---------- নেভ আইকনে unread ব্যাজ বসানো ----------
   cfSetNavBadge('chat', 3) → ঐ নেভ আইটেমের আইকনে 3 দেখাবে; 0 হলে সরে যায় */
function cfSetNavBadge(key, count) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  // key অনুযায়ী href খুঁজি
  const hrefMap = { chat:'chat.html', orders:'orders.html' };
  const link = [...nav.querySelectorAll('a')].find(a => (a.getAttribute('href')||'').includes(hrefMap[key]||key));
  if (!link) return;
  let b = link.querySelector('.nav-badge');
  if (count > 0) {
    if (!b) {
      b = document.createElement('span');
      b.className = 'nav-badge';
      link.style.position = 'relative';
      link.appendChild(b);
    }
    b.textContent = count > 9 ? '9+' : count;
  } else if (b) {
    b.remove();
  }
}
window.cfSetNavBadge = cfSetNavBadge;

/* ---------- unread ব্যাজ স্বয়ংক্রিয়ভাবে বসানো ----------
   পেজে cfSupabase + CFChat থাকলে, লগইন ইউজারের unread গুনে
   customer হলে Orders আইকনে, buyer হলে Chat আইকনে ব্যাজ দেখায়। */
async function cfAutoUnreadBadge(navKey) {
  async function run() {
    try {
      if (!window.cfSupabase || !window.CFChat || !CFChat.unreadCount) return;
      const { data } = await window.cfSupabase.auth.getSession();
      const user = data && data.session ? data.session.user : null;
      if (!user) return;
      const n = await CFChat.unreadCount(user.id);
      cfSetNavBadge(navKey, n);
    } catch (e) {}
  }
  run();
  // প্রতি ৮ সেকেন্ডে নিজে নিজে আপডেট (reload ছাড়াই)
  if (!window._cfBadgeTimer) {
    window._cfBadgeTimer = setInterval(run, 8000);
  }
}
window.cfAutoUnreadBadge = cfAutoUnreadBadge;
