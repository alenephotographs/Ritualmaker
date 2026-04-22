# Cutover plan: Webflow → Vercel with no lapse

Goal: replace the live `ritualmakerny.com` Webflow site with the new Next.js build with **zero downtime** for the QR-code stand checkout flow.

## Why this is the highest risk on the project

Buyers physically standing at the flower stand scan a QR code printed on the shelf and expect to pay online within ~30 seconds. If the domain is unreachable for even a few minutes during the swap, you lose sales and erode trust at the stand.

## The swap, step by step

### T-7 days: build & verify

1. New site fully deployed on Vercel at `ritualmaker.vercel.app` (or `staging.ritualmakerny.com`).
2. Sanity dataset `ritualmaker` populated with all 4 bouquets, FAQ, reviews, and at least 12 archive photos.
3. Stripe configured in **live** mode with real products + prices.
4. End-to-end test: open staging on a phone → "Buy" → Apple Pay → Stripe payout shows up in dashboard. Refund the test charge.
5. Test on the actual stand by taping a temporary QR code (pointing at the staging URL) over one shelf and doing a real $20 purchase.

### T-1 day: prep DNS

1. In your DNS registrar, lower the TTL on the `A`/`CNAME` record for `ritualmakerny.com` to **60 seconds**. This makes propagation near-instant when you swap.
2. In Vercel, add the production domain `ritualmakerny.com` to the new project. Vercel will show the required DNS records and the domain will sit in a "pending" state until DNS points at it.
3. Confirm SSL will provision automatically (Vercel handles this on first request).

### T-0: the actual swap

1. In your DNS registrar, replace the existing `A`/`CNAME` records for `ritualmakerny.com` with the values Vercel showed you.
2. Within ~60 seconds, requests to `ritualmakerny.com` start hitting Vercel.
3. **Do not unpublish the Webflow site.** Leave it published so it remains as a fallback if you need to revert DNS.
4. Walk to the stand, scan a QR code, complete a real purchase. Confirm the Stripe webhook fired and the payout is on its way.

### T+1 hour: monitor

- Watch Stripe dashboard for at least one successful payment.
- Check Vercel analytics for 4xx/5xx spikes.
- Test all top-level URLs (`/`, `/shop`, `/gallery`).

### T+14 days: decommission

- Confirm 14 clean days of payments and zero customer complaints.
- Cancel the Webflow Ecommerce subscription.
- Increase DNS TTL back to a normal value (3600+).

## If something goes wrong: instant rollback

Because Webflow is still published and you only changed DNS:

1. Open your DNS registrar.
2. Restore the previous Webflow `A`/`CNAME` records.
3. Within 60 seconds (low TTL), the domain points back at Webflow.
4. Stripe checkouts continue working there exactly as they did before.

This is the entire reason we lower TTL beforehand and don't unpublish Webflow on swap day.

## URL preservation / SEO

The current Webflow site is mostly a single-page experience, so there are very few URLs to preserve. The `next.config.mjs` already has `redirects()` for the obvious ones (`/shop`, `/reviews`, `/faq`). Before cutover, run a crawl of the live Webflow site (e.g. Screaming Frog free tier or `wget --spider --recursive`) to get the full URL list, and add any missing redirects.

Page titles, meta descriptions, and JSON-LD on the new site are equivalent or better than the Webflow site, so organic search rankings should hold or improve.

## Stand QR codes

The QR codes already at the stand point at `ritualmakerny.com/...` (or the bare domain). Because the **domain stays the same** through the swap, every QR code keeps working — only the backend changes. If individual product QR codes point at Webflow-specific URLs (e.g. `/product/ritualmaker-bouquet-freshest`), add redirects for those URLs to `next.config.mjs` before swap day.

To inspect the existing QR codes:

```bash
# decode the QR to get its URL
zbarimg path/to/qr.png
```

## Checklist (print this)

- [ ] New site live on Vercel at staging URL
- [ ] Stripe live mode configured, all 4 bouquets purchasable
- [ ] Real-money $20 test purchase succeeded at the stand
- [ ] Sanity Studio access confirmed for owner
- [ ] DNS TTL lowered to 60s, 24h ago
- [ ] Webflow site still published (not unpublished)
- [ ] DNS records updated to point at Vercel
- [ ] First real purchase on new site confirmed
- [ ] Stripe webhook firing
- [ ] No 5xx spikes in Vercel analytics
- [ ] Customer asked nothing — they didn't notice the swap (success!)
