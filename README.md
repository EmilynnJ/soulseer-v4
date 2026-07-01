# SoulSeer

Live pay-per-minute psychic reading platform.

## Stack

- **Client**: React + Vite + TypeScript + TailwindCSS + Zustand
- **Server**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe (customer charges + Connect payouts)
- **Realtime**: Cloudflare Realtime (WebRTC/WebSockets for sessions)
- **Monorepo**: pnpm workspaces

## Structure

```
soulseer-v4/
  apps/
    client/          # React/Vite frontend
    server/          # Express API
  packages/
    shared/          # Shared TypeScript types
```

## Pages

- `/` - Home
- `/browse` - Browse Readers
- `/profile/:readerId` - Reader Profile
- `/about` - About SoulSeer
- `/community` - Community Forum
- `/login` - Sign In
- `/signup` - Create Account (seekers only)
- `/dashboard` - User Dashboard
- `/session/:readerId` - Live Reading Session
- `/help` - Help Center

## Business Rules

- **Commission**: Readers receive 60%, platform retains 40%
- **Reader accounts**: Created by admins only (no self-registration)
- **Admin accounts**: Manually seeded
- **Grace period**: 2-minute reconnect window on disconnect
- **Roles**: `client`, `reader`, `admin` — all enforced server-side

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env files
cp apps/client/.env.example apps/client/.env.local
cp apps/server/.env.example apps/server/.env

# Run DB migrations
# Execute supabase/migrations/001_initial.sql in your Supabase SQL editor

# Start dev servers
pnpm --filter client dev
pnpm --filter server dev
```

## Seed Admin Account

In Supabase Auth dashboard, create a user manually, then in SQL editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## Notes

- The About page content should be replaced with the verbatim guide text before launch.
- NOT included in scope: live streaming, marketplace, virtual gifting, scheduled bookings, direct messaging, push notifications.
