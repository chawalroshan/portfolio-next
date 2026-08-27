# Roshan Chawal — Portfolio (Next.js)

A dynamic, database-driven portfolio built entirely on **Next.js 14 (App Router)** and deployed as a **single Vercel project** — no separate backend service. The public site is server-rendered from a Postgres database; a password-protected `/admin` panel manages all content (projects, blog posts, skills, and profile) through Server Actions.

The UI is a 1:1 port of the original Vite + React portfolio — same components, Tailwind classes, theme, and layout — with all hardcoded content replaced by data from the database.

---

## Stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Framework          | Next.js 14.2 (App Router, React Server Components)            |
| Language           | TypeScript                                                    |
| Database           | Vercel Postgres (Neon) via **Prisma**                         |
| Auth               | NextAuth / Auth.js v5 (Credentials, JWT sessions)             |
| Mutations          | Server Actions (Route Handler only for file upload)           |
| Rich text          | Tiptap (stored as HTML)                                       |
| File storage       | Vercel Blob (image uploads)                                   |
| Reordering         | dnd-kit (drag-and-drop, persisted to an `order` column)       |
| Styling            | Tailwind CSS + ported component CSS (CSS Modules for legacy)  |
| Analytics          | Vercel Analytics                                              |

---

## Project structure

```
portfolio-next/
├─ prisma/
│  ├─ schema.prisma          # Project, Blog, Skill, Profile (singleton), User
│  └─ seed.ts                # admin user + starter content
├─ public/images/            # static assets (profile photo, résumé PDF)
├─ src/
│  ├─ auth.ts                # NextAuth (Credentials + Prisma) — Node runtime
│  ├─ auth.config.ts         # edge-safe auth config (route protection)
│  ├─ middleware.ts          # guards /admin/*
│  ├─ actions/               # Server Actions (projects, blogs, skills, profile)
│  ├─ lib/
│  │  ├─ data.ts             # cached, published-only reads for the public site
│  │  ├─ admin-data.ts       # uncached, all-rows reads for the admin panel
│  │  ├─ prisma.ts           # Prisma client singleton
│  │  ├─ validation.ts       # zod schemas shared by the actions
│  │  ├─ icons.tsx           # string-key → icon component registry
│  │  ├─ og.tsx              # dynamic OpenGraph image renderer
│  │  └─ site-config.ts      # SITE_URL / SITE_NAME
│  ├─ components/
│  │  ├─ site/               # public sections (Hero, About, Skills, Projects…)
│  │  ├─ legacy/             # verbatim ports (CSS Modules), currently unmounted
│  │  └─ admin/              # admin UI (forms, lists, editor, nav)
│  └─ app/
│     ├─ layout.tsx          # root layout (html/body, fonts, metadata, analytics)
│     ├─ globals.css         # the only global stylesheet
│     ├─ sitemap.ts, robots.ts, opengraph-image.tsx, not-found.tsx
│     ├─ (site)/             # public site (own layout with navbar/footer/theme)
│     │  ├─ page.tsx         # home
│     │  ├─ projects/[slug]/ # project detail (SSG + ISR)
│     │  └─ blog/[slug]/     # blog index + post (SSG + ISR)
│     ├─ admin/
│     │  ├─ login/           # standalone sign-in (root layout only)
│     │  └─ (panel)/         # authenticated admin (own layout + AdminNav)
│     │     ├─ page.tsx      # dashboard
│     │     ├─ projects/     # list · new · [id]/edit
│     │     ├─ blogs/        # list · new · [id]/edit
│     │     ├─ skills/       # single-page manager
│     │     └─ profile/      # profile editor
│     └─ api/upload/         # POST — auth-guarded Vercel Blob upload
```

---

## Local development

### 1. Prerequisites

- Node.js 18.18+ (or 20+)
- A PostgreSQL database — the easiest path is a free Vercel Postgres / Neon database (works locally and in production).

### 2. Install & configure

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see [Environment variables](#environment-variables) below). At minimum you need `DATABASE_URL`, `DIRECT_URL`, and an auth secret.

Generate an auth secret:

```bash
openssl rand -base64 32
```

Set the value for **both** `NEXTAUTH_SECRET` and `AUTH_SECRET` (v5 reads `AUTH_SECRET`; `NEXTAUTH_SECRET` is kept for compatibility).

### 3. Create the schema and seed content

```bash
npm run db:push     # push the Prisma schema to the database
npm run db:seed     # create the admin user + starter content
```

The seed creates an admin login from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`, plus a profile, the original skill set, two sample projects, and one blog post.

### 4. Run

```bash
npm run dev
```

- Public site: <http://localhost:3000>
- Admin panel: <http://localhost:3000/admin> (redirects to `/admin/login`)

> **Local image uploads:** the Tiptap editor and image pickers upload to Vercel Blob, which needs `BLOB_READ_WRITE_TOKEN`. Create a Blob store in the Vercel dashboard and copy its read/write token into `.env` to test uploads locally. Everything else works without it.

---

## Environment variables

All variables live in `.env.example`. Summary:

| Variable                | Required | Purpose                                                              |
| ----------------------- | :------: | -------------------------------------------------------------------- |
| `DATABASE_URL`          |    ✅    | Pooled Postgres connection (app runtime).                            |
| `DIRECT_URL`            |    ✅    | Direct Postgres connection (Prisma migrate / push).                  |
| `AUTH_SECRET`           |    ✅    | Session encryption secret (Auth.js v5).                              |
| `NEXTAUTH_SECRET`       |    ✅    | Same value as `AUTH_SECRET` (compatibility).                         |
| `NEXTAUTH_URL`          |  local   | Base URL for local dev (`http://localhost:3000`). Inferred on Vercel.|
| `ADMIN_EMAIL`           |   seed   | First admin user's email (used by `prisma/seed.ts`).                 |
| `ADMIN_PASSWORD`        |   seed   | First admin user's password (hashed at seed time).                   |
| `BLOB_READ_WRITE_TOKEN` |  uploads | Vercel Blob token for image uploads.                                 |
| `NEXT_PUBLIC_SITE_URL`  |    ✅    | Public origin for absolute sitemap/OG URLs.                          |

---

## Deploy to Vercel

This is a **single Vercel project** — the app and its data layer ship together.

1. **Push to a Git repo** and import it into Vercel (Framework preset: Next.js — detected automatically).

2. **Add Postgres:** in the Vercel project, go to **Storage → Create → Postgres**. Vercel injects `DATABASE_URL` and `DIRECT_URL` automatically.

3. **Add Blob storage:** **Storage → Create → Blob**. This injects `BLOB_READ_WRITE_TOKEN` automatically.

4. **Set the remaining env vars** (Project → Settings → Environment Variables):
   - `AUTH_SECRET` and `NEXTAUTH_SECRET` (same generated value)
   - `NEXT_PUBLIC_SITE_URL` (your production URL, e.g. `https://your-domain.com`)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (only needed for the one-time seed)

5. **Deploy.** The build runs `prisma generate && next build` (see `package.json`).

6. **Initialize the database once.** After the first deploy, push the schema and seed the admin user. From your machine, with `.env` pointed at the production database:

   ```bash
   npm run db:push
   npm run db:seed
   ```

   (Alternatively run `prisma migrate deploy` if you prefer migrations over `db push`.)

7. **Log in** at `https://your-domain.com/admin` and change the seeded content.

### How content stays fresh

Public pages are statically generated and use ISR (`revalidate = 3600`). Every admin mutation calls `revalidateTag` + `revalidatePath`, so creating, editing, publishing, or reordering content updates the live site **immediately** rather than waiting for the hourly window.

---

## Admin panel

Sign in at `/admin`. From there you can:

- **Projects** — create/edit, upload a cover image, manage tech-stack tags, toggle publish, and **drag to reorder** (the order drives the home-page grid).
- **Blog** — write posts in a Tiptap rich-text editor (headings, lists, quotes, links, inline image upload), set an excerpt/cover image/tags, and publish. First publish stamps `publishedAt`.
- **Skills** — add/edit skills with an icon from the registry, grouped into home-page tabs by category, drag to reorder.
- **Profile** — name, title, bio, email, résumé URL, and social links (icon + label + URL).

Unpublished items are hidden from the public site but always visible in the admin.

---

## Notes & flagged decisions

- **Static assets that aren't in the schema.** The hero photo (`/images/profile.jpg`), the "Years Experience" and "Client Satisfaction" stats, and the résumé PDF path are **not** editable from the admin because the `Profile` model has no fields for them — they remain static (the résumé URL *is* editable via the profile form). Add columns to `Profile` and wire them into `ProfileForm` if you want them dynamic.
- **Blog HTML is rendered with `dangerouslySetInnerHTML`.** This is safe here because the only author is the authenticated admin (the site owner). If you ever open authoring to untrusted users, sanitize the HTML server-side first.
- **SVG uploads are allowed.** For the same single-trusted-author reason this is acceptable; SVGs can embed scripts, so if the trust model changes, drop `image/svg+xml` from the allow-list in `src/app/api/upload/route.ts`.
- **Images use plain `<img>` tags** (matching the original design) rather than `next/image`. `next.config.mjs` already whitelists Blob/remote hosts should you switch to `next/image` later.
- **Legacy components** in `src/components/legacy/` are verbatim ports kept for reference and are not mounted anywhere.

## ⚠️ Verification status

`npm install`, `npm run build`, and `prisma generate` were **not** run in the environment where this code was written (no package registry / native Prisma engines available). The code has been cross-checked statically — imports, exports, types, and Next.js App Router conventions — but you should run the following locally before relying on it:

```bash
npm install
npm run lint
npm run build
```

Then push/seed the database as described above.
# portfolio-next
