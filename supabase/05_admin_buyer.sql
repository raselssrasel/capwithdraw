-- ============================================================================
-- CapFlow — অ্যাডমিন বায়ার ম্যানেজমেন্ট (ধাপ ৫)
-- SQL Editor → New query → পেস্ট → Run
-- ============================================================================

-- ১. অ্যাডমিন যেন সব profiles দেখতে ও role বদলাতে পারে (আগের policy এর সাথে যোগ)
--    (profiles_read_all আগেই আছে; update এর জন্য admin যোগ আছে profiles_update_self_or_admin এ)

-- ২. অ্যাডমিন একটি ইউজারের role বদলানোর নিরাপদ ফাংশন
--    (ইমেইল দিয়ে ইউজার খুঁজে role সেট করে — শুধু অ্যাডমিন চালাতে পারবে)
create or replace function admin_set_role(target_email text, new_role text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid;
begin
  -- যে চালাচ্ছে সে অ্যাডমিন কিনা
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    return 'শুধু অ্যাডমিন এটি করতে পারবে';
  end if;
  -- ইমেইল দিয়ে ইউজার খুঁজি
  select id into uid from auth.users where email = lower(target_email);
  if uid is null then
    return 'এই ইমেইলে কোনো ইউজার নেই (আগে সাইন আপ/ইনভাইট করতে হবে)';
  end if;
  -- profiles সারি না থাকলে বানাই, থাকলে role বদলাই
  insert into profiles (id, role) values (uid, new_role)
    on conflict (id) do update set role = new_role;
  return 'ok';
end;
$$;

-- শেষ।
