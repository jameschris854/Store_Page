create or replace function public.offer_admin_reset_local_conversation(
  p_conversation_id uuid,
  p_sender_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_sender_id <> 'local-postman' then
    raise exception 'Invalid local test sender';
  end if;

  delete from private.offer_admin_conversations
   where conversation_id = p_conversation_id;

  update private.offer_admin_pending_actions
     set status = 'expired'
   where sender_id = p_sender_id
     and status = 'pending';

  return true;
end;
$$;

revoke all on function public.offer_admin_reset_local_conversation(uuid, text)
  from public, anon, authenticated;
grant execute on function public.offer_admin_reset_local_conversation(uuid, text)
  to service_role;
