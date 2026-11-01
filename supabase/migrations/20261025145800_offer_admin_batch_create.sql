alter table private.offer_admin_pending_actions
  drop constraint if exists offer_admin_pending_actions_action_check;

alter table private.offer_admin_pending_actions
  add constraint offer_admin_pending_actions_action_check
  check (action->>'operation' in ('create', 'update', 'delete'));

alter function public.offer_admin_confirm_action(text, uuid, uuid, text)
  rename to offer_admin_confirm_action_before_batch_create;

create or replace function public.offer_admin_confirm_action(
  p_sender_id text,
  p_request_id uuid,
  p_lease_token uuid,
  p_confirmation_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action jsonb;
  v_pending private.offer_admin_pending_actions%rowtype;
  v_offer jsonb;
  v_result jsonb;
  v_created_ids bigint[] := '{}';
  v_fields text[] := '{}';
  v_offer_id bigint;
  v_offer_count integer;
begin
  select action
    into v_action
    from private.offer_admin_pending_actions
   where sender_id = p_sender_id
     and confirmation_hash = p_confirmation_hash;

  if not found
     or v_action->>'operation' <> 'create'
     or not (v_action ? 'offers') then
    return public.offer_admin_confirm_action_before_batch_create(
      p_sender_id,
      p_request_id,
      p_lease_token,
      p_confirmation_hash
    );
  end if;

  perform 1
    from private.offer_admin_requests
   where sender_id = p_sender_id
     and request_id = p_request_id
     and lease_token = p_lease_token
     and status = 'processing'
     and lease_expires_at > now()
   for update;
  if not found then
    raise exception 'Offer admin request lease is invalid or expired';
  end if;

  select *
    into v_pending
    from private.offer_admin_pending_actions
   where sender_id = p_sender_id
     and confirmation_hash = p_confirmation_hash
   for update;

  if not found then
    v_result := jsonb_build_object(
      'status', 'not_applied',
      'message', 'Confirmation is invalid, expired, or already used.'
    );
  elsif v_pending.status = 'expired' or v_pending.expires_at <= now() then
    update private.offer_admin_pending_actions
       set status = 'expired'
     where id = v_pending.id;
    v_result := jsonb_build_object(
      'status', 'expired',
      'message', 'This confirmation expired. Submit the request again.'
    );
  elsif v_pending.status <> 'pending' then
    v_result := jsonb_build_object(
      'status', 'not_applied',
      'message', 'Confirmation is invalid, expired, or already used.'
    );
  else
    if jsonb_typeof(v_pending.action->'offers') <> 'array' then
      raise exception 'Invalid batch create proposal';
    end if;

    v_offer_count := jsonb_array_length(v_pending.action->'offers');
    if v_offer_count < 2 or v_offer_count > 25 then
      raise exception 'Invalid batch create size';
    end if;

    for v_offer in
      select value
        from jsonb_array_elements(v_pending.action->'offers')
    loop
      if jsonb_typeof(v_offer) <> 'object'
         or jsonb_typeof(v_offer->'title') <> 'string'
         or length(btrim(v_offer->>'title')) = 0
         or length(btrim(v_offer->>'title')) > 120
         or jsonb_typeof(v_offer->'description') is distinct from 'string'
              and jsonb_typeof(v_offer->'description') is distinct from 'null'
         or not (v_offer ? 'description')
         or length(v_offer->>'description') > 2000
         or jsonb_typeof(v_offer->'expiresAt') is distinct from 'string'
              and jsonb_typeof(v_offer->'expiresAt') is distinct from 'null'
         or not (v_offer ? 'expiresAt') then
        raise exception 'Invalid offer in batch create proposal';
      end if;

      if v_offer->'expiresAt' <> 'null'::jsonb
         and (v_offer->>'expiresAt')::timestamptz <= now() then
        raise exception 'Batch offer expiry must be in the future';
      end if;

      insert into public."Offers" (title, description, "expiresAt")
      values (
        btrim(v_offer->>'title'),
        case
          when v_offer->'description' = 'null'::jsonb then null
          else btrim(v_offer->>'description')
        end,
        case
          when v_offer->'expiresAt' = 'null'::jsonb then null
          else (v_offer->>'expiresAt')::timestamptz
        end
      )
      returning id into v_offer_id;
      v_created_ids := array_append(v_created_ids, v_offer_id);
      v_fields := array_append(v_fields, 'offer_id:' || v_offer_id::text);
    end loop;

    update private.offer_admin_pending_actions
       set status = 'confirmed',
           confirmed_at = now()
     where id = v_pending.id;

    insert into private.offer_admin_audit (
      sender_id,
      request_id,
      operation,
      offer_id,
      changed_fields
    )
    values (
      p_sender_id,
      p_request_id,
      'create',
      null,
      array_append(v_fields, 'created_count:' || v_offer_count::text)
    );

    v_result := jsonb_build_object(
      'status', 'applied',
      'operation', 'create',
      'offerId', null,
      'createdCount', v_offer_count,
      'offerIds', to_jsonb(v_created_ids)
    );
  end if;

  update private.offer_admin_requests
     set status = 'done',
         response = v_result,
         completed_at = now(),
         lease_expires_at = now()
   where sender_id = p_sender_id
     and request_id = p_request_id
     and lease_token = p_lease_token
     and status = 'processing';

  if not found then
    raise exception 'Offer admin request lease was lost';
  end if;

  return v_result;
end;
$$;

revoke all on function public.offer_admin_confirm_action(text, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.offer_admin_confirm_action(text, uuid, uuid, text)
  to service_role;
