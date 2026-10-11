/* ==========================================================================
   CapFlow — notifications.js
   শুধু নতুন মেসেজের নোটিফিকেশন দেখায় (চ্যাটের বাইরে থাকলে)।
   একটায় চাপলে সেই চ্যাট খোলে।
   ========================================================================== */

(function () {
  const all = window.CAPFLOW.notifications || [];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function item(n) {
    const u = n.unread ? ' unread' : '';
    const badge = n.unread ? '<span class="nt-badge">1</span>' : '';
    return `
      <button class="nt-item${u}" data-order="${n.orderId}">
        <div class="nt-ava">${n.initials}</div>
        <div class="nt-mid">
          <div class="nt-row1">
            <span class="nt-name">${n.name}</span>
            <span class="nt-time">${n.time}</span>
          </div>
          <div class="nt-text">${esc(n.text)}</div>
        </div>
        ${badge}
      </button>`;
  }

  function render() {
    const newItems = all.filter(n => n.group === 'new');
    const oldItems = all.filter(n => n.group === 'old');

    document.getElementById('nt-new').innerHTML = newItems.map(item).join('');
    document.getElementById('nt-old').innerHTML = oldItems.map(item).join('');

    // দল খালি হলে সেই অংশ লুকাও
    document.getElementById('nt-new-wrap').hidden = newItems.length === 0;
    document.getElementById('nt-old-wrap').hidden = oldItems.length === 0;
    const emptyEl = document.getElementById('nt-empty');
    if (emptyEl) emptyEl.hidden = (newItems.length + oldItems.length) > 0;

    // একটায় চাপলে চ্যাট খোলা
    document.querySelectorAll('.nt-item').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = 'chat-view.html?order=' + encodeURIComponent(btn.dataset.order);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
