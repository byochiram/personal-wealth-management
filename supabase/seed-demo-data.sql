-- ============================================================
-- SEED DEMO DATA — for review/demo purposes
-- Target: bashide@gmail.com
-- Inserts ~50 realistic Indonesian transactions across current month
-- + last month, so AI Insights, charts, and budget widgets all light up.
--
-- USAGE: paste into Supabase SQL Editor → Run.
-- IDEMPOTENT-ish: safe to run multiple times (will just add more rows).
--   To wipe everything first, use the Profile → Reset Semua Data button.
-- ============================================================

do $$
declare
  v_user_id uuid;
  v_cash_acc uuid;
  v_bank_acc uuid;
  v_ewallet_acc uuid;
  v_today date := current_date;
  v_curr_y int := extract(year from current_date)::int;
  v_curr_m int := extract(month from current_date)::int;
  v_prev_y int;
  v_prev_m int;
begin
  -- Resolve user
  select id into v_user_id from auth.users where email = 'bashide@gmail.com';
  if v_user_id is null then
    raise exception 'User bashide@gmail.com tidak ditemukan';
  end if;

  -- Compute previous month
  if v_curr_m = 1 then
    v_prev_y := v_curr_y - 1;
    v_prev_m := 12;
  else
    v_prev_y := v_curr_y;
    v_prev_m := v_curr_m - 1;
  end if;

  -- Ensure 3 accounts exist (Cash auto-created on signup; add bank + e-wallet)
  select id into v_cash_acc from public.accounts
  where user_id = v_user_id and type = 'cash' limit 1;

  if v_cash_acc is null then
    insert into public.accounts (user_id, name, type, starting_balance, current_balance)
    values (v_user_id, 'Cash', 'cash', 1000000, 1000000)
    returning id into v_cash_acc;
  end if;

  -- BCA Tahapan
  select id into v_bank_acc from public.accounts
  where user_id = v_user_id and name ilike 'BCA%' limit 1;
  if v_bank_acc is null then
    insert into public.accounts (user_id, name, type, starting_balance, current_balance)
    values (v_user_id, 'BCA Tahapan', 'bank', 25000000, 25000000)
    returning id into v_bank_acc;
  end if;

  -- GoPay
  select id into v_ewallet_acc from public.accounts
  where user_id = v_user_id and name ilike 'GoPay%' limit 1;
  if v_ewallet_acc is null then
    insert into public.accounts (user_id, name, type, starting_balance, current_balance)
    values (v_user_id, 'GoPay', 'digital_wallet', 500000, 500000)
    returning id into v_ewallet_acc;
  end if;

  -- ─── CURRENT MONTH transactions (~28 entries) ───────────────
  insert into public.transactions (user_id, date, account_id, type, category, description, amount) values
    -- INCOME (1 big payday)
    (v_user_id, make_date(v_curr_y, v_curr_m,  1), v_bank_acc, 'income',     'Gaji',           'Gaji Mei dari kantor',                     12500000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  3), v_bank_acc, 'income',     'Side Hustle / Freelance', 'Project freelance design',         2500000),

    -- EXPENSES — Makanan (heavy GoFood pattern — AI should detect this)
    (v_user_id, make_date(v_curr_y, v_curr_m,  2), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — Warteg Bahari',                     45000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  3), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — Mie Gacoan',                        62000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  4), v_cash_acc,    'expense',  'Makanan',        'Indomaret — belanja groceries',             185000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  5), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — Sushi Tei (kerja lembur)',         287000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  6), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — Padang Sederhana',                  55000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  7), v_ewallet_acc, 'expense',  'Makanan',        'Starbucks (meeting client)',                115000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  8), v_cash_acc,    'expense',  'Makanan',        'Warung depan kos',                           35000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  8), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — Burger King (lunch)',               89000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  9), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — Sate Khas Senayan',                145000),

    -- EXPENSES — Transportasi
    (v_user_id, make_date(v_curr_y, v_curr_m,  2), v_ewallet_acc, 'expense',  'Transportasi',   'Gojek — kantor',                             28000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  3), v_ewallet_acc, 'expense',  'Transportasi',   'Grab — meeting',                             45000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  5), v_bank_acc,    'expense',  'Transportasi',   'Pertamina — bensin motor',                  100000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  7), v_ewallet_acc, 'expense',  'Transportasi',   'Gojek — pulang malam',                       55000),

    -- EXPENSES — Tagihan
    (v_user_id, make_date(v_curr_y, v_curr_m,  4), v_bank_acc,    'expense',  'Tagihan',        'PLN — listrik bulan lalu',                  450000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  4), v_bank_acc,    'expense',  'Tagihan',        'PDAM — air',                                120000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  5), v_bank_acc,    'expense',  'Tagihan',        'Indihome — internet 100Mbps',               395000),

    -- EXPENSES — Langganan
    (v_user_id, make_date(v_curr_y, v_curr_m,  3), v_bank_acc,    'expense',  'Langganan',      'Netflix Premium',                            186000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  3), v_bank_acc,    'expense',  'Langganan',      'Spotify Family',                             79000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  6), v_bank_acc,    'expense',  'Langganan',      'iCloud 200GB',                               45000),

    -- EXPENSES — Hiburan
    (v_user_id, make_date(v_curr_y, v_curr_m,  6), v_bank_acc,    'expense',  'Hiburan',        'CGV — nonton bareng pacar',                 165000),

    -- EXPENSES — Pakaian (anomaly — bigger than usual)
    (v_user_id, make_date(v_curr_y, v_curr_m,  7), v_bank_acc,    'expense',  'Pakaian & Aksesoris', 'Uniqlo Pacific Place',                  890000),

    -- SAVING
    (v_user_id, make_date(v_curr_y, v_curr_m,  2), v_bank_acc,    'saving',     'Dana Darurat',   'Auto-debit dana darurat',                  1500000),

    -- INVESTMENT
    (v_user_id, make_date(v_curr_y, v_curr_m,  2), v_bank_acc,    'investment', 'Reksa Dana',     'DCA Reksadana Pasar Uang',                 1000000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  5), v_bank_acc,    'investment', 'Saham',          'Beli BBCA 5 lot',                          5500000),
    (v_user_id, make_date(v_curr_y, v_curr_m,  7), v_bank_acc,    'investment', 'Cryptocurrency', 'DCA Bitcoin via Pintu',                     500000);

  -- ─── PREVIOUS MONTH transactions (~24 entries, less GoFood — for delta detection) ───
  insert into public.transactions (user_id, date, account_id, type, category, description, amount) values
    -- INCOME
    (v_user_id, make_date(v_prev_y, v_prev_m,  1), v_bank_acc,    'income',     'Gaji',           'Gaji April dari kantor',                  12500000),

    -- EXPENSES — Makanan (lebih hemat: lebih banyak masak/warung, dikit GoFood)
    (v_user_id, make_date(v_prev_y, v_prev_m,  3), v_cash_acc,    'expense',  'Makanan',        'Indomaret — groceries minggu pertama',      220000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  5), v_cash_acc,    'expense',  'Makanan',        'Warung depan kos',                           45000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  8), v_cash_acc,    'expense',  'Makanan',        'Padang Sederhana',                           48000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 12), v_cash_acc,    'expense',  'Makanan',        'Bakso Gareng',                               35000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 14), v_cash_acc,    'expense',  'Makanan',        'Indomaret — refill snack',                  125000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 18), v_ewallet_acc, 'expense',  'Makanan',        'GoFood — sekali aja kelaperan',              78000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 22), v_cash_acc,    'expense',  'Makanan',        'Warung Tegal',                               40000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 25), v_cash_acc,    'expense',  'Makanan',        'Indomaret — groceries',                     185000),

    -- EXPENSES — Transportasi
    (v_user_id, make_date(v_prev_y, v_prev_m,  3), v_ewallet_acc, 'expense',  'Transportasi',   'Gojek',                                      32000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 10), v_bank_acc,    'expense',  'Transportasi',   'Pertamina — bensin',                        100000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 17), v_ewallet_acc, 'expense',  'Transportasi',   'Grab — pulang hujan',                        38000),
    (v_user_id, make_date(v_prev_y, v_prev_m, 24), v_bank_acc,    'expense',  'Transportasi',   'Pertamina — bensin',                        100000),

    -- EXPENSES — Tagihan
    (v_user_id, make_date(v_prev_y, v_prev_m,  4), v_bank_acc,    'expense',  'Tagihan',        'PLN — listrik',                             425000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  4), v_bank_acc,    'expense',  'Tagihan',        'PDAM — air',                                115000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  5), v_bank_acc,    'expense',  'Tagihan',        'Indihome',                                  395000),

    -- EXPENSES — Langganan (steady)
    (v_user_id, make_date(v_prev_y, v_prev_m,  3), v_bank_acc,    'expense',  'Langganan',      'Netflix Premium',                            186000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  3), v_bank_acc,    'expense',  'Langganan',      'Spotify Family',                             79000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  6), v_bank_acc,    'expense',  'Langganan',      'iCloud 200GB',                               45000),

    -- EXPENSES — Hiburan
    (v_user_id, make_date(v_prev_y, v_prev_m, 12), v_cash_acc,    'expense',  'Hiburan',        'Cafe ngopi sama temen',                      85000),

    -- SAVING (sama)
    (v_user_id, make_date(v_prev_y, v_prev_m,  2), v_bank_acc,    'saving',     'Dana Darurat',   'Auto-debit dana darurat',                  1500000),

    -- INVESTMENT (sama pattern)
    (v_user_id, make_date(v_prev_y, v_prev_m,  2), v_bank_acc,    'investment', 'Reksa Dana',     'DCA Reksadana',                            1000000),
    (v_user_id, make_date(v_prev_y, v_prev_m,  5), v_bank_acc,    'investment', 'Saham',          'Beli TLKM 3 lot',                          1200000);

  -- ─── BUDGETS for current month ───────────────────────────────
  insert into public.budgets (user_id, year, month, category, type, amount) values
    (v_user_id, v_curr_y, v_curr_m, 'Makanan',              'expense', 2500000),
    (v_user_id, v_curr_y, v_curr_m, 'Transportasi',         'expense',  500000),
    (v_user_id, v_curr_y, v_curr_m, 'Tagihan',              'expense', 1000000),
    (v_user_id, v_curr_y, v_curr_m, 'Langganan',            'expense',  350000),
    (v_user_id, v_curr_y, v_curr_m, 'Hiburan',              'expense',  500000),
    (v_user_id, v_curr_y, v_curr_m, 'Pakaian & Aksesoris',  'expense',  500000),
    (v_user_id, v_curr_y, v_curr_m, 'Gaji',                 'income', 12500000),
    (v_user_id, v_curr_y, v_curr_m, 'Dana Darurat',         'saving',  1500000),
    (v_user_id, v_curr_y, v_curr_m, 'Reksa Dana',           'investment', 1000000),
    (v_user_id, v_curr_y, v_curr_m, 'Saham',                'investment', 5000000)
  on conflict (user_id, year, month, category, type) do nothing;

  -- ─── GOALS ──────────────────────────────────────────────────
  insert into public.goals (user_id, name, category, target_amount, current_amount, deadline, notes, is_active) values
    (v_user_id, 'DP Rumah Bintaro',     'property',  150000000,  42000000, (current_date + interval '24 months')::date, 'Target DP 30% dari rumah Rp 500jt', true),
    (v_user_id, 'Liburan Jepang 2027',  'travel',     45000000,  18000000, (current_date + interval '14 months')::date, 'Solo trip 12 hari',                  true),
    (v_user_id, 'Dana Pernikahan',      'wedding',   200000000,  35000000, (current_date + interval '36 months')::date, '',                                   true);

  -- ─── INVESTMENTS (existing holdings) ────────────────────────
  insert into public.investments (user_id, category, name, ticker, platform, quantity, avg_cost, current_price, total_value, type) values
    (v_user_id, 'stock',       'Bank Central Asia',         'BBCA.JK',  'Stockbit',     500,  9200,  9450,  4725000, 'variable_income'),
    (v_user_id, 'stock',       'Telkom Indonesia',          'TLKM.JK',  'Stockbit',     300,  4100,  3950,  1185000, 'variable_income'),
    (v_user_id, 'mutual_fund', 'Sucorinvest Money Market',  null,       'Bareksa',    50000,    1,    1.05,    52500, 'fixed_income'),
    (v_user_id, 'crypto',      'Bitcoin',                   'BTC-USD',  'Pintu',     0.012, 850000000, 1100000000,  13200000, 'variable_income');

  -- ─── DEBTS ──────────────────────────────────────────────────
  insert into public.debts (user_id, name, category, type, principal, remaining, interest_rate, monthly_payment, due_date, is_active) values
    (v_user_id, 'KPR Bank Mandiri',  'long_term', 'KPR',           450000000, 387000000, 8.5,  4200000, (current_date + interval '15 days')::date, true),
    (v_user_id, 'Cicilan Motor',     'consumer',  'Cicilan Barang', 25000000,  12500000, 5.5,   850000, (current_date + interval '8 days')::date,  true);

  raise notice '✅ Seed berhasil! User: bashide@gmail.com';
  raise notice 'Insert: %s transaksi current month, %s prev month', '~28', '~24';
  raise notice 'Plus 3 akun, 10 budgets, 3 goals, 4 investasi, 2 utang';
end $$;
