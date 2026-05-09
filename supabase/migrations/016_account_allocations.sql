-- ============================================
-- 016 — Account allocations
--
-- Lets users mark "this Rp X in this account is for Y" so emergency
-- fund / goals / sinking funds reflect real account balances instead
-- of being typed-in numbers that drift out of date.
--
-- Each row links one account to one "purpose":
--   - emergency_fund — points to user's emergency_fund row
--   - goal           — points to a specific goals row
--   - sinking_fund   — labeled bucket (e.g., "Liburan Bali", "Pajak Tahunan")
--   - other          — generic
--
-- Sum of allocations on an account should be ≤ account balance.
-- The UI enforces this softly (warning, not hard block — bank balances
-- can fluctuate and we don't want to lock the user out of editing).
-- ============================================

create table if not exists public.account_allocations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete cascade not null,

  purpose_kind text not null
    check (purpose_kind in ('emergency_fund', 'goal', 'sinking_fund', 'other')),

  -- Exactly one of these is set, depending on purpose_kind:
  emergency_fund_id uuid references public.emergency_funds on delete cascade,
  goal_id           uuid references public.goals on delete cascade,
  -- For sinking_fund / other: free-text label
  custom_label text not null default '',

  amount bigint not null default 0,
  notes  text   not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Sanity: the FK column matches the purpose_kind
  constraint allocation_kind_target_match check (
    (purpose_kind = 'emergency_fund' and emergency_fund_id is not null and goal_id is null) or
    (purpose_kind = 'goal'           and goal_id is not null           and emergency_fund_id is null) or
    (purpose_kind in ('sinking_fund','other') and emergency_fund_id is null and goal_id is null)
  )
);

create index if not exists idx_account_allocations_account_id on public.account_allocations (account_id);
create index if not exists idx_account_allocations_user_id    on public.account_allocations (user_id);
create index if not exists idx_account_allocations_goal_id    on public.account_allocations (goal_id);
create index if not exists idx_account_allocations_ef_id      on public.account_allocations (emergency_fund_id);

-- Updated-at trigger
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_account_allocations_touch on public.account_allocations;
create trigger trg_account_allocations_touch
  before update on public.account_allocations
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.account_allocations enable row level security;

drop policy if exists "Users manage own account allocations" on public.account_allocations;
create policy "Users manage own account allocations"
  on public.account_allocations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (Household read policy intentionally omitted — family members can already
-- see shared accounts via the existing accounts RLS, and an allocation has
-- no value without seeing what kind of bucket it belongs to. If we later
-- want shared visibility into goal/EF allocations specifically, add a
-- household_id column to this table mirroring the accounts pattern.)

comment on table public.account_allocations is
  'Per-account earmarks: emergency fund / goals / sinking funds drawn from this account.';
