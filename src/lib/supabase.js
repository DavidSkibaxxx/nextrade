import { createClient } from '@supabase/supabase-js'

// ─── STEP 1: Replace these with your Supabase project values ───────────────
// Get them from: https://supabase.com → Your Project → Settings → API
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
// ───────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── STEP 2: Run this SQL in your Supabase SQL Editor ──────────────────────
/*

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  cash_balance numeric default 10000,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Enable row-level security
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Portfolio holdings
create table holdings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  symbol text not null,
  amount numeric not null default 0,
  avg_buy_price numeric not null default 0,
  updated_at timestamptz default now()
);
alter table holdings enable row level security;
create policy "Users can manage own holdings" on holdings for all using (auth.uid() = user_id);

-- Trade history
create table trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  symbol text not null,
  side text check (side in ('buy','sell')) not null,
  amount numeric not null,
  price numeric not null,
  total numeric not null,
  created_at timestamptz default now()
);
alter table trades enable row level security;
create policy "Users can view own trades" on trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades" on trades for insert with check (auth.uid() = user_id);

-- Deposit requests
create table deposits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  tx_hash text not null,
  coin text not null,
  amount numeric,
  status text default 'pending' check (status in ('pending','confirmed','rejected')),
  admin_note text,
  created_at timestamptz default now()
);
alter table deposits enable row level security;
create policy "Users can view own deposits" on deposits for select using (auth.uid() = user_id);
create policy "Users can insert deposits" on deposits for insert with check (auth.uid() = user_id);
create policy "Admins can manage all deposits" on deposits for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

*/
// ─────────────────────────────────────────────────────────────────────────────
