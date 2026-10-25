create schema if not exists private;

create table if not exists private.whatsapp_inbound_messages (
  message_id text primary key,
  sender_id text not null,
  received_at timestamptz not null default now(),
  check (length(message_id) between 1 and 255),
  check (length(sender_id) between 1 and 32)
);

revoke all on private.whatsapp_inbound_messages
  from public, anon, authenticated;

create or replace function public.whatsapp_claim_inbound_message(
  p_message_id text,
  p_sender_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if p_message_id is null
     or length(p_message_id) not between 1 and 255
     or p_sender_id is null
     or length(p_sender_id) not between 1 and 32 then
    raise exception 'Invalid WhatsApp message metadata';
  end if;

  delete from private.whatsapp_inbound_messages
   where received_at < now() - interval '30 days';

  insert into private.whatsapp_inbound_messages (message_id, sender_id)
  values (p_message_id, p_sender_id)
  on conflict (message_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

create or replace function public.whatsapp_release_inbound_message(
  p_message_id text
)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from private.whatsapp_inbound_messages
   where message_id = p_message_id;
$$;

revoke all on function public.whatsapp_claim_inbound_message(text, text)
  from public, anon, authenticated;
revoke all on function public.whatsapp_release_inbound_message(text)
  from public, anon, authenticated;
grant execute on function public.whatsapp_claim_inbound_message(text, text)
  to service_role;
grant execute on function public.whatsapp_release_inbound_message(text)
  to service_role;
