# GamScholarship

Gambia Scholarship & Study Abroad Portal &mdash; helping Gambian and
international students discover scholarships, study-abroad opportunities,
fellowships, and internships.

## Features

- Home page with featured scholarships, categories, and latest opportunities
- Searchable, filterable Scholarships listing (degree level, country,
  funding type, field of study)
- Scholarship details pages with eligibility, requirements, benefits, and
  an official application link
- Study Abroad page covering popular destinations (UK, Canada, USA,
  Germany, France, Turkey, China, Australia)
- Opportunities page (internships, fellowships, competitions, exchanges,
  research, training) with search and category filtering
- SmartCV promotion linking to an external CV-builder tool
- About and Contact pages (contact form uses a `mailto:` fallback &mdash;
  no backend required)
- Custom 404 page
- Responsive design (320px &ndash; 1440px+), accessible markup, and basic
  on-page SEO (titles + meta descriptions per page)

## Tech Stack

- React 18
- Vite
- React Router v6
- Plain CSS (no UI framework dependency)

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at the URL Vite prints in the terminal (typically
`http://localhost:5173`).

## Production Build

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to the `dist/` folder.

## Project Structure

```text
gamscolarship/
├── public/
│   ├── favicon/
│   └── images/
├── src/
│   ├── components/   # Navbar, Footer, cards, SEO helper, etc.
│   ├── pages/         # One file per route
│   ├── data/          # scholarships.js, opportunities.js, countries.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── vercel.json         # SPA rewrite rules for Vercel
├── .env.example
└── README.md
```

## Data

Scholarship and opportunity data lives in `src/data/`. Each entry is a
plain JavaScript object &mdash; add, edit, or remove entries directly in
`scholarships.js` / `opportunities.js` / `countries.js`.

**Note:** the bundled entries are marked `isSample: true` and exist to
demonstrate the site's layout and filtering. Replace them with verified,
real opportunities (with official source/application links) before
treating the site as a live source of information.

## Environment Variables

Copy `.env.example` to `.env` if you want to wire up Google Analytics:

```text
VITE_GA_ID=your-ga-measurement-id
```

No environment variables are required for the site to run.

## Deploying: GitHub

If this folder is not yet a Git repository:

```bash
git init
git remote add origin https://github.com/Palouis25/gamscolarship.git
git add .
git commit -m "Initial commit: GamScholarship React/Vite site"
git branch -M main
git push -u origin main
```

If the repository already exists locally (has a `.git` folder) or the
`origin` remote is already set, skip `git init` / `git remote add` and
just commit and push:

```bash
git add .
git commit -m "Rebuild GamScholarship as a React/Vite site"
git push -u origin main
```

> The previous version of this repository was a PHP/MySQL site. This
> rebuild replaces it with a static React/Vite front end with no backend
> or database — pushing will overwrite the PHP files in the repository
> history's latest commit (they remain recoverable via Git history).

## Deploying: Vercel

1. Go to [vercel.com](https://vercel.com) and import the
   `Palouis25/gamscolarship` GitHub repository.
2. Vercel should auto-detect the **Vite** framework preset. Confirm:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Add any environment variables (e.g. `VITE_GA_ID`) under Project
   Settings → Environment Variables, if used.
4. Deploy. The included `vercel.json` rewrite rule ensures client-side
   routes (e.g. `/scholarships`, `/study-abroad`) work correctly on
   refresh and direct navigation.
