# GamScholarship review notes

Notes for the junior developer. This fork was used to check if the app can fetch real scholarship data. It is a working sample, not a finished product.

## Summary

The public website talks to Convex.
Convex downloads scholarship lists from the internet using RSS feeds.
Listings only show on the public site after checks pass.
Admin is a separate login area for reviewing stuck items.
We did not use fake seed data. We used live feeds.

## What worked

Erasmus Mundus (official EU RSS). Free. No API key. About 30 programmes came in.

Opportunities for Africans scholarships RSS. Free. No API key. The app reads each blog post, finds an official apply link, then saves the listing. First run: 10 out of 10 accepted.

Google and Anthropic discovery was not set up. You do not need it to prove fetching works.

## What I did, in order

1. Ran npm install and connected Convex (`npx convex dev`). That creates `.env.local` with the Convex URL.
2. Set ADMIN_KEY and ADMIN_USER on Convex (demo: admin / admin).
3. Registered sources with scripts/setupSources.mjs.
4. Ran the Erasmus sync. Real EU data appeared in the database.
5. Opened /admin and got a 404. The admin page file existed but was not wired in the router.
6. The admin UI expected Convex functions that were missing. Those were added.
7. Built a proper admin login and dashboard, separate from the public site header and footer.
8. Made the sidebar stay fixed, allowed scrolling in the main area, and added pagination on the review queue.
9. Added the Opportunities for Africans RSS path and ran it successfully.

## Files changed, and why

I am not pasting the code. Look at each file and figure out what it should do.

src/App.jsx
Why: public site and admin should not share the same layout. /admin must be a real route.

src/pages/admin/AdminApp.jsx
Why: one place for admin routes (login, overview, queue).

src/pages/admin/AdminAuth.jsx
Why: keep a short login session so you are not typing the key on every click.

src/pages/admin/AdminLogin.jsx
Why: username and password screen. Password must match ADMIN_KEY on Convex.

src/pages/admin/AdminLayout.jsx
Why: sidebar layout for the dashboard.

src/pages/admin/AdminDashboard.jsx
Why: simple counts (live, pending, rejected, sources).

src/pages/admin/AdminQueue.jsx
Why: list of pending items, actions, and pagination.

src/pages/admin/Admin.css
Why: styles for the dashboard layout and queue.

convex/admin.ts
Why: login check, stats, queue, approve, reject, expire. The UI was ready before these existed.

convex/rssIngestion.ts
Why: jobs that fetch RSS and send listings into the shared ingest pipeline. OFA sync was added here next to Erasmus.

convex/sources/ofaScholarshipsAdapter.ts
Why: turn OFA RSS items into the shared listing format. Skip items if no official apply URL is found.

convex/crons.ts
Why: schedule Erasmus and OFA syncs so data can refresh on its own.

scripts/setupSources.mjs
Why: register source names in the sources table, including OFA.

.env.local
Why: local Convex URL for the frontend. Created by convex dev. Do not commit secrets.

Files we used but did not invent today:

convex/ingestion.ts (shared checks and save)
convex/scholarships.ts (public list: only active and verified)
convex/sources/erasmusMundusAdapter.ts (EU feed adapter)
convex/validation.ts and convex/duplicates.ts (basic quality checks)

## Why we made an admin dashboard

Students should not see review tools on the public site.
Someone still needs a place to see pending items and fix problems.
Good practice: let automation publish when checks pass. Use the queue for exceptions, not for approving every single listing by hand.
Login protects write actions. Demo admin/admin is fine for a sample only.

## How data is fetched and shown

1. Fetch RSS from the internet.
2. Convex action runs (rssIngestion).
3. Adapter turns each item into one common listing shape.
4. ingestion validates, checks duplicates, then checks links.
5. Status becomes pending, verified, or rejected.
6. The React app asks scholarships.list.
7. Students only see verified and active listings.

Admin uses the same database with the admin key.

Right now Convex is the backend. There is no separate custom API server in this repo.

## Best practices

Prefer official feeds when you can (Erasmus).
For aggregators like OFA, always store the official apply URL, not the blog post URL.
Never put secrets in VITE_ variables. Those go to the browser.
Keep one listing shape for every source.
Automate trust checks. Use people for leftovers.
Check ingestionRuns after a sync to see if it worked.
Change demo passwords before anything real.

## How to run the sample yourself

npm install
npx convex dev
npx convex env set ADMIN_KEY "your-secret"
npx convex env set ADMIN_USER "admin"
CONVEX_URL=... ADMIN_KEY=... node scripts/setupSources.mjs
npx convex run rssIngestion:runErasmusMundusSync
npx convex run rssIngestion:runOfaScholarshipsSync
npm run dev

Then open / and /admin/login.

## Future idea: split into a monorepo

Today web and backend live together. That is fine for learning.

Later you can split:

apps/web (public site)
apps/admin (dashboard)
apps/mobile (phone app later)
packages/api-client (shared types and calls)
services/backend (Convex now, or another API later)

Web and admin should deploy separately.
Mobile should use the same backend rules, not copy them.
Keep fetching and source logic on the backend only.
Add real auth before more than one admin user.
Add tests for adapters using sample RSS files.
Be careful with how often you hit third party sites.
You do not need a monorepo on day one. Get sources and trust right first.

## Things you should figure out yourself

Why /admin 404’d even though AdminQueue.jsx existed.
Why the UI called listQueue and approve before those functions existed.
Why OFA must not use the blog URL as applicationUrl.
Why the public list ignores pending rows.
How you would add a third RSS source using the same pattern.

If you can answer those without copying blindly, you understand the system.
