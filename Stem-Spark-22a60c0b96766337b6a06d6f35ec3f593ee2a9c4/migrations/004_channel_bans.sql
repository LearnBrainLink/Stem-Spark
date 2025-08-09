-- Channel bans table to support per-channel banning
create table if not exists public.channel_bans (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  banned_by uuid not null references public.profiles(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  expires_at timestamptz null,
  constraint channel_bans_unique unique (channel_id, user_id)
);

-- Helpful index for checks
create index if not exists idx_channel_bans_channel_user on public.channel_bans(channel_id, user_id);


