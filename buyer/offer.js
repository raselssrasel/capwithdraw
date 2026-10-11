/* ==========================================================================
   CapFlow — buyer offer.js
   একাধিক অফার (সর্বোচ্চ ৩টি সক্রিয়)। তালিকা দেখা, নতুন/এডিট, সক্রিয়/নিষ্ক্রিয়/মুছে ফেলা।
   ========================================================================== */

(function () {
  const MAX_ACTIVE = 3;
  const TICK = '<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></span>';
  const servers = [
    { id:'bd', name:'বাংলাদেশ', flag:CF_FLAGS.bd },
    { id:'us', name:'ইউএসএ', flag:CF_FLAGS.us },
    { id:'all', name:'অন্য সব সার্ভার', globe:true }
  ];
  const pays = [
    { id:'bkash', html:'<span class="pay-chip pay-bkash">bKash</span>' },
    { id:'nagad', html:'<span class="pay-chip pay-nagad">Nagad</span>' },
    { id:'bank',  html:'<span class="pay-chip pay-bank">Bank</span>' }
  ];
  const srvLabel = { bd:'বাংলাদেশ', us:'ইউএসএ', all:'অন্য সব সার্ভার' };
  const payLabel = { bkash:'bKash', nagad:'Nagad', bank:'Bank' };

  let myId=null, myOffers=[], editId=null;
  let picked=['bd'], pickedPay=['bkash'];

  function showMsg(t,ok){ const m=document.getElementById('of-msg'); m.hidden=false; m.textContent=t; m.className='au-msg '+(ok?'ok':'err'); }

  /* ---------- তালিকা ---------- */
  function offerRow(o) {
    const srv = (o.servers||[]).map(s=>srvLabel[s]||s).join(', ');
    const pay = (o.pay_methods||[]).map(p=>payLabel[p]||p).join(' · ');
    const active = o.is_active;
    return `
      <div class="ofc ${active?'':'ofc-off'}">
        <div class="ofc-top">
          <div><div class="ofc-rate">৳${o.rate} <span>/ $1</span></div>
            <div class="ofc-sub">${srv} · $${o.min_usd}–$${o.max_usd}</div>
            <div class="ofc-pay">${pay}</div></div>
          <span class="badge ${active?'badge-done':'badge-cancel'}">${active?'সক্রিয়':'নিষ্ক্রিয়'}</span>
        </div>
        <div class="ofc-btns">
          <button class="ofc-btn" data-edit="${o.id}">এডিট</button>
          <button class="ofc-btn" data-toggle="${o.id}">${active?'নিষ্ক্রিয় করুন':'সক্রিয় করুন'}</button>
          <button class="ofc-btn danger" data-del="${o.id}">মুছুন</button>
        </div>
      </div>`;
  }

  function renderList() {
    const box=document.getElementById('of-list');
    const empty=document.getElementById('of-list-empty');
    box.innerHTML=myOffers.map(offerRow).join('');
    empty.hidden=myOffers.length>0;
    const activeCount=myOffers.filter(o=>o.is_active).length;
    document.getElementById('of-count-sub').textContent = activeCount+'/'+MAX_ACTIVE+' সক্রিয় অফার';

    box.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.edit)));
    box.querySelectorAll('[data-toggle]').forEach(b=>b.addEventListener('click',()=>toggleActive(b.dataset.toggle)));
    box.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>delOffer(b.dataset.del)));
  }

  /* ---------- সার্ভার/পেমেন্ট ফর্মে ---------- */
  function renderServers() {
    document.getElementById('of-servers').innerHTML = servers.map(s=>{
      const on=picked.includes(s.id)?' on':'';
      const icon=s.globe?'<span class="srv-globe">'+CF_ICONS.globe+'</span>':s.flag;
      return `<div class="of-srv${on}" data-srv="${s.id}">${TICK}${icon}<span class="srv-name">${s.name}</span></div>`;
    }).join('');
    document.querySelectorAll('#of-servers .of-srv').forEach(el=>el.addEventListener('click',()=>{
      const id=el.dataset.srv;
      if(picked.includes(id)) picked=picked.filter(x=>x!==id); else picked.push(id);
      renderServers();
    }));
  }
  function renderPays() {
    document.getElementById('of-pays').innerHTML = pays.map(p=>{
      const on=pickedPay.includes(p.id)?' on':'';
      return `<div class="of-pay${on}" data-pay="${p.id}">${TICK}${p.html}</div>`;
    }).join('');
    document.querySelectorAll('#of-pays .of-pay').forEach(el=>el.addEventListener('click',()=>{
      const id=el.dataset.pay;
      if(pickedPay.includes(id)) pickedPay=pickedPay.filter(x=>x!==id); else pickedPay.push(id);
      renderPays();
    }));
  }

  /* ---------- ফর্ম খোলা (নতুন বা এডিট) ---------- */
  function openForm(id) {
    editId=id||null;
    const form=document.getElementById('of-form');
    document.getElementById('of-new-btn').hidden=true;
    form.hidden=false;
    document.getElementById('of-msg').hidden=true;

    if(editId){
      const o=myOffers.find(x=>x.id===editId);
      document.getElementById('of-form-title').textContent='অফার এডিট';
      document.getElementById('of-rate').value=o.rate;
      document.getElementById('of-min').value=o.min_usd;
      document.getElementById('of-max').value=o.max_usd;
      document.getElementById('of-note-bn').textContent=o.notice_bn||'';
      picked=(o.servers&&o.servers.length)?o.servers.slice():['bd'];
      pickedPay=(o.pay_methods&&o.pay_methods.length)?o.pay_methods.slice():['bkash'];
    } else {
      document.getElementById('of-form-title').textContent='নতুন অফার';
      document.getElementById('of-rate').value='';
      document.getElementById('of-min').value='';
      document.getElementById('of-max').value='';
      document.getElementById('of-note-bn').textContent='';
      picked=['bd']; pickedPay=['bkash'];
    }
    document.getElementById('of-note-bn').setAttribute('contenteditable','true');
    renderServers(); renderPays();
    form.scrollIntoView({behavior:'smooth'});
  }
  function closeForm() {
    document.getElementById('of-form').hidden=true;
    document.getElementById('of-new-btn').hidden=false;
    editId=null;
  }

  /* ---------- সেভ ---------- */
  async function save() {
    const db=window.cfSupabase;
    const rate=parseFloat(document.getElementById('of-rate').value);
    const min=parseInt(document.getElementById('of-min').value,10);
    const max=parseInt(document.getElementById('of-max').value,10);
    const note=document.getElementById('of-note-bn').textContent.trim();
    if(!rate||rate<=0){ showMsg('সঠিক রেট দিন।',false); return; }
    if(!min||!max||min>max){ showMsg('সর্বনিম্ন/সর্বোচ্চ ঠিকমতো দিন।',false); return; }
    if(picked.length===0){ showMsg('অন্তত একটি সার্ভার বাছুন।',false); return; }
    if(pickedPay.length===0){ showMsg('অন্তত একটি পেমেন্ট মেথড বাছুন।',false); return; }

    // নতুন অফার হলে — সক্রিয় সংখ্যা ৩ এর কম কিনা
    if(!editId){
      const activeCount=myOffers.filter(o=>o.is_active).length;
      if(activeCount>=MAX_ACTIVE){ showMsg('সর্বোচ্চ ৩টি সক্রিয় অফার রাখা যাবে। আগে একটি নিষ্ক্রিয় করুন।',false); return; }
    }

    const btn=document.getElementById('of-save'); btn.disabled=true; btn.textContent='সেভ হচ্ছে…';
    const row={ buyer_id:myId, rate, min_usd:min, max_usd:max, servers:picked, pay_methods:pickedPay, notice_bn:note, is_online:true, is_active:true };
    let error;
    if(editId){ ({ error } = await db.from('offers').update(row).eq('id',editId)); }
    else { ({ error } = await db.from('offers').insert(row)); }
    btn.disabled=false; btn.textContent='সেভ করুন';
    if(error){ showMsg('সেভ হয়নি: '+error.message,false); return; }
    closeForm();
    await load();
  }

  async function toggleActive(id) {
    const db=window.cfSupabase;
    const o=myOffers.find(x=>x.id===id);
    if(!o.is_active){
      const activeCount=myOffers.filter(x=>x.is_active).length;
      if(activeCount>=MAX_ACTIVE){ alert('সর্বোচ্চ ৩টি সক্রিয় অফার রাখা যাবে।'); return; }
    }
    await db.from('offers').update({ is_active: !o.is_active }).eq('id',id);
    await load();
  }
  async function delOffer(id) {
    if(!confirm('অফারটি মুছে ফেলবেন?')) return;
    await window.cfSupabase.from('offers').delete().eq('id',id);
    await load();
  }

  async function load() {
    const db=window.cfSupabase;
    const { data: sess } = await db.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null; if(!user) return;
    myId=user.id;
    const { data } = await db.from('offers').select('*').eq('buyer_id',myId).order('created_at',{ascending:false});
    myOffers=data||[];
    renderList();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    cfRenderBuyerNav('offer'); if(window.cfAutoUnreadBadge) cfAutoUnreadBadge('orders'); cfSetupThemeToggle();
    document.getElementById('of-new-btn').addEventListener('click',()=>openForm(null));
    document.getElementById('of-cancel').addEventListener('click',closeForm);
    document.getElementById('of-save').addEventListener('click',save);
    load();
  });
})();
