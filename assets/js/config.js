/* ==========================================================================
   CapFlow — config.js
   এখানে থাকে যেসব তথ্য প্রায়ই বদলাতে হয় (অফার, সার্ভার, নমুনা ডেটা)।
   পরে এগুলো Supabase ডেটাবেস থেকে আসবে — এখন শুধু দেখানোর জন্য।
   ========================================================================== */

window.CAPFLOW = {

  /* কাস্টমার প্রোফাইল */
  user: {
    name: 'Sadia Rahman',
    initials: 'SR',
    email: 'sadia.rahman@gmail.com',
    phone: '+880 1712 345 678',
    since: 'আগস্ট ২০২৫',
    verified: true,
    totalOrders: 9,
    completed: 8,
    totalBdt: '৳1.2L',
    ownerEmail: 'owner@capflow.com'   // বায়ার হতে যোগাযোগের ইমেইল
  },

  /* অর্ডার তালিকা (Active / Completed / Cancelled) */
  orders: { active: [], completed: [], cancelled: [] },

  /* নোটিফিকেশন — শুধু নতুন মেসেজ (কাস্টমার চ্যাটের বাইরে থাকলে পায়) */
  notifications: [],

  /* সার্ভার অপশন (কাস্টমার সাইড) */
  servers: [
    { id: 'all', label: 'সব',        type: 'all' },
    { id: 'bd',  label: 'বাংলাদেশ',   type: 'flag-bd' },
    { id: 'us',  label: 'ইউএসএ',      type: 'flag-us' },
    { id: 'other', label: 'অন্য সার্ভার', type: 'globe' }
  ],

  /* মার্কেটপ্লেসের নমুনা অফার */
  offers: [],

  /* ===== বায়ার অংশ ===== */
  buyer: {
    name: 'Rasel Withdraw',
    initials: 'RW',
    email: 'rasel.buyer@gmail.com',
    verified: true,
    monthVolume: '৳0',
    growth: '0%',
    monthOrders: 0,
    activeCount: 0,
    completedCount: 0,
    rating: 0,
    completion: '0%',
    /* বায়ারের একমাত্র অফার */
    offer: null,
    /* বায়ারের সক্রিয় অর্ডার */
    activeOrders: [],
    completedOrders: []
  },

  /* ===== অ্যাডমিন অংশ ===== */
  admin: {
    pendingBuyers: 0,
    openDisputes: 0,
    customers: '0',
    buyers: 0,
    activeOrders: 0,
    completed: '0',
    activeOffers: 0,
    volume24h: '৳0',
    /* বায়ার আবেদন */
    applications: [],
    /* বিরোধ */
    disputes: []
  },

  /* চ্যাট তালিকা — সব চ্যাট সিরিয়ালি (নতুন উপরে)।
     unread = কয়টা নতুন মেসেজ; last = শেষ মেসেজ; time = কখন */
  chatList: [],

  /* চ্যাট পেজের নমুনা অর্ডার */
  chatOrder: {
    orderId: 'CF-20471',
    buyerName: 'Rasel Withdraw',
    buyerInitials: 'RW',
    online: true,
    usd: 150,
    rate: 103,
    total: 15450,     // usd * rate
    pay: 'bkash',
    status: 'চলমান'   // চলমান / সম্পন্ন / বাতিল
  },

  /* নমুনা মেসেজ (একটা পুরো অর্ডারের গল্প)
     from: 'buyer' | 'me' (কাস্টমার) | 'system'
     type: 'text' | 'system' | 'withdraw-done' | 'payment-sent'
     hasEmail: true হলে এই মেসেজ ২৪ ঘণ্টা পর অটো-ডিলিট হবে (ব্যাকএন্ডে) */
  chatMessages: [
    { from: 'system', type: 'system', text: 'অর্ডার তৈরি হয়েছে। বায়ারের উত্তরের জন্য অপেক্ষা করুন।', time: '' },
    { from: 'buyer', type: 'text', text: 'আসসালামু আলাইকুম। আপনার অর্ডার পেয়েছি, শুরু করছি।', time: '6:42 PM' },
    { from: 'me',    type: 'text', text: 'ঠিক আছে ভাই, আমি রেডি। ১৫০ ডলার withdraw করতে চাই।', time: '6:43 PM' },
    { from: 'buyer', type: 'text', text: 'CapCut email ও password পাঠান।', time: '6:44 PM' },
    { from: 'me',    type: 'text', text: 'sadia.capcut@gmail.com', time: '6:46 PM', hasEmail: true },
    { from: 'me',    type: 'text', text: 'superSecret99', time: '6:46 PM' },
    { from: 'buyer', type: 'text', text: 'পেয়েছি। OTP কোডটা একটু পাঠান।', time: '6:50 PM' },
    { from: 'me',    type: 'text', text: '481 253', time: '6:51 PM' },
    { from: 'buyer', type: 'withdraw-done', text: 'Dollar Withdraw করা হয়েছে', time: '6:53 PM',
      detail: { usd: 150, accounts: '2 / 2', note: '৳15,450 · bKash' } },
    { from: 'buyer', type: 'text', text: 'আপনার bKash নম্বরটা দিন।', time: '6:54 PM' },
    { from: 'me',    type: 'text', text: '01712 345 678', time: '6:55 PM' },
    { from: 'buyer', type: 'payment-sent', text: 'টাকা পাঠানো হয়েছে', time: '6:56 PM',
      detail: { amount: '৳15,450', to: 'bKash · 01712 345 678' } }
  ]
};
