-- Enable RLS
alter table public.channel_bans enable row level security;

-- Allow service role (server) to manage without restriction via service key
-- Client-side policies

-- Select: channel managers only (channel creator or admins) can view
create policy if not exists channel_bans_select on public.channel_bans
for select using (
  exists (
    select 1 from public.channels c
    join public.profiles p on p.id = auth.uid()
    where c.id = channel_bans.channel_id
      and (
        c.created_by = auth.uid()
        or p.role in ('admin','super_admin')
      )
  )
);

-- Insert: only channel creator or admins
create policy if not exists channel_bans_insert on public.channel_bans
for insert with check (
  exists (
    select 1 from public.channels c
    join public.profiles p on p.id = auth.uid()
    where c.id = channel_bans.channel_id
      and (
        c.created_by = auth.uid()
        or p.role in ('admin','super_admin')
      )
  )
);

-- Delete: only channel creator or admins
create policy if not exists channel_bans_delete on public.channel_bans
for delete using (
  exists (
    select 1 from public.channels c
    join public.profiles p on p.id = auth.uid()
    where c.id = channel_bans.channel_id
      and (
        c.created_by = auth.uid()
        or p.role in ('admin','super_admin')
      )
  )
);


