/* CapFlow — admin buyers.js : সব বায়ার, নিষ্ক্রিয়/সক্রিয়, নতুন যোগ */
(function () {
  let buyers=[];
  function ini(n){ if(!n) return 'B'; const p=n.trim().split(/\s+/); return ((p[0]?.[0]||'')+(p[1]?.[0]||'')).toUpperCase()||'B'; }
  function showMsg(t,ok){ const m=document.getElementById('bz-msg'); m.hidden=false; m.textContent=t; m.className='au-msg '+(ok?'ok':'err'); }

  function card(b){
    const active = b.active !== false;
    return `<div class="ap-card">
      <div class="ap-top">
        <div class="ap-ava">${ini(b.full_name)}</div>
        <div style="flex:1"><div class="ap-name">${b.full_name||'(নামহীন)'}</div><div class="ap-email">বায়ার</div></div>
        <span class="badge ${active?'badge-done':'badge-cancel'}">${active?'সক্রিয়':'নিষ্ক্রিয়'}</span>
      </div>
      <div class="ap-btns">
        <button class="ap-btn ${active?'ap-reject':'ap-approve'}" data-id="${b.id}" data-active="${active}">
          ${active?'নিষ্ক্রিয় করুন':'আবার সক্রিয় করুন'}
        </button>
      </div>
    </div>`;
  }

  function render(){
    document.getElementById('bz-list').innerHTML=buyers.map(card).join('');
    document.getElementById('bz-count').textContent=buyers.filter(b=>b.active!==false).length;
    document.getElementById('bz-empty').hidden=buyers.length>0;
    document.querySelectorAll('[data-id]').forEach(btn=>btn.addEventListener('click',()=>toggle(btn.dataset.id, btn.dataset.active==='true')));
  }

  async function load(){
    const db=window.cfSupabase;
    const { data } = await db.from('profiles').select('id, full_name, role, active').eq('role','buyer').order('full_name');
    buyers=data||[];
    render();
  }

  // id দিয়ে active toggle — profiles.active আপডেট (admin policy তে আছে)
  async function toggle(id, isActive){
    await window.cfSupabase.from('profiles').update({ active: !isActive }).eq('id', id);
    load();
  }

  async function addBuyer(){
    const db=window.cfSupabase;
    const name=document.getElementById('bz-name').value.trim();
    const email=document.getElementById('bz-email').value.trim();
    if(!name||!email){ showMsg('নাম ও ইমেইল দিন।',false); return; }
    const btn=document.getElementById('bz-save'); btn.disabled=true; btn.textContent='যোগ হচ্ছে…';
    const { data: r, error } = await db.rpc('admin_set_role', { target_email: email, new_role: 'buyer' });
    if(error){ btn.disabled=false; btn.textContent='যোগ করুন'; showMsg('সমস্যা: '+error.message,false); return; }
    if(r && r!=='ok'){ btn.disabled=false; btn.textContent='যোগ করুন'; showMsg(r,false); return; }
    await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/customer/reset.html' });
    btn.disabled=false; btn.textContent='যোগ করুন';
    showMsg('✅ বায়ার যোগ হয়েছে। ঐ ইমেইলে পাসওয়ার্ড-সেট লিংক পাঠানো হয়েছে।',true);
    document.getElementById('bz-name').value=''; document.getElementById('bz-email').value='';
    load();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    cfRenderAdminNav('approvals');
    document.getElementById('bz-add-btn').addEventListener('click',()=>{ document.getElementById('bz-form').hidden=false; document.getElementById('bz-add-btn').hidden=true; });
    document.getElementById('bz-cancel').addEventListener('click',()=>{ document.getElementById('bz-form').hidden=true; document.getElementById('bz-add-btn').hidden=false; });
    document.getElementById('bz-save').addEventListener('click',addBuyer);
    load();
  });
})();
