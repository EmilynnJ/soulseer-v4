-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null unique,
  display_name    text not null,
  role            text not null check (role in ('client','reader','admin')) default 'client',
  avatar_url      text,
  balance_cents   integer not null default 0 check (balance_cents >= 0),
  bio             text,
  is_online       boolean not null default false,
  created_at      timestamptz not null default now()
);

-- READER PROFILES
create table if not exists public.reader_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references public.users(id) on delete cascade,
  specialties         text[] not null default '{}',
  chat_rate_cents     integer not null default 300,
  voice_rate_cents    integer not null default 500,
  video_rate_cents    integer not null default 700,
  rating_avg          numeric(3,2) not null default 0,
  rating_count        integer not null default 0,
  created_at          timestamptz not null default now()
);

-- READINGS
create table if not exists public.readings (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references public.users(id),
  reader_id             uuid not null references public.users(id),
  type                  text not null check (type in ('chat','voice','video')),
  status                text not null default 'pending',
  started_at            timestamptz,
  ended_at              timestamptz,
  duration_seconds      integer not null default 0,
  rate_cents_per_min    integer not null,
  total_charged_cents   integer not null default 0,
  reader_earned_cents   integer not null default 0,
  platform_fee_cents    integer not null default 0,
  transcript            jsonb,
  client_rating         integer check (client_rating between 1 and 5),
  client_review         text,
  cf_room_name          text,
  last_tick_at          timestamptz,
  grace_ends_at         timestamptz,
  created_at            timestamptz not null default now()
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references public.users(id),
  type                      text not null,
  amount_cents              integer not null,
  reading_id                uuid references public.readings(id),
  stripe_payment_intent_id  text,
  note                      text,
  created_at                timestamptz not null default now()
);

-- FORUM POSTS
create table if not exists public.forum_posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.users(id),
  title       text not null,
  body        text not null,
  pinned      boolean not null default false,
  deleted     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- FORUM REPLIES
create table if not exists public.forum_replies (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.forum_posts(id) on delete cascade,
  author_id   uuid not null references public.users(id),
  body        text not null,
  deleted     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.reader_profiles enable row level security;
alter table public.readings enable row level security;
alter table public.transactions enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;

create policy "users_self_read" on public.users for select using (auth.uid() = id);
create policy "users_self_update" on public.users for update using (auth.uid() = id);
create policy "reader_profiles_public_read" on public.reader_profiles for select using (true);
create policy "readings_participant" on public.readings for select using (auth.uid() = client_id or auth.uid() = reader_id);
create policy "transactions_owner" on public.transactions for select using (auth.uid() = user_id);
create policy "forum_posts_public_read" on public.forum_posts for select using (deleted = false);
create policy "forum_posts_author_insert" on public.forum_posts for insert with check (auth.uid() = author_id);
create policy "forum_replies_public_read" on public.forum_replies for select using (deleted = false);
create policy "forum_replies_author_insert" on public.forum_replies for insert with check (auth.uid() = author_id);
