/* ==========================================================================
   CapFlow — marketplace.js
   ডেটাবেস থেকে আসল অফার দেখায় (বায়ারদের দেওয়া)।
   সার্ভার ফিল্টার ও সার্চ চালায়।
   ========================================================================== */

(function () {
  let active  = 'all';
  let search  = '';
  let offers  = [];   // ডেটাবেস থেকে আসা অফার

  const serverChips = [
    { id: 'all', label: 'সব',        type: 'all' },
    { id: 'bd',  label: 'বাংলাদেশ',   type: 'flag-bd' },
    { id: 'us',  label: 'ইউএসএ',      type: 'flag-us' },
    { id: 'other', label: 'অন্য সব সার্ভার', type: 'globe' }
  ];

  function initials(name) {
    if (!name) return 'B';
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0]||'') + (p[1]?.[0]||'')).toUpperCase() || 'B';
  }

  /* বায়ারের সার্ভার তালিকা → কাস্টমার যা দেখবে
     (all → 'other' দেখায়, মানে "অন্য সার্ভার") */
  function displayServers(servers) {
    return servers;   // যা বেছেছে হুবহু দেখাই (bd/us/all)
  }

  /* ---------- সার্ভার চিপ ---------- */
  function renderChips() {
    const box = document.getElementById('mk-chips');
    box.innerHTML = serverChips.map(s => {
      const cls = s.id === active ? 'mk-chip active' : 'mk-chip';
      let inner = s.label;
      if (s.type === 'flag-bd') inner = CF_FLAGS.bd + s.label;
      if (s.type === 'flag-us') inner = CF_FLAGS.us + s.label;
      if (s.type === 'globe')   inner = '<span class="flag-ico">' + CF_ICONS.globe + '</span>' + s.label;
      return `<button class="${cls}" data-server="${s.id}">${inner}</button>`;
    }).join('');
    box.querySelectorAll('.mk-chip').forEach(btn =>
      btn.addEventListener('click', () => { active = btn.dataset.server; renderChips(); renderOffers(); }));
  }

  /* ---------- একটি অফার কার্ড ---------- */
  function offerCard(o) {
    const offCls = o.online ? '' : ' is-offline';
    const dispServers = displayServers(o.servers);
    const serversHtml = dispServers.map(cfServerDisplay)
      .map(s => `<span style="display:inline-flex;align-items:center;margin-right:8px">${s}</span>`).join('');
    const pays = o.pay.map(cfPayChip).join('');
    const meta = o.online
      ? `<div class="offer-meta on"><span class="dot" style="background:var(--jade)"></span>অনলাইন</div>`
      : `<div class="offer-meta off"><span class="dot" style="background:var(--muted)"></span>অফলাইন</div>`;
    const action = o.online
      ? `<button class="offer-chat" data-offer="${o.id}">Chat করুন
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
         </button>`
      : `<span class="offer-offline">অফলাইন</span>`;
    const avaStyle = o.online ? '' : 'background:var(--line);color:var(--ink-2)';

    return `
      <div class="offer${offCls}">
        <div class="offer-top">
          <div class="offer-id">
            <div class="offer-ava" style="${avaStyle}">${initials(o.name)}</div>
            <div>
              <div class="offer-name">${o.name}</div>
              ${meta}
            </div>
          </div>
          <div class="offer-rate"><b>৳${o.rate}</b><span>per $1</span></div>
        </div>
        <div class="offer-mid">
          <div><div class="lbl">সার্ভার</div><div class="val">${serversHtml}</div></div>
          <div><div class="lbl">Limits</div><div class="val">$${cfNum(o.min)} – $${cfNum(o.max)}</div></div>
        </div>
        <div class="offer-bot">
          <div class="offer-pays">${pays}</div>
          ${action}
        </div>
      </div>`;
  }

  /* ---------- অফার তালিকা আঁকা ---------- */
  function renderOffers() {
    let list = offers.slice();
    if (active !== 'all') {
      const want = (active === 'other') ? 'all' : active;
      list = list.filter(o => o.servers.includes(want));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o => (o.name || '').toLowerCase().includes(q));
    }
    const box   = document.getElementById('mk-offers');
    const empty = document.getElementById('mk-empty');
    box.innerHTML = list.map(offerCard).join('');
    empty.hidden = list.length > 0;
    if (list.length === 0) empty.textContent = 'এই মুহূর্তে কোনো অফার নেই।';

    box.querySelectorAll('[data-offer]').forEach(btn =>
      btn.addEventListener('click', () => {
        window.location.href = 'order-setup.html?offer=' + encodeURIComponent(btn.dataset.offer);
      }));
  }

  /* ---------- ডেটাবেস থেকে অফার আনা ---------- */
  async function loadOffers() {
    const db = window.cfSupabase;
    const { data, error } = await db
      .from('offers')
      .select('id, buyer_id, rate, min_usd, max_usd, servers, pay_methods, is_online, profiles(full_name, active)')
      .eq('is_active', true);

    if (error) { console.warn('অফার আনতে সমস্যা:', error.message); offers = []; }
    else {
      offers = (data || []).filter(r => !r.profiles || r.profiles.active !== false).map(r => ({
        id:      r.id,
        buyerId: r.buyer_id,
        name:    (r.profiles && r.profiles.full_name) || 'বায়ার',
        rate:    r.rate,
        min:     r.min_usd,
        max:     r.max_usd,
        servers: r.servers || [],
        pay:     r.pay_methods || [],
        online:  r.is_online
      }));
    }
    renderOffers();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderChips();
    cfRenderBottomNav('withdraw'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders');
    cfSetupThemeToggle();
    // সার্চ
    const si = document.getElementById('mk-search-input');
    if (si) si.addEventListener('input', e => { search = e.target.value; renderOffers(); });
    const fb = document.getElementById('mk-filter-btn');
    if (fb) fb.addEventListener('click', () => document.getElementById('mk-chips').scrollIntoView({behavior:'smooth'}));
    loadOffers();
  });
})();
