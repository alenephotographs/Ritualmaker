-- Client proposal portal hardening: expiring tokens and idempotent Stripe webhooks.

alter table public.client_documents
  add column if not exists proposal_public_token_expires_at timestamptz;

create table if not exists public.processed_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.processed_stripe_events enable row level security;
