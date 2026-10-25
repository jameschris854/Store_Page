create table if not exists private.offer_admin_conversations (
  conversation_id uuid primary key,
  messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(messages) = 'array'),
  updated_at timestamptz not null default now()
);

revoke all on private.offer_admin_conversations
  from public, anon, authenticated;
grant select, insert, update, delete
  on private.offer_admin_conversations to service_role;

create or replace function public.offer_admin_get_conversation(
  p_conversation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_messages jsonb;
begin
  delete from private.offer_admin_conversations
   where updated_at < now() - interval '30 days';

  select messages
    into v_messages
    from private.offer_admin_conversations
   where conversation_id = p_conversation_id
     and updated_at >= now() - interval '24 hours';

  return coalesce(v_messages, '[]'::jsonb);
end;
$$;

create or replace function public.offer_admin_append_conversation(
  p_conversation_id uuid,
  p_user_message text,
  p_assistant_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_messages jsonb;
begin
  if p_user_message is null
     or length(p_user_message) = 0
     or length(p_user_message) > 2000
     or p_assistant_message is null
     or length(p_assistant_message) = 0
     or length(p_assistant_message) > 5000 then
    raise exception 'Invalid conversation message';
  end if;

  delete from private.offer_admin_conversations
   where updated_at < now() - interval '30 days';

  insert into private.offer_admin_conversations (conversation_id)
  values (p_conversation_id)
  on conflict (conversation_id) do nothing;

  select messages
    into v_messages
    from private.offer_admin_conversations
   where conversation_id = p_conversation_id
   for update;

  v_messages := coalesce(v_messages, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object('role', 'user', 'content', p_user_message),
    jsonb_build_object(
      'role',
      'assistant',
      'content',
      regexp_replace(
        p_assistant_message,
        'CONFIRM [A-Za-z0-9_-]+',
        'CONFIRM [code omitted]',
        'g'
      )
    )
  );

  select coalesce(jsonb_agg(message order by ordinal), '[]'::jsonb)
    into v_messages
    from jsonb_array_elements(v_messages) with ordinality as messages(message, ordinal)
   where ordinal > jsonb_array_length(v_messages) - 8;

  update private.offer_admin_conversations
     set messages = v_messages,
         updated_at = now()
   where conversation_id = p_conversation_id;

  return v_messages;
end;
$$;

revoke all on function public.offer_admin_get_conversation(uuid)
  from public, anon, authenticated;
revoke all on function public.offer_admin_append_conversation(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.offer_admin_get_conversation(uuid)
  to service_role;
grant execute on function public.offer_admin_append_conversation(uuid, text, text)
  to service_role;
