/* ==========================================================================
   CapFlow — admin approvals.js
   বায়ার আবেদন দেখায়; Approve/Reject চাপলে অবস্থা বদলায় (নকল)।
   ========================================================================== */

(function () {
  const apps = window.CAPFLOW.admin.applications;

  function card(a, i) {
    return `
      <div class="ap-card" data-i="${i}">
        <div class="ap-top">
          <div class="ap-ava">${a.initials}</div>
          <div style="flex:1">
            <div class="ap-name">${a.name}</div>
            <div class="ap-email">${a.email}</div>
          </div>
          <span class="badge badge-pending">অপেক্ষায়</span>
        </div>
        <div class="ap-meta"><span>আবেদন · ${a.when}</span><span>·</span><span>IP: ${a.loc}</span></div>
        <div class="ap-btns">
          <button class="ap-btn ap-reject" data-act="reject"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>রিজেক্ট</button>
          <button class="ap-btn ap-approve" data-act="approve"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>অনুমোদন</button>
        </div>
      </div>`;
  }

  function render() {
    const box = document.getElementById('ap-list');
    box.innerHTML = apps.map(card).join('');
    document.getElementById('ap-count').textContent = apps.length;

    box.querySelectorAll('.ap-card').forEach(cardEl => {
      cardEl.querySelectorAll('[data-act]').forEach(btn => {
        btn.addEventListener('click', () => {
          const act = btn.dataset.act;
          const btns = cardEl.querySelector('.ap-btns');
          const done = document.createElement('div');
          done.className = 'ap-done ' + (act === 'approve' ? 'ok' : 'no');
          done.textContent = act === 'approve' ? '✓ অনুমোদিত হয়েছে' : '✕ রিজেক্ট করা হয়েছে';
          btns.replaceWith(done);
          const badge = cardEl.querySelector('.badge');
          badge.className = 'badge ' + (act === 'approve' ? 'badge-done' : 'badge-cancel');
          badge.textContent = act === 'approve' ? 'অনুমোদিত' : 'রিজেক্টেড';
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    cfRenderAdminNav('approvals');
  });
})();
