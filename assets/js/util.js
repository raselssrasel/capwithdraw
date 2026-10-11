/* ==========================================================================
   CapFlow — util.js
   কমন হেল্পার: BD লোকাল টাইম, অর্ডার কোড, অবতার ছবি।
   সব পেজে ব্যবহার হয়।
   ========================================================================== */

/* BD সময় (Asia/Dhaka) — একটা ISO/তারিখ থেকে সুন্দর বাংলা সময় */
function cfBDTime(iso) {
  const d = iso ? new Date(iso) : new Date();
  try {
    return d.toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch (e) {
    return d.toLocaleString();
  }
}

/* শুধু সময় (6:42 PM) — BD */
function cfBDClock(iso) {
  const d = iso ? new Date(iso) : new Date();
  try {
    return d.toLocaleTimeString('en-US', { timeZone:'Asia/Dhaka', hour:'numeric', minute:'2-digit', hour12:true });
  } catch (e) {
    let h=d.getHours(),m=d.getMinutes(); const ap=h>=12?'PM':'AM'; h=h%12||12; return h+':'+(m<10?'0'+m:m)+' '+ap;
  }
}

/* অর্ডার কোড: CW-YYMMDD-RANDOM  (BD তারিখ অনুযায়ী)
   যেমন CW-261011-A7K92P */
function cfOrderCode() {
  const now = new Date();
  // BD তারিখ বের করি
  const bd = new Date(now.toLocaleString('en-US', { timeZone:'Asia/Dhaka' }));
  const yy = String(bd.getFullYear()).slice(-2);
  const mm = String(bd.getMonth()+1).padStart(2,'0');
  const dd = String(bd.getDate()).padStart(2,'0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // বিভ্রান্তিকর (O,0,I,1) বাদ
  let rand = '';
  for (let i=0;i<6;i++) rand += chars[Math.floor(Math.random()*chars.length)];
  return 'CW-' + yy + mm + dd + '-' + rand;
}

/* অবতার ছবি — role অনুযায়ী
   cfAvatar('customer') → customer.png, cfAvatar('buyer') → buyer.png
   base = ছবির ফোল্ডারের আপেক্ষিক পথ (পেজ ভেদে ../assets/img/) */
function cfAvatarSrc(role, base) {
  base = base || '../assets/img/';
  return base + (role === 'buyer' ? 'buyer.png' : 'customer.png');
}

window.cfBDTime = cfBDTime;
window.cfBDClock = cfBDClock;
window.cfOrderCode = cfOrderCode;
window.cfAvatarSrc = cfAvatarSrc;
