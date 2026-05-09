-- ============================================================
-- 012 — Default account per user (for Quick Add UX)
-- Profile points to the user's preferred default account, used to
-- pre-select when opening "Add Transaction" dialog.
-- ============================================================

alter table public.profiles
  add column if not exists default_account_id uuid
    references public.accounts(id) on delete set null;
