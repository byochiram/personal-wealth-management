-- ============================================
-- 018 — AI Credit Metering
--
-- Existing schema (migration 014) already has:
--   - profiles.ai_credits int (current balance)
--   - plans.ai_credits_monthly int (monthly cap per tier: solo 10, pro 200, family 500)
--
-- Missing for actual metering:
--   - profiles.ai_credits_renewal_at — when credits next reset to plan cap
--   - SQL function consume_ai_credits(uid, amount) — atomic check+deduct
--   - SQL function reset_ai_credits_if_due(uid) — top up if past renewal
--
-- The atomic function avoids race conditions when two AI calls hit at once
-- (e.g. user mashes "Refresh insights" while a receipt scan is in flight).
-- Without atomicity you can over-spend credits.
-- ============================================

-- 1. Add renewal timestamp
alter table public.profiles
  add column if not exists ai_credits_renewal_at timestamptz not null default (now() + interval '30 days');

-- 2. Atomic consume — returns TRUE if charged, FALSE if insufficient.
--    Wrapped in a transaction by virtue of being a single SQL statement.
create or replace function public.consume_ai_credits(p_user_id uuid, p_amount int)
returns boolean
language plpgsql
security definer
as $$
declare
  v_current int;
begin
  -- Lock the row to prevent concurrent over-spend
  select ai_credits into v_current
  from public.profiles
  where id = p_user_id
  for update;

  if v_current is null then return false; end if;
  if v_current < p_amount then return false; end if;

  update public.profiles
    set ai_credits = ai_credits - p_amount
    where id = p_user_id;

  return true;
end;
$$;

-- 3. Reset credits if past renewal — call lazily before consume to top up.
--    Uses the user's active subscription plan to determine the cap; falls
--    back to 10 (Solo free tier) if no subscription.
create or replace function public.reset_ai_credits_if_due(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_renewal timestamptz;
  v_cap int;
begin
  select ai_credits_renewal_at into v_renewal
  from public.profiles where id = p_user_id;

  if v_renewal is null or v_renewal > now() then
    return;  -- not yet due
  end if;

  -- Look up plan cap from subscriptions → plans
  select coalesce(p.ai_credits_monthly, 10) into v_cap
  from public.subscriptions s
  left join public.plans p on p.id = s.plan_id
  where s.user_id = p_user_id and s.status = 'active'
  order by s.started_at desc
  limit 1;

  -- Default to free-tier 10 credits/month if no active subscription
  if v_cap is null then v_cap := 10; end if;

  update public.profiles
    set ai_credits = v_cap,
        ai_credits_renewal_at = now() + interval '30 days'
    where id = p_user_id;
end;
$$;

-- 4. Helper: get credit status (current + cap + days until reset)
create or replace function public.ai_credit_status(p_user_id uuid)
returns table(current_credits int, monthly_cap int, renewal_at timestamptz)
language plpgsql
security definer
as $$
begin
  return query
  select
    pr.ai_credits,
    coalesce(pl.ai_credits_monthly, 10),
    pr.ai_credits_renewal_at
  from public.profiles pr
  left join public.subscriptions s on s.user_id = pr.id and s.status = 'active'
  left join public.plans pl on pl.id = s.plan_id
  where pr.id = p_user_id
  order by s.started_at desc
  limit 1;
end;
$$;

grant execute on function public.consume_ai_credits to authenticated;
grant execute on function public.reset_ai_credits_if_due to authenticated;
grant execute on function public.ai_credit_status to authenticated;
