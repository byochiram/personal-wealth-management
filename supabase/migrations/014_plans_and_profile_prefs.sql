-- ============================================================
-- 014 — Subscription plans, billing, and profile preferences
--
-- Sets up the foundation for productized PWM:
-- - profile preferences (theme, language, daily reminder, PIN, AI credits)
-- - plans table (subscription tiers; built so future Family plan can
--   accommodate up to N members via max_seats column)
-- - subscriptions table (current active plan per user)
-- - ai_credit_ledger (audit trail of credit spends/grants)
-- ============================================================

-- 1. Extend profiles
alter table public.profiles
  add column if not exists language text not null default 'id' check (language in ('id', 'en')),
  add column if not exists theme_accent text not null default 'burgundy',
  add column if not exists show_decimals boolean not null default false,
  add column if not exists daily_reminder_enabled boolean not null default false,
  add column if not exists daily_reminder_time time not null default '20:00',
  add column if not exists pin_hash text,
  add column if not exists ai_credits int not null default 100,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists avatar_url text;

-- 2. Plans (subscription tiers)
create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text not null,
  price_idr int not null default 0,
  original_price_idr int,
  max_seats int not null default 1,
  features jsonb not null default '[]'::jsonb,
  ai_credits_monthly int not null default 0,
  is_popular boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Public read-only (anyone authenticated can see pricing)
alter table public.plans enable row level security;
drop policy if exists "Anyone can read plans" on public.plans;
create policy "Anyone can read plans"
  on public.plans for select
  to authenticated using (true);

-- 3. Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  plan_id text references public.plans(id) not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'expired', 'pending')),
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);
create index if not exists idx_subscriptions_status on public.subscriptions (status) where status = 'active';

alter table public.subscriptions enable row level security;
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
  on public.subscriptions for select using (auth.uid() = user_id);

-- 4. AI credit ledger (immutable history)
create table if not exists public.ai_credit_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  delta int not null,
  reason text not null,
  metadata jsonb,
  balance_after int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_credit_ledger_user_id on public.ai_credit_ledger (user_id, created_at desc);

alter table public.ai_credit_ledger enable row level security;
drop policy if exists "Users can view own credit history" on public.ai_credit_ledger;
create policy "Users can view own credit history"
  on public.ai_credit_ledger for select using (auth.uid() = user_id);

-- 5. Seed initial plans
insert into public.plans (id, name, description, price_idr, original_price_idr, max_seats, features, ai_credits_monthly, is_popular, display_order)
values
  (
    'solo',
    'Solo',
    'Mulai atur keuangan tanpa biaya.',
    0,
    0,
    1,
    '["Akun & dompet unlimited", "Catat transaksi unlimited", "Anggaran bulanan", "Dashboard analitik dasar", "Export CSV"]'::jsonb,
    10,
    false,
    1
  ),
  (
    'pro',
    'Pro',
    'Kontrol penuh atas kekayaanmu.',
    79000,
    149000,
    1,
    '["Semua di Solo", "Foto struk → otomatis ke transaksi (AI Vision)", "AI Advisor — tanya apa saja", "Tracking aset & investasi lengkap", "Net worth real-time", "Goal setting & tracking", "Update harga saham otomatis", "Laporan & analisa detail"]'::jsonb,
    100,
    true,
    2
  ),
  (
    'family',
    'Family',
    'Atur keuangan bareng pasangan & keluarga.',
    199000,
    299000,
    4,
    '["Semua di Pro", "Hingga 4 anggota keluarga", "Wallet & budget bersama", "Tracking per-anggota (siapa belanja apa)", "Insight pengeluaran keluarga", "Notifikasi sinkron antar anggota", "Bonus 200 kredit AI/bulan"]'::jsonb,
    250,
    false,
    3
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_idr = excluded.price_idr,
  original_price_idr = excluded.original_price_idr,
  max_seats = excluded.max_seats,
  features = excluded.features,
  ai_credits_monthly = excluded.ai_credits_monthly,
  is_popular = excluded.is_popular,
  display_order = excluded.display_order;

-- 6. Auto-create Solo subscription for every new signup (extend handle_new_user)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_account_id uuid;
begin
  -- Profile (default values from column defaults)
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- Default Cash account
  insert into public.accounts (user_id, name, type, starting_balance, current_balance)
  values (new.id, 'Cash', 'cash', 0, 0)
  returning id into new_account_id;

  update public.profiles
     set default_account_id = new_account_id
   where id = new.id;

  -- Default Solo plan (free)
  insert into public.subscriptions (user_id, plan_id, status, expires_at)
  values (new.id, 'solo', 'active', null);

  -- Initial AI credits seed (100 free credits)
  insert into public.ai_credit_ledger (user_id, delta, reason, balance_after)
  values (new.id, 100, 'signup_bonus', 100);

  return new;
end;
$$ language plpgsql security definer;

-- Backfill: any existing user without a subscription gets Solo plan
do $$
declare
  u record;
begin
  for u in
    select id from auth.users
     where id not in (select user_id from public.subscriptions)
  loop
    insert into public.subscriptions (user_id, plan_id, status)
    values (u.id, 'solo', 'active');
  end loop;
end;
$$;
