# Series Tracker

Track **movies** and **TV series** in one place — episode-level progress for shows, watched status for films, TMDB metadata, public explore pages, and an admin panel.

Built with **Next.js 15** (App Router), **NextAuth v5**, **Neon/Vercel Postgres**, **Tailwind CSS**, and the **TMDB API**.

---

## Features

### For everyone

- Public landing page with popular / featured titles
- Public detail pages (`/explore/tv/[id]`, `/explore/movie/[id]`) — browse without an account
- Light / dark theme (system preference + manual toggle, persisted)

### For signed-in users

- Personal library of movies **and** TV shows
- **No duplicates** — uniqueness by `mediaType` + `tmdbId`
- **Episode-level tracking** for TV (season / episode checklist + progress %)
- Movie watched toggle
- **Discover** — All / TV / Movies tabs, search, infinite load, add to library
- Dashboard overview — stats, recently added, trending, featured
- Profile (avatar, name)
- Auth flow preserves `?next=` / `callbackUrl` (signup → login → return to explore page)

### For admins

- User management (approve, ban, reset password, etc.)
- Featured titles (movies **and** TV) for homepage
- Announcements, system health, backup/restore
- Analytics — users, library size, TV vs movies tracked, most tracked titles

---

## Tech stack

| Layer              | Choice                                                   |
| ------------------ | -------------------------------------------------------- |
| Framework          | Next.js 15.3 (App Router)                                |
| UI                 | React 18, Tailwind CSS 3, Heroicons, Framer Motion       |
| Auth               | NextAuth.js 5 (credentials)                              |
| Database           | Neon / Vercel Postgres (`@neondatabase/serverless`)      |
| Media data         | [The Movie Database (TMDB)](https://www.themoviedb.org/) |
| Email (optional)   | Resend                                                   |
| Uploads (optional) | Vercel Blob                                              |

---

## Requirements

- **Node.js** ≥ 18.17
- **pnpm**, npm, or yarn
- A **Postgres** database (Neon recommended)
- A **TMDB API key** ([get one free](https://www.themoviedb.org/settings/api))
- Auth secret for NextAuth

---

## Environment variables

Create a `.env.local` (or configure the same keys in Vercel):

```bash
# App
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-long-random-string

# Database (Neon / Vercel Postgres)
POSTGRES_URL=postgres://...
# or DATABASE_URL=postgres://...

# TMDB (required for search, popular, details)
TMDB_API_KEY=your_tmdb_v3_api_key

# Optional — email (signup / notifications)
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# Optional — avatar uploads
BLOB_READ_WRITE_TOKEN=
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Database

The app expects tables such as:

- `users` — accounts, roles (`user` / `admin`), approval / ban flags
- `user_series` — library rows (movies + TV), `media_type`, `tmdb_id`, progress, `watched_episodes` JSONB, etc.
- `featured_series` — admin featured list (`media_type` `tv` | `movie`)
- `announcements`, `user_activity`, and any other tables your seed/migrations define

### Featured media type (if upgrading an existing DB)

```sql
ALTER TABLE featured_series
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'tv';
```

Ensure library uniqueness conceptually as `(user_id, media_type, tmdb_id)`.

Run your project's seed if provided:

```bash
pnpm seed
# or
npm run seed
```

---

## Setup

This project uses **pnpm**. Do not commit `package-lock.json`.

```bash
# Clone
git clone https://github.com/muntasir-smm/nextjs-series-track.git
cd nextjs-series-track

# Install
pnpm install
# or: npm install

# Env
cp .env.example .env.local   # if you maintain .env.example
# edit .env.local with real values

# Dev
pnpm dev
# → http://localhost:3000
```

### Scripts

| Command         | Description                   |
| --------------- | ----------------------------- |
| `pnpm dev`      | Development server            |
| `pnpm build`    | Production build              |
| `pnpm start`    | Run production build          |
| `pnpm lint`     | ESLint                        |
| `pnpm seed`     | Seed database (if configured) |
| `pnpm prettier` | Format code                   |

---

## Project structure (high level)

```
app/
  admin/                 # Admin panel (users, featured, analytics, …)
  api/                   # Route handlers (auth, tmdb, admin, public)
  dashboard/             # Authenticated app
    (overview)/          # Home stats, trending, featured
    discover/            # Browse & add movies/TV
    tvSeries/            # Library list + [id] episode tracker
    movie/[id]/          # Movie detail in library
  explore/               # Public movie/TV detail
  login/ · signup/
  ui/                    # Shared UI (nav, forms, theme-toggle, …)
  lib/                   # series actions, auth, progress, db
middleware.ts            # Protects /dashboard, /admin; public explore OK
```

---

## Key routes

| Path                        | Access | Description                               |
| --------------------------- | ------ | ----------------------------------------- |
| `/`                         | Public | Landing                                   |
| `/explore/tv/[tmdbId]`      | Public | TV details                                |
| `/explore/movie/[tmdbId]`   | Public | Movie details                             |
| `/login` · `/signup`        | Public | Auth (`?next=` / `callbackUrl` supported) |
| `/dashboard`                | Auth   | Overview                                  |
| `/dashboard/discover`       | Auth   | Search & add                              |
| `/dashboard/myLibrary`      | Auth   | Library list                              |
| `/dashboard/myLibrary/[id]` | Auth   | Series + episode tracking                 |
| `/dashboard/movie/[id]`     | Auth   | Movie in library                          |
| `/admin`                    | Admin  | Users, featured, stats, health, backup    |

---

## TMDB integration

Proxied under `/api/tmdb/*` (and public popular endpoints):

- Search: `type=multi` \| `tv` \| `movie`
- Popular: `type=all` \| `tv` \| `movie` (paginated; returns `totalPages`)
- Details: `/api/tmdb/tv/[id]`, `/api/tmdb/movie/[id]` (cast, trailers, seasons, etc.)

Images use `https://image.tmdb.org/t/p/...`. Configure `images.remotePatterns` in `next.config` for TMDB (and YouTube thumbs if trailers use `next/image`).

---

## Auth notes

- Credentials provider via NextAuth v5
- Middleware guards `/dashboard/*` and `/admin/*`
- Banned / inactive users redirected away from the dashboard
- Login uses `callbackUrl` / `next`; signup forwards the same into login after registration
- Prefer internal paths only (`safeRedirectPath`) — no open redirects

---

## Theme

- Tailwind `darkMode: "class"`
- Inline script on `<html>` applies saved theme before paint (no flash)
- `ThemeToggle` in public navbar and dashboard topnav
- Preference stored in `localStorage` key `theme` (`light` \| `dark`)

---

## Deploy (Vercel)

1. Import the GitHub repo into Vercel
2. Set all environment variables (use production `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`)
3. Attach Neon/Postgres
4. Deploy

Ensure the TMDB key is set in production or Discover/explore will fail.

---

## License

Private / all rights reserved unless you add a license file.

---

## Credits

- [TMDB](https://www.themoviedb.org/) — metadata and images (this product uses the TMDB API but is not endorsed or certified by TMDB)
- Next.js, NextAuth, Neon, Tailwind CSS, Heroicons
