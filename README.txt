CapFlow — সম্পূর্ণ ফ্রন্টএন্ড (কাস্টমার + বায়ার + অ্যাডমিন)

============ কীভাবে দেখবেন (ব্রাউজারে খুলুন) ============

অ্যাপে ঢোকা:
  index.html                  → স্প্ল্যাশ (শুরুর পেজ)
  customer/welcome.html       → Welcome
  customer/signin.html        → সাইন ইন
  customer/signup.html        → অ্যাকাউন্ট তৈরি

কাস্টমার অ্যাপ:
  customer/home.html          → হোম
  customer/marketplace.html   → মার্কেটপ্লেস (Withdraw)
  customer/orders.html        → অর্ডার (চলমান/সম্পন্ন/বাতিল)
  customer/chat.html          → চ্যাট তালিকা → chat-view.html (একক চ্যাট)
  customer/profile.html       → প্রোফাইল

বায়ার প্যানেল (প্রাইভেট):
  buyer/login.html            → বায়ার লগইন
  buyer/dashboard.html        → ড্যাশবোর্ড
  buyer/offer.html            → অফার (বাংলাদেশ/ইউএসএ/সব সার্ভার)
  buyer/orders.html           → সক্রিয়/সম্পন্ন অর্ডার
  buyer/chat.html             → কাস্টমার চ্যাট → chat-view.html (ওয়ার্কফ্লো বাটন)
  buyer/profile.html          → প্রোফাইল (ভেরিফিকেশন)

অ্যাডমিন:
  admin/login.html            → অ্যাডমিন লগইন
  admin/dashboard.html        → ওভারভিউ (মেট্রিক)
  admin/approvals.html        → বায়ার আবেদন (Approve/Reject)
  admin/offers.html           → অফার ম্যানেজমেন্ট
  admin/orders.html           → অর্ডার ম্যানেজমেন্ট (টাইমলাইন)
  admin/disputes.html         → বিরোধ ব্যবস্থাপনা

============ ফোল্ডার কাঠামো ============
  assets/css/tokens.css   → সব রঙ (লাইট + ডার্ক) এক জায়গায়
  assets/css/style.css    → কমন স্টাইল (বাটন, কার্ড, নেভ, থিম)
  assets/js/config.js     → সব নমুনা ডেটা (অফার, অর্ডার, চ্যাট, ইউজার, বায়ার, অ্যাডমিন)
  assets/js/app.js        → কমন নেভিগেশন (৩ রকম), ফ্ল্যাগ, ডার্ক/লাইট টগল
  customer/ buyer/ admin/ → প্রতিটা অংশের আলাদা পেজ (html/css/js আলাদা ফাইলে)

============ সব জায়গায় আছে ============
  - ডার্ক / লাইট মোড (পছন্দ মনে থাকে)
  - নিচে স্থির নেভিগেশন (৩ রকম: কাস্টমার / বায়ার / অ্যাডমিন)
  - একটা পেজ বদলাতে চাইলে শুধু সেই এক ফাইল দিলেই হবে

নোট: এটা শুধু সামনের অংশ (ফ্রন্টএন্ড)।
Supabase/ডেটাবেস/লগইন ও আসল ইমেইল অটো-ডিলিট পরের ধাপে।
