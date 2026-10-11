/* ==========================================================================
   CapFlow — buyer dashboard.js
   আসল নাম, লাইভ অর্ডার সংখ্যা, লাইভ অফার (ডেটাবেস থেকে)।
   ========================================================================== */

(function () {
  const srvLabel = { bd:'বাংলাদেশ', us:'ইউএসএ', all:'অন্য সব সার্ভার' };
  const payLabel = { bkash:'bKash', nagad:'Nagad', bank:'Bank' };
  let myId=null;

  function ini(n){ if(!n) return 'B'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'B'; }

  async function renderName(user) {
    const db=window.cfSupabase;
    const { data: prof } = await db.from('profiles').select('full_name').eq('id',user.id).single();
    const name=(prof&&prof.full_name)||user.email||'বায়ার';
    document.getElementById('by-name').textContent=name;
    document.getElementById('by-ava').textContent=ini(prof&&prof.full_name?prof.full_name:'');
  }

  async function renderOrders() {
    const db=window.cfSupabase;
    const { data } = await db.from('orders').select('status').eq('buyer_id',myId);
    const active=(data||[]).filter(o=>o.status==='active').length;
    const done=(data||[]).filter(o=>o.status==='completed').length;
    document.getElementById('bd-active').textContent=active;
    document.getElementById('bd-done').textContent=done;
    document.getElementById('bd-vol-n').textContent='৳ '+((data||[]).filter(o=>o.status==='completed').length*0).toLocaleString('en-US');
    // ভলিউম: সম্পন্ন অর্ডারের total যোগ করি
    const { data: done2 } = await db.from('orders').select('total_bdt').eq('buyer_id',myId).eq('status','completed');
    const vol=(done2||[]).reduce((s,o)=>s+Number(o.total_bdt||0),0);
    document.getElementById('bd-vol-n').textContent='৳ '+vol.toLocaleString('en-US');
    document.getElementById('bd-vol-g').innerHTML=
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg> মোট সম্পন্ন অর্ডার থেকে';
  }

  async function renderOffer() {
    const db=window.cfSupabase;
    // সক্রিয় অফারগুলো
    const { data } = await db.from('offers').select('rate,min_usd,max_usd,servers,pay_methods,is_active')
      .eq('buyer_id',myId).eq('is_active',true).order('created_at',{ascending:false});
    const rateEl=document.getElementById('bd-offer-rate');
    const srvEl=document.getElementById('bd-offer-srv');
    const payEl=document.getElementById('bd-offer-pay');
    const kEl=document.querySelector('.bd-offer-k');
    const live=document.querySelector('.bd-offer-live');

    if(!data || data.length===0){
      if(srvEl) srvEl.textContent='এখনো সক্রিয় অফার নেই';
      if(kEl) kEl.textContent='অফার নেই';
      if(payEl) payEl.textContent='তৈরি করতে ট্যাপ করুন';
      if(rateEl) rateEl.textContent='0';
      if(live) live.style.display='none';
      return;
    }
    const o=data[0];
    if(live) live.style.display='';
    if(kEl) kEl.textContent = data.length>1 ? (data.length+'টি সক্রিয় অফার') : 'লাইভ';
    if(rateEl) rateEl.textContent=o.rate;
    if(srvEl) srvEl.textContent=(o.servers||[]).map(s=>srvLabel[s]||s).join(', ')+' · $'+o.min_usd+'–$'+o.max_usd;
    if(payEl) payEl.textContent=(o.pay_methods||[]).map(p=>payLabel[p]||p).join(' · ');
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    cfRenderBuyerNav('dash'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders'); cfSetupThemeToggle();
    const { data: sess } = await window.cfSupabase.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null; if(!user) return;
    myId=user.id;
    if(window.CFChat && CFChat.touchSeen) CFChat.touchSeen(myId);  // অনলাইন চিহ্ন
    renderName(user); renderOrders(); renderOffer();
  });
})();
