/* ==========================================================================
   CapFlow — customer chat-view.js
   ডেটাবেস মেসেজ + রিয়েল-টাইম + "আমি টাকা পেয়েছি" বাটন + অর্ডার সম্পন্ন/বাতিলে চ্যাট বন্ধ।
   ========================================================================== */

(function () {
  const payName = { bkash:'bKash', nagad:'Nagad', bank:'Bank' };
  let order=null, me=null, orderId=null, msgs=[], channel=null;

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function ini(n){ if(!n) return 'B'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'B'; }
  function timeStr(iso){ return (window.cfBDClock?window.cfBDClock(iso):new Date(iso).toLocaleTimeString()); }
  function isClosed(){ return order && (order.status==='completed' || order.status==='cancelled'); }

  function renderHeader() {
    const buyerName = (order.buyr && order.buyr.full_name) || 'বায়ার';
    (function(){ const a=document.getElementById('chat-ava');
      a.innerHTML='<img src="../assets/img/buyer.png" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">'; })();
    document.getElementById('chat-name').textContent = buyerName;
    const pres = document.getElementById('chat-pres');
    if (order.status==='completed') { pres.className='chat-pres off'; pres.innerHTML='<span class="dot" style="background:var(--jade)"></span>সম্পন্ন'; }
    else if (order.status==='cancelled') { pres.className='chat-pres off'; pres.innerHTML='<span class="dot" style="background:var(--rose-ink)"></span>বাতিল'; }
    else { pres.className='chat-pres on'; pres.innerHTML='<span class="dot" style="background:var(--jade)"></span>অনলাইন'; }

    document.getElementById('chat-summary').innerHTML = `
      <div class="chat-summary-head">
        <span class="oid">অর্ডার #${order.code||''}</span>
        <span class="ost">${order.status==='completed'?'সম্পন্ন':(order.status==='cancelled'?'বাতিল':'চলমান')}</span>
      </div>
      <div class="chat-summary-grid">
        <div class="cell"><div class="k">USD</div><div class="v">$${order.usd}</div></div>
        <div class="sep"></div>
        <div class="cell"><div class="k">রেট</div><div class="v">৳${order.rate}</div></div>
        <div class="sep"></div>
        <div class="cell"><div class="k">মোট</div><div class="v hi">৳${Number(order.total_bdt).toLocaleString('en-US')}</div></div>
        <div class="sep"></div>
        <div class="cell"><div class="k">পেমেন্ট</div><div class="v">${payName[order.pay_method]||order.pay_method}</div></div>
      </div>`;
  }

  function msgHtml(m) {
    if (m.kind==='system') return `<div class="msg-system">${esc(m.body)}</div>`;
    const mine = m.sender_id===me.id;
    const side = mine?'msg-me':'msg-buyer';
    const expire = m.has_email
      ? `<div class="msg-expire"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>২৪ ঘণ্টা পর মুছে যাবে</span></div>`
      : '';
    const t = m.created_at?`<div class="time">${timeStr(m.created_at)}${mine?' ✓✓':''}</div>`:'';
    // কপি করা যাবে (চাপ ধরে রাখলে / ডাবল-ট্যাপ)
    return `<div class="msg ${side}" data-copy="${esc(m.body)}"><div>${esc(m.body)}</div>${expire}${t}</div>`;
  }

  function wireCopy() {
    document.querySelectorAll('#chat-body .msg[data-copy]').forEach(el => {
      if (el._wired) return; el._wired = true;
      let timer=null;
      const doCopy=()=>{ const txt=el.getAttribute('data-copy'); if(navigator.clipboard){ navigator.clipboard.writeText(txt); } showToast('কপি হয়েছে'); };
      // মোবাইলে চাপ ধরে রাখা
      el.addEventListener('touchstart',()=>{ timer=setTimeout(doCopy,500); });
      el.addEventListener('touchend',()=>{ clearTimeout(timer); });
      el.addEventListener('touchmove',()=>{ clearTimeout(timer); });
      // ডেস্কটপে ডাবল-ক্লিক
      el.addEventListener('dblclick', doCopy);
    });
  }
  function showToast(text){
    let t=document.getElementById('cf-toast');
    if(!t){ t=document.createElement('div'); t.id='cf-toast';
      t.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#12161F;color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;z-index:999;opacity:0;transition:opacity .2s';
      document.body.appendChild(t); }
    t.textContent=text; t.style.opacity='1';
    setTimeout(()=>{ t.style.opacity='0'; },1200);
  }

  function renderAll() {
    const body=document.getElementById('chat-body');
    body.innerHTML=msgs.map(msgHtml).join('')||'<div class="msg-system">কথা শুরু করুন।</div>';
    body.scrollTop=body.scrollHeight;
    wireCopy();
    updateFooter();
  }

  /* ফুটার — "টাকা পেয়েছি" বাটন নাকি ইনপুট, নাকি বন্ধ */
  function updateFooter() {
    const bar = document.getElementById('chat-received-bar');
    const inputRow = document.querySelector('.chat-input');

    if (isClosed()) {
      // অর্ডার শেষ/বাতিল — চ্যাট বন্ধ
      if (bar) bar.hidden = true;
      if (inputRow) inputRow.innerHTML =
        '<div style="flex:1;text-align:center;color:var(--muted);font-size:13px;padding:8px">'
        + (order.status==='completed'?'✅ অর্ডার সম্পন্ন — চ্যাট বন্ধ':'❌ অর্ডার বাতিল — চ্যাট বন্ধ') + '</div>';
      return;
    }

    // বায়ার "টাকা পাঠানো হয়েছে" পাঠিয়েছে কিনা
    const buyerPaid = msgs.some(m => m.sender_id !== me.id && /টাকা পাঠানো হয়েছে/.test(m.body||''));
    if (bar) bar.hidden = !buyerPaid;
  }

  async function doSend() {
    if (isClosed()) return;
    const inp=document.getElementById('chat-text');
    const t=inp.value.trim(); if(!t) return; inp.value='';
    await window.CFChat.sendMessage(orderId, me.id, t, 'text');
  }

  async function onReceived() {
    // কাস্টমার "আমি টাকা পেয়েছি" চাপল → মেসেজ + অর্ডার সম্পন্ন
    const btn=document.getElementById('chat-received-btn');
    btn.disabled=true;
    await window.cfSupabase.from('orders').update({ status:'completed' }).eq('id', orderId);
    await window.CFChat.sendMessage(orderId, me.id, '💵 আমি টাকা পেয়েছি — ধন্যবাদ!', 'text');
    await window.CFChat.sendMessage(orderId, me.id, '✅ অর্ডার সম্পন্ন হয়েছে।', 'system');
    order.status='completed';
    renderHeader();
    // মেসেজ রিফ্রেশ
    msgs = await window.CFChat.loadMessages(orderId); renderAll();
  }

  function setBack() {
    const q=new URLSearchParams(location.search);
    const from=q.get('from'); const tab=q.get('tab');
    let href='orders.html';
    if(from==='orders' && tab) href='orders.html?tab='+tab;
    const back=document.querySelector('.chat-back');
    if(back) back.setAttribute('href', href);
  }

  async function init() {
    setBack();
    orderId=window.CFChat.getOrderId();
    me=await window.CFChat.currentUser();
    if(!orderId||!me){ document.getElementById('chat-body').innerHTML='<div class="msg-system">অর্ডার পাওয়া যায়নি।</div>'; return; }
    order=await window.CFChat.loadOrder(orderId);
    if(!order){ document.getElementById('chat-body').innerHTML='<div class="msg-system">অর্ডার লোড হয়নি।</div>'; return; }

    renderHeader();
    msgs=await window.CFChat.loadMessages(orderId);
    renderAll();

    channel=window.CFChat.subscribe(orderId,(m)=>{ msgs.push(m); renderAll();
      if(m.sender_id!==me.id && window.CFChat.markRead) window.CFChat.markRead(orderId, me.id); });

    document.getElementById('chat-send').addEventListener('click', doSend);
    document.getElementById('chat-text').addEventListener('keydown', e=>{ if(e.key==='Enter') doSend(); });
    const rbtn=document.getElementById('chat-received-btn');
    if(rbtn) rbtn.addEventListener('click', onReceived);

    // চ্যাট খুললাম → পড়া হয়েছে
    if(window.CFChat.markRead) await window.CFChat.markRead(orderId, me.id);
  }

  document.addEventListener('DOMContentLoaded', ()=>{ if(window.cfSetupThemeToggle) cfSetupThemeToggle(); init(); });
})();
