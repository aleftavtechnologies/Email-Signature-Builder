# Sahasra Signature Studio — deployment guide

This turns the signature generator into a paid tool: anyone can preview a
signature, but it carries a watermark and can't be copied until they pay
once to unlock it. Payment is real, processed through PayPal, and verified
server-side — nothing about the unlock can be faked by editing the page.

## What's in this folder

```
index.html                        the generator (frontend) — must stay at project root
api/paypal-config.js              tells the frontend which PayPal account to pay into (no secrets)
api/paypal-create-order.js        starts a real PayPal order, server-side (price can't be tampered with)
api/paypal-capture-order.js       confirms payment actually happened, issues the unlock token
api/check-token.js                re-checks the unlock on later visits
api/_lib/paypal.js                shared PayPal REST API helper
api/_lib/token.js                 shared unlock-token signing/verification helper
package.json                      dependency list (empty — no packages needed)
vercel.json                       tells Vercel this is a static site, no build step
```

**Important:** `index.html` needs to stay at the top level of the project
(not inside a `public/` folder), or you'll get a 404 on deploy.

## 1. Set up your PayPal app (5 min)

1. Go to [developer.paypal.com](https://developer.paypal.com) and log in with
   your normal PayPal business account (create a free business account
   first at paypal.com if you don't have one yet).
2. Go to **Apps & Credentials**. Make sure you're in **Sandbox** mode first
   (toggle near the top) — this lets you test with fake money.
3. Click **Create App**, name it something like "Sahasra Signature Studio."
4. You'll now see a **Client ID** and a **Secret** for this sandbox app.
   Copy both.

## 2. Generate a session secret

This is a random string only your server knows, used to sign unlock tokens.
Run this on your computer (Mac/Linux terminal, or Git Bash on Windows):

```
openssl rand -hex 32
```

Copy the output — you'll paste it in as `SESSION_SECRET` below. (No
terminal handy? Any long random 64-character string from a password
generator works just as well.)

## 3. Deploy to Vercel (free tier is enough)

**Easiest path — no command line:**
1. Create a free account at vercel.com and a free GitHub account if you
   don't have one.
2. Create a new GitHub repository and upload everything in this folder to it.
3. In Vercel, click **Add New → Project**, pick that GitHub repo, and deploy.
   Vercel auto-detects the `api/` folder as serverless functions.
4. Once deployed, go to the project's **Settings → Environment Variables**
   and add:
   - `PAYPAL_CLIENT_ID` = your sandbox Client ID from step 1
   - `PAYPAL_CLIENT_SECRET` = your sandbox Secret from step 1
   - `PAYPAL_ENV` = `sandbox`
   - `PAYPAL_CURRENCY` = `USD` (or another PayPal-supported currency —
     PayPal doesn't settle directly in LKR, so USD is the common choice
     for Sri Lanka–based merchants)
   - `PAYPAL_AMOUNT` = the price, e.g. `9.00`
   - `SESSION_SECRET` = the random string from step 2
5. Go to **Deployments** and redeploy (env vars only apply after a redeploy).

**Command-line path**, if you have Node.js installed:
```
npm install -g vercel
cd sahasra-signature-saas
vercel
# follow the prompts, then set each env var:
vercel env add PAYPAL_CLIENT_ID
vercel env add PAYPAL_CLIENT_SECRET
vercel env add PAYPAL_ENV
vercel env add PAYPAL_CURRENCY
vercel env add PAYPAL_AMOUNT
vercel env add SESSION_SECRET
vercel --prod
```

## 4. Test it before going live

While your PayPal app is still in **Sandbox** mode, open your deployed URL
and click the PayPal button below the locked preview. Log in with a PayPal
**sandbox test account** (Developer Dashboard → Sandbox → Accounts — PayPal
auto-creates a test buyer account you can use, with its own fake balance).

You should see the watermark disappear and the copy button unlock right
after payment. Refresh the page — it should stay unlocked (the token is
stored in that browser).

## 5. Go live

1. In the PayPal Developer Dashboard, switch to **Live** mode and create a
   Live app the same way you created the Sandbox one — you'll get a new,
   separate Client ID and Secret.
2. In Vercel, update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` with the
   live values, and change `PAYPAL_ENV` to `live`.
3. Redeploy.

## A note on Sri Lanka + PayPal

Sri Lankan PayPal business accounts have historically been able to *send*
money freely but had restrictions on *receiving/withdrawing* funds directly
to a local bank. This has shifted over time, so it's worth confirming
directly with PayPal (or your bank) that your specific business account can
withdraw before relying on this for real transactions. If withdrawal turns
out to be restricted, common workarounds are routing payouts through a
Payoneer-linked PayPal balance, or using a regional payment aggregator
instead — happy to help wire up an alternative if you hit that wall.

## Notes on how the unlock works

- The unlock is tied to the **browser**, not an account or email — it's
  stored in `localStorage`. If someone pays on their laptop and opens the
  tool on their phone, they'd need to pay again, since there's no login
  system. Adding real accounts (email + password, or magic links) is a
  reasonable next step if you want unlocks to follow a person rather than a
  device — I'm happy to build that layer too if it'd help.
- Nothing about the paywall can be bypassed by viewing page source — the
  actual payment check happens on the server using your PayPal secret,
  which never reaches the browser.
- There's no database. Your PayPal dashboard is your record of who paid.
  If you later want a customer list, revenue reports inside the tool, or
  refund handling, that's the next layer to add (typically a small
  database plus a PayPal webhook).
