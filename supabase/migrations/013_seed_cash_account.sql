-- ============================================================
-- 013 — Seed default "Cash" account for every user
--
-- Rationale: most Indonesian transactions are cash. Auto-creating a
-- Cash account on signup eliminates the empty-state friction so users
-- can start logging transactions immediately, and gives the default-
-- account picker a sensible Layer-2 fallback out of the box.
-- ============================================================

-- 1. Replace handle_new_user to also seed a Cash account and mark it default
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_account_id uuid;
begin
  -- Profile (existing behaviour preserved)
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- Default Cash account
  insert into public.accounts (user_id, name, type, starting_balance, current_balance)
  values (new.id, 'Cash', 'cash', 0, 0)
  returning id into new_account_id;

  -- Set the Cash account as user's default (so Add Transaction pre-selects it)
  update public.profiles
     set default_account_id = new_account_id
   where id = new.id;

  return new;
end;
$$ language plpgsql security definer;

-- 2. Backfill: for any existing user with ZERO accounts, seed a Cash account
--    and set it as their default. We don't touch users who already have
--    accounts — they may have intentionally not set a default yet.
do $$
declare
  u record;
  new_id uuid;
begin
  for u in
    select id from auth.users
     where id not in (select user_id from public.accounts)
  loop
    insert into public.accounts (user_id, name, type, starting_balance, current_balance)
    values (u.id, 'Cash', 'cash', 0, 0)
    returning id into new_id;

    -- Ensure profile row exists (older accounts might miss it)
    insert into public.profiles (id, full_name)
    values (u.id, '')
    on conflict (id) do nothing;

    update public.profiles
       set default_account_id = new_id
     where id = u.id
       and default_account_id is null;
  end loop;
end;
$$;
