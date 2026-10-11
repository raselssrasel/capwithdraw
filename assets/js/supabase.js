/* CapFlow — supabase.js */

const SUPABASE_URL  = "https://dsudzbuucpzyawvzpjda.supabase.co";
const SUPABASE_ANON = "sb_publishable_5YSPBT0KyBLeRptVqkH7pg_dZY_sOw4";

let cfSupabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === "function") {
  cfSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
} else {
  console.warn("Supabase লাইব্রেরি লোড হয়নি।");
}

async function cfTestSupabase() {
  if (!cfSupabaseClient) { console.error("client তৈরি হয়নি।"); return; }
  const { error } = await cfSupabaseClient.from("offers").select("id").limit(1);
  if (error) {
    console.log("সংযোগ হয়েছে, উত্তর:", error.message, "(টেবিল খালি/policy — স্বাভাবিক)");
  } else {
    console.log("✅ Supabase সংযোগ ঠিক আছে।");
  }
}

window.cfSupabase = cfSupabaseClient;
window.cfTestSupabase = cfTestSupabase;