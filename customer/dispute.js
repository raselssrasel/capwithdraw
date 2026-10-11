/* CapFlow — customer dispute.js : অভিযোগ জমা + তালিকা (ঘণ্টায় ১টা) */
(function () {
  let me=null;
  const statusText={open:'খোলা', resolved_customer:'সমাধান (আপনার পক্ষে)', resolved_buyer:'সমাধান (বায়ার পক্ষে)', hold:'পর্যালোচনায়'};

  function showMsg(t,ok){ const m=document.getElementById('dp-msg'); m.hidden=false; m.textContent=t; m.className='au-msg '+(ok?'ok':'err'); }

  async function loadOrders() {
    const db=window.cfSupabase;
    const { data } = await db.from('orders').select('id, code').eq('customer_id', me.id).order('created_at',{ascending:false});
    const sel=document.getElementById('dp-order');
    if(!data||data.length===0){ sel.innerHTML='<option value="">কোনো অর্ডার নেই</option>'; return; }
    sel.innerHTML=data.map(o=>`<option value="${o.id}">#${o.code}</option>`).join('');
  }

  async function loadDisputes() {
    const db=window.cfSupabase;
    // আমার অর্ডারের dispute গুলো
    const { data } = await db.from('disputes')
      .select('id, title, customer_note, status, created_at, orders(code, customer_id)')
      .order('created_at',{ascending:false});
    const mine=(data||[]).filter(d=>d.orders && d.orders.customer_id===me.id);
    const box=document.getElementById('dp-list'); const empty=document.getElementById('dp-empty');
    box.innerHTML=mine.map(d=>`
      <div class="dp-card">
        <div class="dp-card-top"><span class="dp-card-ttl">${d.title||'অভিযোগ'}</span>
          <span class="badge ${d.status==='open'?'badge-pending':'badge-done'}">${statusText[d.status]||d.status}</span></div>
        <div class="dp-card-note">${(d.customer_note||'').replace(/</g,'&lt;')}</div>
        <div class="dp-card-meta">#${d.orders?d.orders.code:''} · ${new Date(d.created_at).toLocaleString('bn-BD')}</div>
      </div>`).join('');
    empty.hidden=mine.length>0;
    return mine;
  }

  async function submit() {
    const db=window.cfSupabase;
    const orderId=document.getElementById('dp-order').value;
    const title=document.getElementById('dp-title').value;
    const note=document.getElementById('dp-note').value.trim();
    if(!orderId){ showMsg('একটি অর্ডার বাছুন।',false); return; }
    if(!note){ showMsg('বিস্তারিত লিখুন।',false); return; }

    // ঘণ্টায় ১টা — শেষ ১ ঘণ্টায় কোনো dispute দিয়েছে কিনা
    const mine=await loadDisputes();
    const hourAgo=Date.now()-60*60*1000;
    if(mine.some(d=>new Date(d.created_at).getTime()>hourAgo)){
      showMsg('⏳ আপনি এই ঘণ্টায় একটি অভিযোগ দিয়েছেন। পরে আবার চেষ্টা করুন।',false); return;
    }

    const btn=document.getElementById('dp-submit'); btn.disabled=true; btn.textContent='জমা হচ্ছে…';
    const { error } = await db.from('disputes').insert({ order_id:orderId, title:title, customer_note:note, status:'open' });
    btn.disabled=false; btn.textContent='অভিযোগ জমা দিন';
    if(error){ showMsg('জমা হয়নি: '+error.message,false); }
    else { showMsg('✅ অভিযোগ জমা হয়েছে।',true); document.getElementById('dp-note').value=''; loadDisputes(); }
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    cfRenderBottomNav('dispute'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders'); cfSetupThemeToggle();
    const { data: sess } = await window.cfSupabase.auth.getSession();
    me = sess && sess.session ? sess.session.user : null;
    if(!me) return;
    await loadOrders(); await loadDisputes();
    document.getElementById('dp-submit').addEventListener('click', submit);
  });
})();
