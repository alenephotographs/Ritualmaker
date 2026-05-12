-- Baseline Ritualmaker schema (fresh Supabase project).
-- Next.js uses the service role only; no public SQL API for CMS reads yet.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Vendors (Stripe Connect destinations for farm stand + consignment)
-- ---------------------------------------------------------------------------
create table public.vendors (
  id text primary key,
  name text not null,
  slug text not null unique,
  contact_name text,
  contact_email text,
  access_code text,
  active boolean not null default true,
  stripe_account_id text,
  stripe_onboarding_complete boolean not null default false,
  stripe_details_submitted boolean not null default false,
  stripe_charges_enabled boolean not null default false,
  stripe_payouts_enabled boolean not null default false,
  stripe_requirements_currently_due text[],
  stripe_requirements_past_due text[],
  stripe_requirements_disabled_reason text,
  stripe_compliance_last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendors_stripe_account_id_idx
  on public.vendors (stripe_account_id)
  where stripe_account_id is not null;

-- ---------------------------------------------------------------------------
-- Site settings (single logical row: id must be 1)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id int primary key check (id = 1),
  title text not null,
  tagline text not null,
  description text,
  stand_status text not null check (stand_status in ('open', 'restocking', 'closed')),
  stand_message text,
  address text,
  map_url text,
  instagram_url text,
  instagram_handle text,
  email text,
  google_review_url text,
  google_profile_url text,
  hero_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Farm stand: bouquets
-- ---------------------------------------------------------------------------
create table public.bouquets (
  id text primary key,
  name text not null,
  slug text not null,
  farm text not null check (farm in ('ritualmaker', 'wonderland-ridge')),
  vendor_id text references public.vendors (id) on delete set null,
  size text not null check (size in ('large', 'small')),
  price_cents int not null check (price_cents >= 100),
  shelf_location text,
  description text,
  highlights text[] default '{}',
  image_url text,
  stripe_product_id text,
  stripe_price_id text,
  available boolean not null default true,
  inventory_audit jsonb,
  inventory_audit_history jsonb not null default '[]'::jsonb,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bouquets_display_idx
  on public.bouquets (display_order asc, created_at asc);

-- ---------------------------------------------------------------------------
-- Farm stand: pantry
-- ---------------------------------------------------------------------------
create table public.pantry_items (
  id text primary key,
  name text not null,
  slug text not null,
  category text not null check (category in ('oil', 'salt', 'sugar', 'eggs', 'other')),
  vendor_id text references public.vendors (id) on delete set null,
  description text,
  price_cents int check (price_cents is null or price_cents >= 0),
  shelf_location text,
  image_url text,
  coming_soon boolean not null default false,
  available boolean not null default true,
  ships_available boolean not null default false,
  stripe_product_id text,
  stripe_price_id text,
  inventory_audit jsonb,
  inventory_audit_history jsonb not null default '[]'::jsonb,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pantry_display_idx
  on public.pantry_items (coming_soon asc, display_order asc, created_at asc);

-- ---------------------------------------------------------------------------
-- Marketing content
-- ---------------------------------------------------------------------------
create table public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  display_order int not null default 100
);

create index faqs_order_idx on public.faqs (display_order asc);

create table public.reviews (
  id text primary key,
  name text not null,
  quote text not null,
  source text,
  date date,
  featured boolean not null default false,
  display_order int not null default 100
);

create table public.archive_photos (
  id text primary key,
  caption text,
  kind text not null check (kind in ('image', 'video')),
  external_url text,
  image_url text,
  alt text,
  tags text[] default '{}',
  captured_at date,
  featured boolean not null default false,
  display_order int,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lead capture (on-location + photography inquiry forms)
-- ---------------------------------------------------------------------------
create table public.wedding_inquiries (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('on-location', 'photography')),
  name text not null,
  email text not null,
  phone text,
  event_date text,
  venue text,
  guest_count int,
  budget_band text,
  notes text,
  services text[] not null default '{}',
  photo_inquiry_kind text,
  status text not null default 'new' check (status in ('new', 'replied', 'booked', 'declined')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lightweight UX / CTA analytics (server-inserted)
-- ---------------------------------------------------------------------------
create table public.ux_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  experiment text,
  variant text,
  item_type text,
  item_id text,
  checkout_session_id text,
  amount_total int,
  path text,
  user_agent text,
  event_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Default site copy (edit in Supabase Table Editor or via admin tooling)
-- ---------------------------------------------------------------------------
insert into public.site_settings (
  id, title, tagline, description, stand_status, stand_message, address, map_url,
  instagram_url, instagram_handle, email, hero_image_url
) values (
  1,
  'Ritualmaker',
  'Fresh flowers in the neighborhood, 24/7',
  'Self-serve flowers at 38 Miller Hill Road, Hudson Valley. Order online for pickup or pay cash at the stand.',
  'open',
  'Restocked through the day',
  '38 Miller Hill Road, Hudson Valley, NY',
  'https://www.google.com/maps/search/?api=1&query=38%20Miller%20Hill%20Road%2C%20Hudson%20Valley%2C%20NY',
  'https://instagram.com/ritualmakerny',
  '@ritualmakerny',
  'ritualmakerny@gmail.com',
  null
) on conflict (id) do nothing;
