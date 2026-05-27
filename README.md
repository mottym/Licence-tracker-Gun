# Gun Licence Tracker

Track firearm licence renewal timelines across all states.

## Features

- Email/password and Google sign-in with Supabase Auth
- Admin panel to manage state groups and state-level expiry rules
- User dashboard to add licences, mark renewals, and view status
- Email and browser push reminder notifications
- Daily cron endpoint for automated reminder delivery

## Tech stack

- Next.js App Router + TypeScript + Tailwind
- Supabase Postgres + RLS + Auth
- Resend for email notifications
- Web Push API (`web-push`) for browser notifications

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill values:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
CRON_SECRET=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

3. Apply SQL migration in Supabase:

- Run the SQL from `/supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.

4. Run locally:

```bash
npm run dev
```

## Cron reminders

The reminder endpoint is:

`GET /api/cron/reminders`

It requires the header:

`Authorization: Bearer <CRON_SECRET>`

`vercel.json` includes a daily cron schedule.
