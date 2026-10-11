/* ==========================================================================
   CapFlow — buyer chat-view.js
   ডেটাবেস মেসেজ + রিয়েল-টাইম + ওয়ার্কফ্লো বাটন + মেসেজ কপি + অর্ডার বন্ধে চ্যাট বন্ধ।
   ========================================================================== */

(function () {
  const payName = { bkash:'bKash', nagad:'Nagad', bank:'Bank' };
  let order=null, me=null, orderId=null, msgs=[];

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function ini(n){ if(!n) return 'C'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'C'; }
  function timeStr(iso){ return (window.cfBDClock?window.cfBDClock(iso):new Date(iso).toLocaleTimeString()); }
  function isClosed(){ return order && (order.status==='completed'||order.status==='cancelled'); }

  function renderHeader() {
    const custName=(order.cust&&order.cust.full_name)||'কাস্টমার';
    document.getElementById('byc-ava').innerHTML='<img src="../assets/img/customer.png" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">';
    document.getElementById('byc-name').textContent=custName;
    document.getElementById('byc-sub').textContent='কাস্টমার · #'+(order.code||'');
    document.getElementById('byc-state').textContent=order.status==='completed'?'সম্পন্ন':(order.status==='cancelled'?'বাতিল':'চলমান');
    document.getElementById('bs-usd').textContent='$'+order.usd;
    document.getElementById('bs-rate').textContent='৳'+order.rate;
    document.getElementById('bs-total').textContent='৳'+Number(order.total_bdt).toLocaleString('en-US');
    document.getElementById('bs-pay').textContent=payName[order.pay_method]||order.pay_method;
  }

  function msgHtml(m) {
    if(m.kind==='system') return `<div class="msg-system">${esc(m.body)}</div>`;
    const mine=m.sender_id===me.id;
    const side=mine?'msg-me':'msg-buyer';
    const t=m.created_at?`<div class="time">${timeStr(m.created_at)}${mine?' ✓✓':''}</div>`:'';
    return `<div class="msg ${side}" data-copy="${esc(m.body)}"><div>${esc(m.body)}</div>${t}</div>`;
  }

  function showToast(text){
    let t=document.getElementById('cf-toast');
    if(!t){ t=document.createElement('div'); t.id='cf-toast';
      t.style.cssText='position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:#12161F;color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;z-index:999;opacity:0;transition:opacity .2s';
      document.body.appendChild(t); }
    t.textContent=text; t.style.opacity='1'; setTimeout(()=>{t.style.opacity='0';},1200);
  }
  function wireCopy() {
    document.querySelectorAll('#byc-body .msg[data-copy]').forEach(el=>{
      if(el._wired) return; el._wired=true;
      let timer=null;
      const doCopy=()=>{ const txt=el.getAttribute('data-copy'); if(navigator.clipboard) navigator.clipboard.writeText(txt); showToast('কপি হয়েছে'); };
      el.addEventListener('touchstart',()=>{ timer=setTimeout(doCopy,500); });
      el.addEventListener('touchend',()=>clearTimeout(timer));
      el.addEventListener('touchmove',()=>clearTimeout(timer));
      el.addEventListener('dblclick',doCopy);
    });
  }

  function renderAll() {
    const b=document.getElementById('byc-body');
    b.innerHTML=msgs.map(msgHtml).join('')||'<div class="msg-system">কথা শুরু করুন।</div>';
    b.scrollTop=b.scrollHeight;
    wireCopy();
    updateActions();
  }

  function updateActions() {
    const actions=document.querySelector('.byc-actions');
    if(isClosed()){
      // চ্যাট বন্ধ — অ্যাকশন লুকাই, একটা বার্তা দেখাই
      if(actions) actions.innerHTML =
        '<div style="padding:16px;text-align:center;color:var(--muted);font-size:13px">'
        + (order.status==='completed'?'✅ অর্ডার সম্পন্ন — চ্যাট বন্ধ':'❌ অর্ডার বাতিল — চ্যাট বন্ধ') + '</div>';
    }
  }

  async function send(text) {
    if(isClosed()) return;
    if(!text||!text.trim()) return;
    await window.CFChat.sendMessage(orderId, me.id, text.trim(), 'text');
  }

  function setBack(){
    const q=new URLSearchParams(location.search);
    const tab=q.get('tab'); let href='orders.html';
    if(q.get('from')==='orders' && tab) href='orders.html?tab='+tab;
    const back=document.querySelector('.chat-back'); if(back) back.setAttribute('href',href);
  }
  async function init() {
    setBack();
    orderId=window.CFChat.getOrderId();
    me=await window.CFChat.currentUser();
    if(!orderId||!me){ document.getElementById('byc-body').innerHTML='<div class="msg-system">অর্ডার পাওয়া যায়নি।</div>'; return; }
    order=await window.CFChat.loadOrder(orderId);
    if(!order){ document.getElementById('byc-body').innerHTML='<div class="msg-system">অর্ডার লোড হয়নি।</div>'; return; }

    renderHeader();
    msgs=await window.CFChat.loadMessages(orderId);
    renderAll();
    window.CFChat.subscribe(orderId,(m)=>{ msgs.push(m); renderAll();
      if(m.sender_id!==me.id && window.CFChat.markRead) window.CFChat.markRead(orderId, me.id); });
    if(window.CFChat.markRead) await window.CFChat.markRead(orderId, me.id);

    const inp=document.getElementById('byc-text');
    const sendBtn=document.getElementById('byc-send');
    if(sendBtn) sendBtn.addEventListener('click',()=>{ send(inp.value); inp.value=''; });
    if(inp) inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ send(inp.value); inp.value=''; } });

    document.querySelectorAll('.byc-act[data-msg]').forEach(btn=>
      btn.addEventListener('click',()=>send(btn.dataset.msg)));

    const cancel=document.getElementById('byc-cancel');
    if(cancel) cancel.addEventListener('click', async ()=>{
      if(isClosed()) return;
      if(!confirm('অর্ডার বাতিল করবেন?')) return;
      await window.cfSupabase.from('orders').update({status:'cancelled'}).eq('id',orderId);
      await window.CFChat.sendMessage(orderId, me.id, '❌ অর্ডার বাতিল করা হয়েছে।', 'system');
      order.status='cancelled'; renderHeader();
      msgs=await window.CFChat.loadMessages(orderId); renderAll();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
