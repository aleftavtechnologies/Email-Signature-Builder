# Sahasra Signature Studio — deployment guide

This turns the signature generator into a paid tool: anyone can preview and
copy a signature, but it carries a small watermark until they pay once to
unlock it. Payment is real, processed through Stripe, and verified
server-side — nothing about the unlock can be faked by editing the page.

## What's in this folder

```
index.html                     the generator (frontend) — must stay at project root
api/create-checkout-session.js starts a real Stripe payment
api/verify-session.js          confirms payment actually happened
api/check-token.js             re-checks the unlock on later visits
package.json                   dependency list (just the stripe SDK)
vercel.json                    tells Vercel this is a static site, no build step
```

**Important:** `index.html` needs to stay at the top level of the project
(not inside a `public/` folder). Vercel only auto-serves a `public/`
directory when it detects a framework like Next.js — for a plain static +
serverless-functions project like this one, it looks for `index.html` at
the root. If you see a `404: NOT_FOUND` error after deploying, this is
almost always the cause — check that `index.html` is directly in your
repo's root folder, not nested inside another one.

## 1. Set up the Stripe product (5 min)

1. Log into your Stripe Dashboard (make sure you're in **Test mode** first — the toggle is top-right).
2. Go to **Product catalog → Add product**. Name it something like
   "Sahasra Signature Studio — Full License". Set a one-time price
   (not a subscription) at whatever you want to charge.
3. Save, then open the price you just created and copy its **Price ID**
   (looks like `price_1PxxxxxxxxxxxxxxxxxxxXX`).
4. Go to **Developers → API keys** and copy your **Secret key**
   (starts with `sk_test_...` while testing, `sk_live_...` once live).

## 2. Generate a session secret

This is a random string only your server knows, used to sign unlock tokens.
Run this on your computer (Mac/Linux terminal, or Git Bash on Windows):

```
openssl rand -hex 32
```

Copy the output — you'll paste it in as `SESSION_SECRET` below.

## 3. Deploy to Vercel (free tier is enough)

**Easiest path — no command line:**
1. Create a free account at vercel.com and a free GitHub account if you
   don't have one.
2. Create a new GitHub repository and upload everything in this folder to it.
3. In Vercel, click **Add New → Project**, pick that GitHub repo, and deploy.
   Vercel auto-detects the `api/` folder as serverless functions.
4. Once deployed, go to the project's **Settings → Environment Variables**
   and add:
   - `STRIPE_SECRET_KEY` = your Stripe secret key from step 1
   - `STRIPE_PRICE_ID` = your Price ID from step 1
   - `SESSION_SECRET` = the random string from step 2
5. Go to **Deployments** and redeploy (env vars only apply after a redeploy).

**Command-line path**, if you have Node.js installed:
```
npm install -g vercel
cd sahasra-signature-saas
vercel
# follow the prompts, then set the same 3 env vars:
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PRICE_ID
vercel env add SESSION_SECRET
vercel --prod
```

## 4. Test it before going live

While Stripe is still in **Test mode**, open your deployed URL, click
"Unlock — Remove Watermark", and pay with Stripe's test card:

```
Card number: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
```

You should be redirected back with the watermark gone. Refresh the page —
it should stay unlocked (the token is stored in that browser).

## 5. Go live

In Stripe, flip from Test mode to Live mode, create the same product/price
there (test and live are separate), and update the two environment
variables (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`) in Vercel with the live
values. Redeploy.

## Notes on how the unlock works

- The unlock is tied to the **browser**, not an account or email — it's
  stored in `localStorage`. If someone pays on their laptop and opens the
  tool on their phone, they'd need to pay again, since there's no login
  system. Adding real accounts (email + password, or magic links) is a
  reasonable next step if you want unlocks to follow a person rather than a
  device — I'm happy to build that layer too if it'd help.
- Nothing about the paywall can be bypassed by viewing page source — the
  actual payment check happens on the server using your secret key, which
  never reaches the browser.
- There's no database. Stripe's own dashboard is your record of who paid.
  If you later want a customer list, revenue reports inside the tool, or
  refund handling, that's the next layer to add (typically a small
  database plus a Stripe webhook).
