/* ==========================================================================
   CapFlow — order-setup.js
   offer id দিয়ে সঠিক অফার আনে। USD খালি (ডিফল্ট নেই), সর্বনিম্নের কম নয়,
   অ্যাকাউন্ট ১–৫, লাইভ হিসাব, আর অর্ডার তৈরি করে চ্যাটে যায়।
   ========================================================================== */

(function () {
  const payInfo = { bkash:{name:'bKash',cls:'pay-bkash'}, nagad:{name:'Nagad',cls:'pay-nagad'}, bank:{name:'Bank',cls:'pay-bank'} };
  const allPays = ['bkash','nagad','bank'];
  const TICK = '<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></span>';

  let offer=null, usd=0, accts=1, pay=null;

  function getOfferId(){ return new URLSearchParams(window.location.search).get('offer'); }

  function renderPays() {
    const box=document.getElementById('os-pays');
    box.innerHTML=allPays.map(p=>{
      const sup=offer.pay.includes(p); const info=payInfo[p];
      if(!sup) return `<div class="os-pay off"><span class="pay-chip ${info.cls}" style="opacity:.6">${info.name}</span><span class="state dim">নেই</span></div>`;
      const on=p===pay?' on':''; const state=p===pay?'নির্বাচিত':'&nbsp;';
      return `<div class="os-pay${on}" data-pay="${p}">${TICK}<span class="pay-chip ${info.cls}">${info.name}</span><span class="state">${state}</span></div>`;
    }).join('');
    box.querySelectorAll('[data-pay]').forEach(el=>el.addEventListener('click',()=>{ pay=el.dataset.pay; renderPays(); }));
  }

  /* লাইভ হিসাব */
  function renderSummary() {
    const valid = usd >= offer.min && usd <= offer.max;
    const total = (usd||0) * offer.rate;
    document.getElementById('os-s-usd').textContent  = '$' + (usd||0).toLocaleString('en-US') + '.00';
    document.getElementById('os-s-rate').textContent = '৳' + offer.rate + ' / $1';
    document.getElementById('os-s-acc').textContent  = accts;
    document.getElementById('os-s-total').textContent = valid ? ('৳' + total.toLocaleString('en-US')) : '—';
    document.getElementById('os-count').textContent  = accts;
  }

  function showErr(text) {
    let m=document.getElementById('os-msg');
    if(!m){ m=document.createElement('div'); m.id='os-msg'; m.className='au-msg err'; m.style.margin='0 22px 10px';
      const foot=document.querySelector('.os-foot'); foot.parentNode.insertBefore(m,foot); }
    m.hidden=false; m.textContent=text;
  }
  function clearErr(){ const m=document.getElementById('os-msg'); if(m) m.hidden=true; }

  async function loadOffer() {
    const db=window.cfSupabase;
    const offerId=getOfferId();
    if(!offerId){ showErr('অফার পাওয়া যায়নি।'); return; }
    const { data, error } = await db.from('offers')
      .select('id, buyer_id, rate, min_usd, max_usd, servers, pay_methods, notice_bn, is_active, profiles(full_name)')
      .eq('id', offerId).single();
    if(error || !data){ showErr('অফার লোড হয়নি।'); return; }
    if(!data.is_active){ showErr('এই অফারটি এখন সক্রিয় নেই।'); return; }

    offer={ id:data.id, buyerId:data.buyer_id, name:(data.profiles&&data.profiles.full_name)||'বায়ার',
      rate:data.rate, min:data.min_usd, max:data.max_usd, servers:data.servers||[], pay:data.pay_methods||[], notice:data.notice_bn||'' };
    usd=0; pay=offer.pay[0];

    document.getElementById('os-with').textContent = offer.name + ' · ৳' + offer.rate + '/$1';
    document.getElementById('os-limit').textContent = '$' + offer.min.toLocaleString('en-US') + ' – $' + offer.max.toLocaleString('en-US');
    const usdIn=document.getElementById('os-usd');
    usdIn.value='';
    usdIn.placeholder = 'সর্বনিম্ন $' + offer.min;

    renderPays();
    renderSummary();

    if(offer.notice && offer.notice.trim()){
      document.getElementById('os-notice').textContent=offer.notice;
      document.getElementById('os-notice-wrap').hidden=false;
    }
  }

  async function createOrder(e) {
    e.preventDefault();
    const db=window.cfSupabase;
    const btn=document.getElementById('os-continue');
    clearErr();

    if(!offer){ showErr('অফার লোড হয়নি।'); return; }
    if(!usd || usd < offer.min){ showErr('সর্বনিম্ন $' + offer.min + ' দিতে হবে।'); return; }
    if(usd > offer.max){ showErr('সর্বোচ্চ $' + offer.max + ' দেওয়া যাবে।'); return; }

    const { data: sess } = await db.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null;
    if(!user){ showErr('লগইন করুন।'); return; }
    if(user.id === offer.buyerId){ showErr('নিজের অফারে অর্ডার দেওয়া যায় না।'); return; }

    btn.textContent='তৈরি হচ্ছে…';
    const total=usd*offer.rate;
    const dispServer=offer.servers.includes('all')?'other':(offer.servers[0]||'bd');
    const code=window.cfOrderCode();
    const { data: order, error } = await db.from('orders').insert({
      code, customer_id:user.id, buyer_id:offer.buyerId, usd, rate:offer.rate, total_bdt:total,
      pay_method:pay, server:dispServer, accounts:accts, status:'active'
    }).select('id').single();
    if(error){ btn.textContent='চ্যাটে যান'; showErr('অর্ডার তৈরি হয়নি: '+error.message); return; }
    window.location.href='chat-view.html?order='+encodeURIComponent(order.id);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(window.cfSetupThemeToggle) cfSetupThemeToggle();
    loadOffer();

    const usdIn=document.getElementById('os-usd');
    usdIn.addEventListener('input', () => {
      let v=parseInt(usdIn.value.replace(/\D/g,''),10); if(isNaN(v)) v=0;
      usd=v; if(offer) renderSummary(); clearErr();
    });

    document.getElementById('os-minus').addEventListener('click',()=>{ if(accts>1){accts--;renderSummary();} });
    document.getElementById('os-plus').addEventListener('click',()=>{ if(accts<5){accts++;renderSummary();} });  // ১–৫

    document.getElementById('os-continue').addEventListener('click', createOrder);
  });
})();
