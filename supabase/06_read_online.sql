-- ============================================================================
-- CapFlow — read/unread + অনলাইন স্ট্যাটাস (ভাগ A+B)
-- SQL Editor → New query → পেস্ট → Run
-- ============================================================================

-- ১. কে কোন অর্ডারের চ্যাট শেষ কখন দেখেছে
create table if not exists chat_reads (
  order_id   uuid not null references orders(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  last_read  timestamptz default now(),
  primary key (order_id, user_id)
);

alter table chat_reads enable row level security;

-- নিজের read নিজে দেখা/বসানো
create policy "reads_own_select" on chat_reads for select using ( user_id = auth.uid() );
create policy "reads_own_upsert" on chat_reads for insert with check ( user_id = auth.uid() );
create policy "reads_own_update" on chat_reads for update using ( user_id = auth.uid() );

-- ২. profiles এ last_seen (অনলাইন বোঝার জন্য) + active (বায়ার নিষ্ক্রিয় করতে)
alter table profiles add column if not exists last_seen timestamptz;
alter table profiles add column if not exists active boolean default true;

-- শেষ।
