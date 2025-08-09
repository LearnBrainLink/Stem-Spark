-- Enforce admin-only posting in announcements channels via trigger
create or replace function public.enforce_announcements_admin_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  channel_type text;
  sender_role text;
begin
  -- Determine channel type
  select type into channel_type from public.channels where id = NEW.chat_id;

  if channel_type = 'announcements' then
    -- Determine sender role from profiles
    select role into sender_role from public.profiles where id = NEW.sender_id;

    if sender_role is null or sender_role not in ('admin', 'super_admin') then
      raise exception 'Announcements are admin-only. User % cannot post to channel %', NEW.sender_id, NEW.chat_id
        using errcode = '42501';
    end if;
  end if;

  return NEW;
end;
$$;

-- Create trigger (idempotent)
drop trigger if exists trg_enforce_announcements_admin_only on public.messages;
create trigger trg_enforce_announcements_admin_only
before insert on public.messages
for each row
execute function public.enforce_announcements_admin_only();


