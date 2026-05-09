-- ============================================
-- 017 — Add 'rdn' to accounts.type CHECK constraint
--
-- Original constraint (migration 001) only allowed
--   ('cash', 'bank', 'digital_wallet', 'investment')
-- so inserting type='rdn' (introduced in app for broker cash accounts)
-- failed with "violates check constraint accounts_type_check".
--
-- Drop the old constraint and re-add with 'rdn' included.
-- ============================================

alter table public.accounts
  drop constraint if exists accounts_type_check;

alter table public.accounts
  add constraint accounts_type_check
  check (type in ('cash', 'bank', 'digital_wallet', 'rdn', 'investment'));
