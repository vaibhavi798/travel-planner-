# Phase 2 — Supabase Setup (Optional)

When you're ready to add real multi-user sharing, follow these steps.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy your project URL and anon key

## 2. Add env vars

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Database tables (SQL)

Run in Supabase SQL editor:

```sql
-- users profile (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  avatar_url text
);

-- trips
create table trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users,
  data jsonb not null,
  visibility text default 'private',
  created_at timestamptz default now()
);

-- trip members
create table trip_members (
  trip_id uuid references trips,
  user_id uuid references auth.users,
  role text default 'viewer',
  primary key (trip_id, user_id)
);

-- expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips,
  description text,
  amount numeric,
  paid_by uuid references auth.users,
  split_among uuid[],
  created_at timestamptz default now()
);
```

## 4. Edge Function for Gemini

Move Gemini calls server-side to protect your API key:

```bash
supabase functions new gemini-proxy
```

See [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions).

## 5. Migration from localStorage

On first login, import trips from `localStorage` key `wanderglobe_trips` into Supabase, then clear local storage.

## Stub client

When ready, create `src/services/supabase/client.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Install: `npm install @supabase/supabase-js`
