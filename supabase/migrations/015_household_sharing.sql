-- ============================================================
-- 015 — Household sharing (Family plan)
--
-- Enables 1-4 user shared workspace for accounts, transactions, and
-- budgets. Each user belongs to AT MOST ONE household for MVP simplicity.
-- Existing personal data stays personal (household_id = null).
-- New transactions inherit active household_id at insert time.
--
-- Security:
-- - Only household owner can invite/remove members
-- - All members can read+insert+update household-tagged rows
-- - Only owner can delete household-tagged rows (or row creator can delete own)
-- - Invitations expire after 7 days, single-use
-- ============================================================

-- 1. Households
create table if not exists public.households (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'Keluarga',
  owner_user_id uuid references auth.users on delete cascade not null,
  max_seats int not null default 4,
  created_at timestamptz not null default now()
);

create index if not exists idx_households_owner on public.households (owner_user_id);

-- 2. Members
create table if not exists public.household_members (
  household_id uuid references public.households on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index if not exists idx_household_members_user on public.household_members (user_id);

-- Enforce: a user can be in at most one household (MVP simplicity)
create unique index if not exists uniq_one_household_per_user
  on public.household_members (user_id);

-- 3. Invitations (token-based, copy-link sharing)
create table if not exists public.household_invitations (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references public.households on delete cascade not null,
  invited_by uuid references auth.users on delete cascade not null,
  email text,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users
);

create index if not exists idx_household_invitations_token on public.household_invitations (token) where status = 'pending';

-- 4. Helper function — single source of truth for "is user in this household"
create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- Helper: get current user's household id (or null)
create or replace function public.current_household_id()
returns uuid
language sql
security definer
stable
as $$
  select household_id from public.household_members where user_id = auth.uid() limit 1;
$$;

-- 5. RLS for households + members + invitations

alter table public.households enable row level security;

drop policy if exists "Members can view their household" on public.households;
create policy "Members can view their household"
  on public.households for select
  using (public.is_household_member(id) or owner_user_id = auth.uid());

drop policy if exists "Authenticated can create household" on public.households;
create policy "Authenticated can create household"
  on public.households for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists "Owner can update household" on public.households;
create policy "Owner can update household"
  on public.households for update
  using (auth.uid() = owner_user_id);

drop policy if exists "Owner can delete household" on public.households;
create policy "Owner can delete household"
  on public.households for delete
  using (auth.uid() = owner_user_id);

alter table public.household_members enable row level security;

drop policy if exists "Members can see members of their household" on public.household_members;
create policy "Members can see members of their household"
  on public.household_members for select
  using (public.is_household_member(household_id));

drop policy if exists "Anyone can insert self into household" on public.household_members;
create policy "Anyone can insert self into household"
  on public.household_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "Members can leave (delete self)" on public.household_members;
create policy "Members can leave (delete self)"
  on public.household_members for delete
  using (auth.uid() = user_id);

-- Owner can also remove members
drop policy if exists "Owner can remove members" on public.household_members;
create policy "Owner can remove members"
  on public.household_members for delete
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

alter table public.household_invitations enable row level security;

drop policy if exists "Members can see invitations of their household" on public.household_invitations;
create policy "Members can see invitations of their household"
  on public.household_invitations for select
  using (public.is_household_member(household_id));

-- Pending invitations are also fetchable BY TOKEN (for the join page) —
-- separate policy lets unauthenticated lookups when only token is known
drop policy if exists "Anyone can read invitation by token" on public.household_invitations;
create policy "Anyone can read invitation by token"
  on public.household_invitations for select
  to authenticated
  using (status = 'pending' and expires_at > now());

drop policy if exists "Owner can create invitations" on public.household_invitations;
create policy "Owner can create invitations"
  on public.household_invitations for insert
  with check (
    auth.uid() = invited_by
    and exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Owner can update invitations (revoke)" on public.household_invitations;
create policy "Owner can update invitations (revoke)"
  on public.household_invitations for update
  using (
    exists (
      select 1 from public.households h
      where h.id = household_id and h.owner_user_id = auth.uid()
    )
    or accepted_by = auth.uid()  -- accepter can mark accepted
  );

-- 6. Add household_id to shared tables
alter table public.accounts     add column if not exists household_id uuid references public.households on delete set null;
alter table public.transactions add column if not exists household_id uuid references public.households on delete set null;
alter table public.budgets      add column if not exists household_id uuid references public.households on delete set null;

create index if not exists idx_accounts_household on public.accounts (household_id) where household_id is not null;
create index if not exists idx_transactions_household on public.transactions (household_id) where household_id is not null;
create index if not exists idx_budgets_household on public.budgets (household_id) where household_id is not null;

-- 7. Update RLS for shared tables
-- Pattern: row visible/editable if (auth.uid() = user_id) OR (household_id IS NOT NULL AND user is member)

-- ACCOUNTS
drop policy if exists "Users can view own accounts" on public.accounts;
create policy "Users can view own or household accounts"
  on public.accounts for select
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

drop policy if exists "Users can insert own accounts" on public.accounts;
create policy "Users can insert own or household accounts"
  on public.accounts for insert
  with check (
    auth.uid() = user_id
    and (household_id is null or public.is_household_member(household_id))
  );

drop policy if exists "Users can update own accounts" on public.accounts;
create policy "Users can update own or household accounts"
  on public.accounts for update
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

drop policy if exists "Users can delete own accounts" on public.accounts;
create policy "Users can delete own or household accounts"
  on public.accounts for delete
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

-- TRANSACTIONS
drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own or household transactions"
  on public.transactions for select
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own or household transactions"
  on public.transactions for insert
  with check (
    auth.uid() = user_id
    and (household_id is null or public.is_household_member(household_id))
  );

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own or household transactions"
  on public.transactions for update
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

drop policy if exists "Users can delete own transactions" on public.transactions;
create policy "Users can delete own or household transactions"
  on public.transactions for delete
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

-- BUDGETS
drop policy if exists "Users can view own budgets" on public.budgets;
create policy "Users can view own or household budgets"
  on public.budgets for select
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

drop policy if exists "Users can insert own budgets" on public.budgets;
create policy "Users can insert own or household budgets"
  on public.budgets for insert
  with check (
    auth.uid() = user_id
    and (household_id is null or public.is_household_member(household_id))
  );

drop policy if exists "Users can update own budgets" on public.budgets;
create policy "Users can update own or household budgets"
  on public.budgets for update
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

drop policy if exists "Users can delete own budgets" on public.budgets;
create policy "Users can delete own or household budgets"
  on public.budgets for delete
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

-- 8. RPC: accept_invitation (atomic — adds member, marks invite accepted, capacity check)
create or replace function public.accept_household_invitation(invite_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  inv record;
  member_count int;
  hh_max int;
begin
  -- Find pending invite
  select * into inv
  from public.household_invitations
  where token = invite_token
    and status = 'pending'
    and expires_at > now();

  if not found then
    return jsonb_build_object('success', false, 'error', 'Undangan tidak valid atau sudah kedaluwarsa.');
  end if;

  -- Check user not already a member of any household
  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    return jsonb_build_object('success', false, 'error', 'Kamu sudah jadi anggota keluarga lain. Keluar dulu sebelum gabung baru.');
  end if;

  -- Check capacity
  select max_seats into hh_max from public.households where id = inv.household_id;
  select count(*) into member_count from public.household_members where household_id = inv.household_id;

  if member_count >= hh_max then
    return jsonb_build_object('success', false, 'error', 'Kuota anggota keluarga sudah penuh.');
  end if;

  -- Add member
  insert into public.household_members (household_id, user_id, role)
  values (inv.household_id, auth.uid(), 'member');

  -- Mark invite accepted
  update public.household_invitations
     set status = 'accepted',
         accepted_at = now(),
         accepted_by = auth.uid()
   where id = inv.id;

  return jsonb_build_object('success', true, 'household_id', inv.household_id);
end;
$$;
