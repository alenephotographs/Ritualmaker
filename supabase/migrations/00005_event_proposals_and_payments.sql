-- Event proposals, hosted client portal, Stripe payment links + invoices (single canonical table).

create table public.client_documents (
  id uuid primary key default gen_random_uuid(),

  -- Client + event
  client_name text,
  client_email text,
  client_phone text,
  event_type text,
  event_date text,
  location text,

  status text not null default 'lead'
    check (status in ('lead', 'proposal_sent', 'booked', 'complete', 'declined')),

  payment_deposit_paid boolean not null default false,
  payment_balance_paid boolean not null default false,
  deposit_paid_at timestamptz,
  balance_paid_at timestamptz,

  proposal_total_cents int check (proposal_total_cents is null or proposal_total_cents >= 0),
  deposit_amount_cents int check (deposit_amount_cents is null or deposit_amount_cents >= 0),
  balance_amount_cents int check (balance_amount_cents is null or balance_amount_cents >= 0),
  payment_due_date text,

  internal_notes text,
  raw_inquiry_json jsonb not null default '{}'::jsonb,
  intake_notes text,

  floral_scope_text text,
  package_title text not null default '',
  package_subtitle text,
  floral_scope jsonb not null default '[]'::jsonb,
  total_line text not null default '',
  bridesmaid_ribbon_names text,
  notes text,
  day_of text,

  deposit_line text,
  deposit_link text,
  balance_line text,
  balance_link text,

  document_type text not null default 'proposal'
    check (document_type in ('proposal', 'invoice')),

  stripe_payment_link_deposit_id text,
  stripe_payment_link_balance_id text,

  last_payment_snapshot_total int,
  last_payment_snapshot_deposit int,
  last_payment_snapshot_balance int,
  last_payment_snapshot_balance_due_date text,

  stripe_invoice_id text,
  stripe_invoice_url text,
  stripe_invoice_pdf_url text,
  stripe_invoice_status text,
  stripe_invoice_amount_cents int
    check (stripe_invoice_amount_cents is null or stripe_invoice_amount_cents >= 0),

  payment_links_stale boolean not null default false,
  proposal_pdf_generated_at timestamptz,

  proposal_public_token text,
  proposal_link_disabled boolean not null default false,
  proposal_lifecycle_status text not null default 'draft'
    check (
      proposal_lifecycle_status in (
        'draft',
        'sent',
        'viewed',
        'approved',
        'partially_paid',
        'paid_in_full',
        'archived'
      )
    ),
  proposal_first_viewed_at timestamptz,
  proposal_last_viewed_at timestamptz,
  proposal_view_count int not null default 0 check (proposal_view_count >= 0),
  proposal_approved_at timestamptz,
  proposal_approved_name text,
  proposal_approved_ip text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_documents_updated_idx
  on public.client_documents (updated_at desc);

create unique index client_documents_proposal_public_token_uidx
  on public.client_documents (proposal_public_token)
  where proposal_public_token is not null;

-- Link commerce.orders to proposals when you persist checkout rows from the proposal portal.
alter table public.orders
  add constraint orders_client_document_id_fkey
  foreign key (client_document_id) references public.client_documents (id) on delete set null;

alter table public.client_documents enable row level security;
alter table public.orders enable row level security;
