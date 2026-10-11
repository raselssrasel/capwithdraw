/* ==========================================================================
   CapFlow — customer orders.js  (ডেটাবেস থেকে আসল অর্ডার)
   ========================================================================== */
(function () {
  let tab = new URLSearchParams(location.search).get('tab') || 'active';
  let all = { active: [], completed: [], cancelled: [] };
  const payName = { bkash:'bKash', nagad:'Nagad', bank:'Bank' };
  const stateBadge = { active:'badge-pending', completed:'badge-done', cancelled:'badge-cancel' };
  const stateText  = { active:'চলমান', completed:'সম্পন্ন', cancelled:'বাতিল' };
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function ini(n){ if(!n) return 'B'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'B'; }

  function card(o) {
    const badge = stateBadge[o.status] || 'badge-pending';
    return `
      <button class="od-card" data-order="${o.id}">
        <div class="od-card-top">
          <div class="od-card-id">
            <div class="od-card-ava"><img src="../assets/img/buyer.png" style="width:100%;height:100%;object-fit:cover;border-radius:inherit"></div>
            <div><div class="od-card-buyer">${o.buyerName}</div><div class="od-card-meta">#${o.code||''}</div></div>
          </div>
          <span class="badge ${badge}">${stateText[o.status]||'চলমান'}</span>
        </div>
        ${o._last ? `<div class="od-last">
          <span class="od-last-txt">${o._last}</span>
          ${o._unread>0?`<span class="od-unread">${o._unread>9?'9+':o._unread}</span>`:''}
        </div>` : ''}
        <div class="od-card-bot">
          <div class="od-cell"><div class="k">USD</div><div class="v">$${o.usd}</div></div>
          <div class="od-cell"><div class="k">রেট</div><div class="v">৳${o.rate}</div></div>
          <div class="od-cell"><div class="k">মোট</div><div class="v hi">৳${Number(o.total_bdt).toLocaleString('en-US')}</div></div>
          <div class="od-cell"><div class="k">পেমেন্ট</div><div class="v">${payName[o.pay_method]||o.pay_method}</div></div>
        </div>
      </button>`;
  }

  function render() {
    const list = all[tab] || [];
    const box = document.getElementById('od-list');
    const empty = document.getElementById('od-empty');
    box.innerHTML = list.map(card).join('');
    empty.hidden = list.length > 0;
    box.querySelectorAll('.od-card').forEach(btn =>
      btn.addEventListener('click', () => { window.location.href='chat-view.html?order='+encodeURIComponent(btn.dataset.order)+'&from=orders&tab='+tab; }));
  }

  function setCounts() {
    document.getElementById('od-c-active').textContent = all.active.length;
    document.getElementById('od-c-completed').textContent = all.completed.length;
    document.getElementById('od-c-cancelled').textContent = all.cancelled.length;
  }

  async function load() {
    const db = window.cfSupabase;
    const { data: sess } = await db.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null;
    if (!user) return;
    const { data, error } = await db.from('orders')
      .select('id, code, usd, rate, total_bdt, pay_method, status, buyr:buyer_id(full_name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { console.warn(error.message); return; }
    const list = data || [];
    // সর্বশেষ মেসেজ + unread
    const ids = list.map(o=>o.id);
    let prev = {};
    if (window.CFChat && CFChat.orderPreviews) prev = await CFChat.orderPreviews(ids, user.id);
    all = { active: [], completed: [], cancelled: [] };
    list.forEach(o => {
      o.buyerName = (o.buyr && o.buyr.full_name) || 'বায়ার';
      const pv = prev[o.id] || {};
      o._last = pv.last ? esc(pv.last) : '';
      o._unread = pv.unread || 0;
      if (o.status === 'completed') all.completed.push(o);
      else if (o.status === 'cancelled') all.cancelled.push(o);
      else all.active.push(o);
    });
    setCounts();
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    // URL অনুযায়ী ট্যাব active
    document.querySelectorAll('.od-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
    document.querySelectorAll('.od-tab').forEach(t =>
      t.addEventListener('click', () => {
        document.querySelectorAll('.od-tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active'); tab = t.dataset.tab;
        history.replaceState(null,'','orders.html?tab='+tab);
        render();
      }));
    cfRenderBottomNav('orders'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders');
    cfSetupThemeToggle();
    load();
  });
})();
