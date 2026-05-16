
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text,
  ip text,
  referred_by text,
  created_at timestamptz not null default now()
);

create type public.payment_plan as enum ('reset','premium');
create type public.payment_status as enum ('pending','success','failed');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reference text unique not null,
  amount integer not null,
  plan public.payment_plan not null,
  status public.payment_status not null default 'pending',
  paystack_event_id text unique,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
create index on public.payments(user_id);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_code text not null,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  credited boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event text not null,
  meta jsonb not null default '{}'::jsonb,
  ip text,
  created_at timestamptz not null default now()
);
create index on public.analytics(event);

create table public.rate_limits (
  ip text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

alter table public.users enable row level security;
alter table public.payments enable row level security;
alter table public.referrals enable row level security;
alter table public.analytics enable row level security;
alter table public.rate_limits enable row level security;
