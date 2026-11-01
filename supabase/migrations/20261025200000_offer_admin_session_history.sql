create table if not exists public.offer_admin_turns (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_message text not null,
  assistant_message text not null,
  created_at timestamptz not null default now(),
  check (length(user_message) between 1 and 2000),
  check (length(assistant_message) between 1 and 5000)
);

create index if not exists offer_admin_turns_session_id_id_idx
  on public.offer_admin_turns (session_id, id desc);

alter table public.offer_admin_turns enable row level security;
revoke all on public.offer_admin_turns from public, anon, authenticated;
grant select on public.offer_admin_turns to service_role;
grant usage, select on sequence public.offer_admin_turns_id_seq to service_role;

create or replace function public.offer_admin_save_turn(
  p_session_id text,
  p_user_message text,
  p_assistant_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_session_id is null
     or length(p_session_id) = 0
     or length(p_session_id) > 100
     or p_user_message is null
     or length(p_user_message) = 0
     or length(p_user_message) > 2000
     or p_assistant_message is null
     or length(p_assistant_message) = 0
     or length(p_assistant_message) > 5000 then
    raise exception 'Invalid offer admin conversation turn';
  end if;

  insert into public.offer_admin_turns (
    session_id,
    user_message,
    assistant_message
  )
  values (
    p_session_id,
    p_user_message,
    p_assistant_message
  );

  delete from public.offer_admin_turns
   where session_id = p_session_id
     and id not in (
       select id
         from public.offer_admin_turns
        where session_id = p_session_id
        order by id desc
        limit 20
     );
end;
$$;

revoke all on function public.offer_admin_save_turn(text, text, text)
  from public, anon, authenticated;
grant execute on function public.offer_admin_save_turn(text, text, text)
  to service_role;
