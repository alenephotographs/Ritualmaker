-- Row Level Security: default deny for anon/authenticated API keys.
-- The Next.js server uses the service role, which bypasses RLS.

alter table public.vendors enable row level security;
alter table public.site_settings enable row level security;
alter table public.bouquets enable row level security;
alter table public.pantry_items enable row level security;
alter table public.faqs enable row level security;
alter table public.reviews enable row level security;
alter table public.archive_photos enable row level security;
alter table public.wedding_inquiries enable row level security;
alter table public.ux_events enable row level security;

-- Optional later: add SELECT policies for `anon` if you expose read-only data
-- via the Supabase Data API instead of only through Next.js.
