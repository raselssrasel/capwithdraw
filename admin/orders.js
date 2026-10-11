/* CapFlow — admin orders.js : সব অর্ডার (active/completed/cancelled) + চ্যাট */
(function () {
  let tab=new URLSearchParams(location.search).get('tab')||'active', all={active:[],completed:[],cancelled:[]};
  const payName={bkash:'bKash',nagad:'Nagad',bank:'Bank'};
  const stateText={active:'চলমান',completed:'সম্পন্ন',cancelled:'বাতিল'};
  const badge={active:'badge-pending',completed:'badge-done',cancelled:'badge-cancel'};
  function ini(n){ if(!n) return '?'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'?'; }
  function card(o){
    return `<button class="od-card" data-order="${o.id}">
      <div class="od-card-top">
        <div class="od-card-id"><div class="od-card-ava">${ini(o.custName)}</div>
          <div><div class="od-card-buyer">${o.custName} → ${o.buyerName}</div><div class="od-card-meta">#${o.code||''}</div></div></div>
        <span class="badge ${badge[o.status]||'badge-pending'}">${stateText[o.status]||'চলমান'}</span>
      </div>
      <div class="od-card-bot">
        <div class="od-cell"><div class="k">USD</div><div class="v">$${o.usd}</div></div>
        <div class="od-cell"><div class="k">রেট</div><div class="v">৳${o.rate}</div></div>
        <div class="od-cell"><div class="k">মোট</div><div class="v hi">৳${Number(o.total_bdt).toLocaleString('en-US')}</div></div>
        <div class="od-cell"><div class="k">পেমেন্ট</div><div class="v">${payName[o.pay_method]||o.pay_method}</div></div>
      </div></button>`;
  }
  function render(){
    const list=all[tab]||[];
    const box=document.getElementById('ao-list'); const empty=document.getElementById('ao-empty');
    box.innerHTML=list.map(card).join(''); empty.hidden=list.length>0;
    box.querySelectorAll('.od-card').forEach(b=>b.addEventListener('click',()=>{ window.location.href='chat-view.html?order='+encodeURIComponent(b.dataset.order)+'&tab='+tab; }));
  }
  async function load(){
    const db=window.cfSupabase;
    const { data } = await db.from('orders')
      .select('id, code, usd, rate, total_bdt, pay_method, status, cust:customer_id(full_name), buyr:buyer_id(full_name)')
      .order('created_at',{ascending:false});
    all={active:[],completed:[],cancelled:[]};
    (data||[]).forEach(o=>{ o.custName=(o.cust&&o.cust.full_name)||'কাস্টমার'; o.buyerName=(o.buyr&&o.buyr.full_name)||'বায়ার';
      (all[o.status]||all.active).push(o); });
    document.getElementById('ao-c-active').textContent=all.active.length;
    document.getElementById('ao-c-completed').textContent=all.completed.length;
    document.getElementById('ao-c-cancelled').textContent=all.cancelled.length;
    render();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.od-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
    document.querySelectorAll('.od-tab').forEach(t=>t.addEventListener('click',()=>{
      document.querySelectorAll('.od-tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); tab=t.dataset.tab; history.replaceState(null,'','orders.html?tab='+tab); render(); }));
    cfRenderAdminNav('orders'); load();
  });
})();
