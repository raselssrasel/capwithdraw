/* ==========================================================================
   CapFlow — chat-db.js
   চ্যাটের ডেটাবেস কাজ: অর্ডার তথ্য আনা, মেসেজ আনা, পাঠানো, রিয়েল-টাইম।
   কাস্টমার ও বায়ার দুই চ্যাট পেজেই ব্যবহার হয়।
   ========================================================================== */

window.CFChat = (function () {
  const db = () => window.cfSupabase;

  function getOrderId() {
    return new URLSearchParams(window.location.search).get('order');
  }

  async function currentUser() {
    const { data } = await db().auth.getSession();
    return data && data.session ? data.session.user : null;
  }

  /* অর্ডার + দুই পক্ষের নাম আনা */
  async function loadOrder(orderId) {
    const { data, error } = await db()
      .from('orders')
      .select('id, code, usd, rate, total_bdt, pay_method, status, customer_id, buyer_id, cust:customer_id(full_name), buyr:buyer_id(full_name)')
      .eq('id', orderId).single();
    if (error) { console.warn('অর্ডার আনা যায়নি:', error.message); return null; }
    return data;
  }

  /* মেসেজ আনা (পুরনো → নতুন) */
  async function loadMessages(orderId) {
    const { data, error } = await db()
      .from('messages')
      .select('id, sender_id, kind, body, has_email, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) { console.warn('মেসেজ আনা যায়নি:', error.message); return []; }
    return data || [];
  }

  /* মেসেজ পাঠানো */
  async function sendMessage(orderId, senderId, body, kind) {
    const hasEmail = /\S+@\S+\.\S+/.test(body || '');
    const row = {
      order_id:  orderId,
      sender_id: senderId,
      kind:      kind || 'text',
      body:      body || '',
      has_email: hasEmail
    };
    // ইমেইল থাকলে ২৪ ঘণ্টা পর মুছে ফেলার সময় বসাই
    if (hasEmail) {
      row.expire_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    const { error } = await db().from('messages').insert(row);
    if (error) { console.warn('মেসেজ পাঠানো যায়নি:', error.message); return false; }
    return true;
  }

  /* রিয়েল-টাইম — নতুন মেসেজ এলে callback ডাকে */
  function subscribe(orderId, onNew) {
    const channel = db()
      .channel('msgs-' + orderId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'order_id=eq.' + orderId },
        (payload) => onNew(payload.new))
      .subscribe();
    return channel;
  }

  return { getOrderId, currentUser, loadOrder, loadMessages, sendMessage, subscribe };
})();

/* ===== read/unread + online (ভাগ A+B) — CFChat এ যোগ ===== */
(function(){
  const db = () => window.cfSupabase;

  // আমার জন্য unread অর্ডার সংখ্যা (চ্যাটে অন্যপক্ষের নতুন মেসেজ আছে এমন অর্ডার)
  CFChat.unreadCount = async function(userId) {
    try {
      const d = db();
      // আমার অর্ডারগুলো
      const { data: orders } = await d.from('orders')
        .select('id').eq('status','active').or('customer_id.eq.'+userId+',buyer_id.eq.'+userId);
      if (!orders || orders.length===0) return 0;
      // আমার read টাইম
      const { data: reads } = await d.from('chat_reads').select('order_id,last_read').eq('user_id',userId);
      const readMap = {}; (reads||[]).forEach(r=>readMap[r.order_id]=r.last_read);
      let count=0;
      for (const o of orders) {
        // এই অর্ডারে অন্য কারো শেষ মেসেজ আমার read টাইমের পরে কিনা
        const { data: last } = await d.from('messages')
          .select('created_at,sender_id').eq('order_id',o.id).neq('sender_id',userId)
          .order('created_at',{ascending:false}).limit(1);
        if (last && last.length) {
          const lastT = new Date(last[0].created_at).getTime();
          const readT = readMap[o.id] ? new Date(readMap[o.id]).getTime() : 0;
          if (lastT > readT) count++;
        }
      }
      return count;
    } catch(e){ console.warn('unread:', e.message); return 0; }
  };

  // একটা অর্ডার "পড়া হয়েছে" বসাই
  CFChat.markRead = async function(orderId, userId) {
    try {
      await db().from('chat_reads').upsert(
        { order_id:orderId, user_id:userId, last_read:new Date().toISOString() },
        { onConflict:'order_id,user_id' });
    } catch(e){ console.warn('markRead:', e.message); }
  };

  // আমার last_seen হালনাগাদ (অনলাইন বোঝাতে)
  CFChat.touchSeen = async function(userId) {
    try { await db().from('profiles').update({ last_seen:new Date().toISOString() }).eq('id',userId); }
    catch(e){}
  };

  // কতজন বায়ার এখন অনলাইন (শেষ ৩ মিনিটে last_seen)
  CFChat.buyersOnline = async function() {
    try {
      const since = new Date(Date.now()-3*60*1000).toISOString();
      const { count } = await db().from('profiles')
        .select('id',{count:'exact',head:true}).eq('role','buyer').gte('last_seen',since);
      return count||0;
    } catch(e){ return 0; }
  };
})();

/* কোন কোন অর্ডারে unread আছে (active অর্ডারের মধ্যে) — আইডি তালিকা */
CFChat.unreadOrderIds = async function(userId) {
  try {
    const d = () => window.cfSupabase;
    const db = d();
    const { data: orders } = await db.from('orders')
      .select('id').eq('status','active').or('customer_id.eq.'+userId+',buyer_id.eq.'+userId);
    if (!orders || orders.length===0) return [];
    const { data: reads } = await db.from('chat_reads').select('order_id,last_read').eq('user_id',userId);
    const readMap={}; (reads||[]).forEach(r=>readMap[r.order_id]=r.last_read);
    const unread=[];
    for (const o of orders) {
      const { data: last } = await db.from('messages')
        .select('created_at,sender_id').eq('order_id',o.id).neq('sender_id',userId)
        .order('created_at',{ascending:false}).limit(1);
      if (last && last.length) {
        const lt=new Date(last[0].created_at).getTime();
        const rt=readMap[o.id]?new Date(readMap[o.id]).getTime():0;
        if (lt>rt) unread.push(o.id);
      }
    }
    return unread;
  } catch(e){ return []; }
};

/* অর্ডার তালিকার জন্য — প্রতিটা অর্ডারের সর্বশেষ মেসেজ + unread সংখ্যা
   orderIds: অর্ডার আইডির array; userId: আমি
   ফেরত: { orderId: { last: 'শেষ মেসেজ', time: iso, unread: 3 } } */
CFChat.orderPreviews = async function(orderIds, userId) {
  const out = {};
  try {
    if (!orderIds || orderIds.length === 0) return out;
    const db = window.cfSupabase;
    // সব মেসেজ একবারে আনি (এই অর্ডারগুলোর)
    const { data: msgs } = await db.from('messages')
      .select('order_id, sender_id, body, kind, created_at')
      .in('order_id', orderIds)
      .order('created_at', { ascending: true });
    // আমার read টাইম
    const { data: reads } = await db.from('chat_reads')
      .select('order_id, last_read').eq('user_id', userId).in('order_id', orderIds);
    const readMap = {}; (reads||[]).forEach(r => readMap[r.order_id] = new Date(r.last_read).getTime());

    orderIds.forEach(id => out[id] = { last: '', time: null, unread: 0 });
    (msgs||[]).forEach(m => {
      const o = out[m.order_id]; if (!o) return;
      // সর্বশেষ মেসেজ
      o.last = m.kind === 'system' ? m.body : m.body;
      o.time = m.created_at;
      // unread গোনা (অন্যের মেসেজ, read টাইমের পরে)
      if (m.sender_id !== userId) {
        const rt = readMap[m.order_id] || 0;
        if (new Date(m.created_at).getTime() > rt) o.unread++;
      }
    });
  } catch(e){ console.warn('orderPreviews:', e.message); }
  return out;
};
