/* ==========================================================================
   CapFlow — chat.js
   চ্যাটের মেসেজ আঁকে, অর্ডার সারাংশ দেখায়, "টাকা পেয়েছি" বাটন সামলায়।
   ডেটা আসে config.js থেকে; হেল্পার আসে app.js থেকে।
   ========================================================================== */

(function () {
  const order = window.CAPFLOW.chatOrder;
  let   msgs  = window.CAPFLOW.chatMessages.slice();   // নকল মেসেজ তালিকা

  /* ছোট আইকন */
  const ICO_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  const ICO_SEND  = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>';
  const ICO_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  const payName = { bkash: 'bKash', nagad: 'Nagad', bank: 'Bank' };

  /* ---------- হেডার ---------- */
  function renderHeader() {
    document.getElementById('chat-ava').textContent  = order.buyerInitials;
    document.getElementById('chat-name').textContent = order.buyerName;
    const pres = document.getElementById('chat-pres');
    if (order.online) {
      pres.className = 'chat-pres on';
      pres.innerHTML = '<span class="dot" style="background:var(--jade)"></span>অনলাইন';
    } else {
      pres.className = 'chat-pres off';
      pres.innerHTML = '<span class="dot" style="background:var(--muted)"></span>অফলাইন';
    }
  }

  /* ---------- অর্ডার সারাংশ স্ট্রিপ ---------- */
  function renderSummary() {
    document.getElementById('chat-summary').innerHTML = `
      <div class="chat-summary-head">
        <span class="oid">অর্ডার #${order.orderId}</span>
        <span class="ost">${order.status}</span>
      </div>
      <div class="chat-summary-grid">
        <div class="cell"><div class="k">USD</div><div class="v">$${order.usd}</div></div>
        <div class="sep"></div>
        <div class="cell"><div class="k">রেট</div><div class="v">৳${order.rate}</div></div>
        <div class="sep"></div>
        <div class="cell"><div class="k">মোট</div><div class="v hi">৳${order.total.toLocaleString('en-US')}</div></div>
        <div class="sep"></div>
        <div class="cell"><div class="k">পেমেন্ট</div><div class="v">${payName[order.pay]}</div></div>
      </div>`;
  }

  /* ---------- একটি মেসেজের HTML ---------- */
  function msgHtml(m) {
    // সিস্টেম মেসেজ
    if (m.type === 'system') {
      return `<div class="msg-system">${m.text}</div>`;
    }

    // Withdraw সম্পন্ন কার্ড
    if (m.type === 'withdraw-done') {
      const d = m.detail || {};
      return `
        <div class="msg-card">
          <div class="msg-card-head green">
            <div class="msg-card-ico">${ICO_CHECK}</div>
            <div><div class="msg-card-ttl">${m.text}</div><div class="msg-card-sub">CapCut থেকে ডলার সফলভাবে উইথড্র</div></div>
          </div>
          <div class="msg-card-body">
            <div class="msg-card-row"><span class="k">উইথড্র পরিমাণ</span><span class="v">$${d.usd}.00</span></div>
            <div class="msg-card-row"><span class="k">অ্যাকাউন্ট</span><span class="v">${d.accounts}</span></div>
            <div class="msg-card-row"><span class="k">আপনি পাবেন</span><span class="v hi">${d.note}</span></div>
          </div>
        </div>`;
    }

    // টাকা পাঠানো হয়েছে কার্ড
    if (m.type === 'payment-sent') {
      const d = m.detail || {};
      return `
        <div class="msg-card">
          <div class="msg-card-head dark">
            <div class="msg-card-ico">${ICO_SEND}</div>
            <div><div class="msg-card-ttl">${m.text}</div><div class="msg-card-sub">বায়ার টাকা পাঠিয়েছে</div></div>
          </div>
          <div class="msg-card-body">
            <div class="msg-card-row"><span class="k">পরিমাণ</span><span class="v hi">${d.amount}</span></div>
            <div class="msg-card-row"><span class="k">পাঠানো হয়েছে</span><span class="v">${d.to}</span></div>
          </div>
        </div>`;
    }

    // সাধারণ টেক্সট (বায়ার / কাস্টমার)
    const side = m.from === 'me' ? 'msg-me' : 'msg-buyer';
    const time = m.time ? `<div class="time">${m.time}${m.from === 'me' ? ' ✓✓' : ''}</div>` : '';
    // ইমেইলযুক্ত মেসেজে "২৪ঘ পর মুছে যাবে" চিহ্ন
    const expire = m.hasEmail
      ? `<div class="msg-expire">${ICO_CLOCK}<span>২৪ ঘণ্টা পর মুছে যাবে</span></div>`
      : '';
    return `<div class="msg ${side}"><div>${escapeHtml(m.text)}</div>${expire}${time}</div>`;
  }

  /* সরল HTML এস্কেপ (নিরাপত্তা) */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- পুরো মেসেজ তালিকা আঁকা ---------- */
  function renderMessages() {
    const body = document.getElementById('chat-body');
    body.innerHTML = msgs.map(msgHtml).join('');

    // শেষ মেসেজের পর যদি payment-sent থাকে → পরামর্শ + "টাকা পেয়েছি" বার দেখাও
    const hasPaymentSent = msgs.some(m => m.type === 'payment-sent');
    const tip = document.createElement('div');
    if (hasPaymentSent) {
      tip.className = 'msg-tip';
      tip.textContent = 'অনুগ্রহ করে আপনার bKash চেক করুন। টাকা পেলে তবেই নিশ্চিত করুন।';
      body.appendChild(tip);
    }
    document.getElementById('chat-received-bar').hidden = !hasPaymentSent;

    // নিচে স্ক্রল
    body.scrollTop = body.scrollHeight;
  }

  /* ---------- "টাকা পেয়েছি" ক্লিক ---------- */
  function wireReceived() {
    const btn = document.getElementById('chat-received-btn');
    btn.addEventListener('click', () => {
      // অর্ডার সম্পন্ন অবস্থায় নিয়ে যাওয়া
      order.status = 'সম্পন্ন';
      renderSummary();
      msgs.push({ from: 'system', type: 'system', text: '✅ পেমেন্ট নিশ্চিত হয়েছে। অর্ডার সম্পন্ন।' });
      renderMessages();
      btn.classList.add('done');
      btn.innerHTML = ICO_CHECK + ' পেমেন্ট নিশ্চিত হয়েছে';
      btn.disabled = true;
    });
  }

  /* ---------- মেসেজ পাঠানো ---------- */
  function wireSend() {
    const input = document.getElementById('chat-text');
    const send  = document.getElementById('chat-send');

    function doSend() {
      const t = input.value.trim();
      if (!t) return;
      // ইমেইল আছে কিনা দেখা (@ থাকলে) → ২৪ঘ পর ডিলিট চিহ্ন
      const hasEmail = /\S+@\S+/.test(t);
      msgs.push({ from: 'me', type: 'text', text: t, time: nowTime(), hasEmail });
      input.value = '';
      renderMessages();
    }
    send.addEventListener('click', doSend);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
  }

  /* এখনকার সময় (6:57 PM আকারে) */
  function nowTime() {
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
  }

  /* ---------- শুরু ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderSummary();
    renderMessages();
    wireReceived();
    wireSend();
    cfSetupThemeToggle();
  });
})();
