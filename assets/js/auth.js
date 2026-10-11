/* ==========================================================================
   CapFlow — auth.js
   সাইন আপ, সাইন ইন, লগ আউট, আর "এখন কে লগইন করা আছে" — সব এক জায়গায়।
   Supabase-এর auth ব্যবহার করে। (supabase.js আগে লোড হতে হবে।)
   ========================================================================== */

/* সংক্ষেপে ক্লায়েন্ট ধরা */
function cfDB() {
  if (!window.cfSupabase) {
    console.error("Supabase সংযোগ নেই — supabase.js আগে লোড হয়েছে কিনা দেখুন।");
    return null;
  }
  return window.cfSupabase;
}

/* ---------- সাইন আপ (নতুন অ্যাকাউন্ট) ----------
   ইমেইল+পাসওয়ার্ড দিয়ে auth ইউজার তৈরি করে, আর profiles টেবিলে
   নাম/ফোন/role বসায়। role ডিফল্ট 'customer'. */
async function cfSignUp({ email, password, fullName, phone }) {
  const db = cfDB();
  if (!db) return { ok: false, msg: "সংযোগ নেই।" };

  // ১. auth ইউজার তৈরি
  const { data, error } = await db.auth.signUp({ email, password });
  if (error) return { ok: false, msg: cfAuthError(error.message) };

  const user = data.user;
  if (!user) return { ok: false, msg: "অ্যাকাউন্ট তৈরি হয়নি, আবার চেষ্টা করুন।" };

  // ২. profiles টেবিলে তথ্য বসাই
  const { error: pErr } = await db.from("profiles").insert({
    id: user.id,
    role: "customer",
    full_name: fullName || null,
    phone: phone || null
  });
  if (pErr) {
    // profile বসাতে না পারলেও auth তৈরি হয়ে গেছে — জানিয়ে রাখি
    console.warn("profile বসানো যায়নি:", pErr.message);
  }

  return { ok: true, user };
}

/* ---------- সাইন ইন ---------- */
async function cfSignIn({ email, password }) {
  const db = cfDB();
  if (!db) return { ok: false, msg: "সংযোগ নেই।" };

  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, msg: cfAuthError(error.message) };
  return { ok: true, user: data.user };
}

/* ---------- লগ আউট ---------- */
async function cfSignOut() {
  const db = cfDB();
  if (!db) return;
  await db.auth.signOut();
}

/* ---------- এখন কে লগইন করা আছে? ----------
   লগইন করা না থাকলে null ফেরত দেয়। */
async function cfCurrentUser() {
  const db = cfDB();
  if (!db) return null;
  // getSession() ব্রাউজারে সংরক্ষিত লগইন থেকে সাথে সাথে বলে দেয় (ইন্টারনেট অনুরোধ ছাড়া)
  const { data } = await db.auth.getSession();
  return (data && data.session) ? data.session.user : null;
}

/* ---------- পেজ পাহারা: লগইন না থাকলে welcome-এ পাঠাও ----------
   যেসব পেজ লগইন ছাড়া দেখা উচিত নয়, সেখানে শুরুতে এটা ডাকব। */
async function cfRequireLogin(redirect = "welcome.html") {
  const user = await cfCurrentUser();
  if (!user) { window.location.href = redirect; return null; }
  return user;
}

/* ---------- এরর বার্তা বাংলায় (পরিচিতগুলো) ---------- */
function cfAuthError(msg) {
  if (!msg) return "সমস্যা হয়েছে, আবার চেষ্টা করুন।";
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে। সাইন ইন করুন।";
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "ইমেইল বা পাসওয়ার্ড ভুল।";
  if (m.includes("password") && m.includes("6"))
    return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  if (m.includes("email") && m.includes("confirm"))
    return "ইমেইল ভেরিফাই করা দরকার (ড্যাশবোর্ডে Confirm email বন্ধ করুন)।";
  return msg;  // অজানা হলে মূল বার্তাই দেখাই
}

/* window-তে রাখি */
window.cfSignUp = cfSignUp;
window.cfSignIn = cfSignIn;
window.cfSignOut = cfSignOut;
window.cfCurrentUser = cfCurrentUser;
window.cfRequireLogin = cfRequireLogin;

/* ---------- পেজ পাহারা: নির্দিষ্ট role না হলে redirect ----------
   যেমন admin পেজে cfRequireRole('admin','login.html') */
async function cfRequireRole(role, redirect) {
  const db = cfDB();
  if (!db) { window.location.href = redirect; return null; }
  const { data: sess } = await db.auth.getSession();
  const user = (sess && sess.session) ? sess.session.user : null;
  if (!user) { window.location.href = redirect; return null; }
  const { data: prof } = await db.from('profiles').select('role').eq('id', user.id).single();
  if (!prof || prof.role !== role) { window.location.href = redirect; return null; }
  return user;
}
window.cfRequireRole = cfRequireRole;
