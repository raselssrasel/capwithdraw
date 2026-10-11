/* CapFlow — buyer chat-list.js : আসল অর্ডার থেকে কাস্টমার চ্যাট তালিকা */
(function () {
  let items=[], search='', unreadIds=[];
  function ini(n){ if(!n) return 'C'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'C'; }
  const stateText={active:'চলমান',completed:'সম্পন্ন',cancelled:'বাতিল'};
  function row(c){
    const un = unreadIds.includes(c.id);
    const badge = un ? '<span class="cl-badge">নতুন</span>' : '';
    return `<button class="cl-item${un?' unread':''}" data-order="${c.id}">
      <div class="cl-ava"><img src="../assets/img/customer.png" style="width:100%;height:100%;object-fit:cover;border-radius:inherit"><span class="presence on"></span></div>
      <div class="cl-mid">
        <div class="cl-row1"><span class="cl-name">${c.name}</span><span class="cl-time"></span></div>
        <div class="cl-row2"><span class="cl-last">#${c.code||''} · ${stateText[c.status]||'চলমান'}</span>${badge}</div>
      </div></button>`;
  }
  function render(){
    let list=items.slice();
    if(search.trim()){const q=search.toLowerCase();list=list.filter(c=>(c.name||'').toLowerCase().includes(q)||(c.code||'').toLowerCase().includes(q));}
    const box=document.getElementById('cl-items'); const empty=document.getElementById('cl-empty');
    box.innerHTML=list.map(row).join(''); empty.hidden=list.length>0; if(list.length===0) empty.textContent='এখনো কোনো চ্যাট নেই।';
    box.querySelectorAll('.cl-item').forEach(b=>b.addEventListener('click',()=>{ window.location.href='chat-view.html?order='+encodeURIComponent(b.dataset.order); }));
  }
  async function load(){
    const db=window.cfSupabase;
    const { data: sess } = await db.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null; if(!user) return;
    const { data } = await db.from('orders')
      .select('id, code, status, cust:customer_id(full_name)')
      .eq('buyer_id', user.id).order('created_at',{ascending:false});
    items=(data||[]).map(o=>({ id:o.id, code:o.code, status:o.status, name:(o.cust&&o.cust.full_name)||'কাস্টমার' }));
    if(window.CFChat && CFChat.unreadOrderIds) unreadIds=await CFChat.unreadOrderIds(user.id);
    render();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const inp=document.getElementById('cl-search-input'); if(inp) inp.addEventListener('input',e=>{search=e.target.value;render();});
    cfRenderBuyerNav('chat'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders'); cfSetupThemeToggle(); load();
  });
})();
