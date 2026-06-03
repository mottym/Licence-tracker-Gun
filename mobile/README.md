# Licence Tracker — Android app

An Expo (React Native) app that lets end users manage their gun licences and
gun courses, see status / upcoming renewals, attach licence photos, and
receive renewal-reminder push notifications.

Admin features (user management, taxonomy editing, state rules, etc.) are
**not** part of this app and remain on the web dashboard.

The mobile app shares the same Supabase project as the web app — RLS policies
already in place keep each user limited to their own records.

---

## 1. Prerequisites

- Node.js 20.19.4 or newer (required by RN 0.85 / Expo SDK 56)
- An Android phone with the latest **Expo Go** app for dev (or an Android emulator)
- The same Supabase project the web app uses

## 2. Configure environment

```bash
cd mobile
cp .env.example .env
```

Fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

These are read at build time and exposed to the client (this is fine — they
are the same public keys the web app already exposes).

`EAS_PROJECT_ID` is required for real builds and for getting Expo push
tokens, but not for first-time local dev. Add it once you've run
`eas init` (step 6).

## 3. Apply the database migration

Run the new migration on your Supabase project so we have a place to store
mobile push tokens:

```bash
# From the repo root, using the Supabase CLI:
supabase db push
# or apply supabase/migrations/008_expo_push_tokens.sql manually
```

## 4. Install dependencies

```bash
cd mobile
npm install
```

## 5. Run in dev

```bash
npm start
```

Scan the QR with Expo Go on your phone. You can also press `a` to launch an
Android emulator if you have one configured.

## 6. Production-style builds (EAS)

You'll use [Expo Application Services](https://expo.dev/eas) to make signed
Android binaries. EAS does the keystore management for you.

```bash
npm install -g eas-cli
eas login
eas init      # creates the Expo project, populates EAS_PROJECT_ID
eas build:configure
eas build --platform android --profile preview   # produces an .apk you can sideload
eas build --platform android --profile production # produces an .aab for the Play Store
```

After `eas init`, copy the generated project ID into `mobile/.env`
(`EAS_PROJECT_ID=...`) so `expo-notifications` can fetch the production push
token.

## 7. Push notifications

Once a user signs in on the mobile app, `src/lib/push.ts` registers an Expo
push token in the new `expo_push_tokens` table on Supabase.

To actually send pushes from your existing cron route
(`/api/cron/reminders`), extend it to also query `expo_push_tokens` and POST
to Expo's push API (`https://exp.host/--/api/v2/push/send`). Web Push and
Expo Push live side-by-side — web browser users keep getting the existing
web-push payloads, mobile users get Expo pushes.

A minimal Node helper (drop into `src/lib/notifications/expo-push.ts` on the
web side):

```ts
import type { Database } from "@/types/database";

interface ExpoPushMessage {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

export async function sendExpoPush(messages: ExpoPushMessage[]) {
  if (!messages.length) return;
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });
}
```

## 8. Project layout

```
mobile/
├── app/                  Expo Router file-based routes
│   ├── _layout.tsx       PaperProvider + auth gating
│   ├── (auth)/           login + signup
│   └── (tabs)/           Overview · Licences · Courses · Profile
├── src/
│   ├── components/       Reusable UI pieces
│   ├── lib/              supabase client, auth, data, status, push, theme
│   └── types/database.ts Shared Supabase row types
├── assets/               App icons + splash
├── app.config.ts         Expo config
└── package.json
```

## 9. Conventions

- **No admin UI**. We deliberately do not surface anything from the web
  admin sections. Admins keep using the website.
- **No server actions**. The mobile client talks to Supabase directly. RLS
  policies (already in place from the web app's migrations) enforce per-user
  isolation.
- **State derivation**: when creating or editing a gun licence, the mobile
  app sends a `jurisdiction_id` and the data layer looks up the linked
  `state_id`. This matches the recent web change so the two clients stay
  consistent.
- **TypeScript strict mode**. Run `npm run type-check` before pushing.
