-- Farm stand / Stripe Checkout order records (optional persistence; app currently relies on Stripe + ux_events).

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text unique,
  source text not null default 'farm_stand'
    check (source in ('farm_stand', 'proposal_portal', 'admin', 'other')),
  item_type text check (item_type in ('bouquet', 'pantryItem')),
  item_id text,
  client_document_id uuid,
  amount_total_cents int check (amount_total_cents is null or amount_total_cents >= 0),
  currency text not null default 'usd',
  payment_status text,
  customer_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index orders_created_idx on public.orders (created_at desc);

create index orders_stripe_session_idx
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index orders_item_idx on public.orders (item_type, item_id);
