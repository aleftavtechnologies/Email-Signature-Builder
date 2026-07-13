# Sahasra Signature Generator — Free Version (No Payments)

This is the simple, single-file version of the signature generator with
**no payment system at all**. Instead of a paywall, each browser gets
**3 free signature copies**, tracked locally — after that, the "Copy
signature HTML" button turns off with a message.

## What changed from the paywall version

- Removed everything related to Stripe/PayPal, checkout, and the unlock
  token system.
- Removed the watermark and locked-preview overlay entirely — the
  signature is always shown clean and full.
- Replaced all of that with a simple counter: 3 free copies per browser,
  no way to unlock more (by design — there's no payment system to unlock
  with). If you want more later, buying credits or removing the limit
  would need to be added back in.
- **No backend needed anymore.** This is now a single static HTML file —
  no serverless functions, no environment variables, nothing to configure.

## Deploying

Since there's no backend at all now, deployment is as simple as it gets:

1. Push this folder (just `index.html` and `vercel.json`) to your GitHub repo.
2. In Vercel, deploy it as a static site — no environment variables needed.
3. That's it. No Supabase, no Stripe, no PayPal setup required.

## How the 3-free-signature limit works

- Every time someone successfully clicks "Copy signature HTML," a counter
  goes up by 1, stored in that browser's `localStorage`.
- Once it hits 3, the copy button disables itself and shows a message.
- This is a **soft limit**, not a security feature — since there's no
  payment involved, there's no real incentive for someone to bypass it,
  but a technically inclined person could clear their browser storage to
  reset the count. If that ever becomes a problem, the fix is the same
  kind of server-side approach used in the earlier paywall version (an
  account or a database-backed counter instead of `localStorage`).
