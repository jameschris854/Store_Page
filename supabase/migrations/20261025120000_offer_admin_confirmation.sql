create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.offer_admin_requests (
  sender_id text not null,
  request_id uuid not null,
  status text not null default 'processing'
    check (status in ('processing', 'done')),
  lease_token uuid not null,
  lease_expires_at timestamptz not null,
  response jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (sender_id, request_id)
);

create table if not exists private.offer_admin_pending_actions (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null,
  request_id uuid not null,
  confirmation_hash text not null unique,
  action jsonb not null,
  target_snapshot jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'expired', 'stale')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (sender_id, request_id),
  check (action->>'operation' in ('create', 'update', 'delete'))
);

create index if not exists offer_admin_pending_sender_expiry_idx
  on private.offer_admin_pending_actions (sender_id, expires_at)
  where status = 'pending';

create table if not exists private.offer_admin_audit (
  id bigint generated always as identity primary key,
  sender_id text not null,
  request_id uuid not null,
  operation text not null check (operation in ('create', 'update', 'delete')),
  offer_id bigint,
  changed_fields text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (sender_id, request_id)
);

revoke all on all tables in schema private from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema private to service_role;
grant usage, select on all sequences in schema private to service_role;

create or replace function public.offer_admin_claim_request(
  p_sender_id text,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request private.offer_admin_requests%rowtype;
  v_token uuid := gen_random_uuid();
begin
  delete from private.offer_admin_requests
  where status = 'done'
    and completed_at < now() - interval '30 days';

  update private.offer_admin_pending_actions
     set status = 'expired'
   where status = 'pending'
     and expires_at <= now();

  delete from private.offer_admin_pending_actions
  where status <> 'pending'
    and created_at < now() - interval '30 days';

  insert into private.offer_admin_requests (
    sender_id,
    request_id,
    lease_token,
    lease_expires_at
  )
  values (p_sender_id, p_request_id, v_token, now() + interval '3 minutes')
  on conflict (sender_id, request_id) do nothing;

  if found then
    return jsonb_build_object('status', 'claimed', 'leaseToken', v_token);
  end if;

  select *
    into v_request
    from private.offer_admin_requests
   where sender_id = p_sender_id
     and request_id = p_request_id
   for update;

  if v_request.status = 'done' then
    return jsonb_build_object(
      'status', 'done',
      'response', v_request.response
    );
  end if;

  if v_request.lease_expires_at <= now() then
    update private.offer_admin_requests
       set lease_token = v_token,
           lease_expires_at = now() + interval '3 minutes'
     where sender_id = p_sender_id
       and request_id = p_request_id;
    return jsonb_build_object('status', 'claimed', 'leaseToken', v_token);
  end if;

  return jsonb_build_object('status', 'processing');
end;
$$;

create or replace function public.offer_admin_finish_request(
  p_sender_id text,
  p_request_id uuid,
  p_lease_token uuid,
  p_response jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.offer_admin_requests
     set status = 'done',
         response = p_response,
         completed_at = now(),
         lease_expires_at = now()
   where sender_id = p_sender_id
     and request_id = p_request_id
     and lease_token = p_lease_token
     and status = 'processing';
  return found;
end;
$$;

create or replace function public.offer_admin_stage_action(
  p_sender_id text,
  p_request_id uuid,
  p_lease_token uuid,
  p_confirmation_hash text,
  p_action jsonb,
  p_snapshot jsonb,
  p_expires_at timestamptz,
  p_response jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if jsonb_typeof(p_action) <> 'object'
     or p_action->>'operation' is null
     or p_action->>'operation' not in ('create', 'update', 'delete')
     or p_expires_at <= now()
     or (p_action->>'operation' in ('update', 'delete') and p_snapshot is null)
     or (p_action->>'operation' = 'create' and p_snapshot is not null) then
    raise exception 'Invalid pending offer action';
  end if;

  insert into private.offer_admin_pending_actions (
    sender_id,
    request_id,
    confirmation_hash,
    action,
    target_snapshot,
    expires_at
  )
  select
    p_sender_id,
    p_request_id,
    p_confirmation_hash,
    p_action,
    p_snapshot,
    p_expires_at
  from private.offer_admin_requests
  where sender_id = p_sender_id
    and request_id = p_request_id
    and lease_token = p_lease_token
    and status = 'processing'
    and lease_expires_at > now();

  if not found then
    return false;
  end if;

  update private.offer_admin_requests
     set status = 'done',
         response = p_response,
         completed_at = now(),
         lease_expires_at = now()
   where sender_id = p_sender_id
     and request_id = p_request_id
     and lease_token = p_lease_token
     and status = 'processing';

  return found;
end;
$$;

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
  v_pending private.offer_admin_pending_actions%rowtype;
  v_offer public."Offers"%rowtype;
  v_result jsonb;
  v_operation text;
  v_offer_id bigint;
  v_fields text[] := '{}';
begin
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
    v_operation := v_pending.action->>'operation';

    if v_operation in ('update', 'delete') then
      select *
        into v_offer
        from public."Offers"
       where id = (v_pending.action->>'targetOfferId')::bigint
       for update;

      if not found
         or v_pending.target_snapshot->>'title' is distinct from v_offer.title
         or v_pending.target_snapshot->>'description' is distinct from v_offer.description
         or (v_pending.target_snapshot->>'expiresAt')::timestamptz
              is distinct from v_offer."expiresAt" then
        update private.offer_admin_pending_actions
           set status = 'stale'
         where id = v_pending.id;
        v_result := jsonb_build_object(
          'status', 'stale',
          'message', 'The offer changed since the proposal. Submit the request again.'
        );
      end if;
    end if;

    if v_result is null then
      if v_operation = 'create' then
        insert into public."Offers" (title, description, "expiresAt")
        values (
          v_pending.action->>'title',
          case
            when v_pending.action->'description' = 'null'::jsonb then null
            else v_pending.action->>'description'
          end,
          case
            when v_pending.action->'expiresAt' = 'null'::jsonb then null
            else (v_pending.action->>'expiresAt')::timestamptz
          end
        )
        returning id into v_offer_id;
        v_fields := array['title', 'description', 'expiresAt'];
      elsif v_operation = 'update' then
        if (v_pending.action->'fieldsToUpdate') ? 'title' then
          v_fields := array_append(v_fields, 'title');
        end if;
        if (v_pending.action->'fieldsToUpdate') ? 'description' then
          v_fields := array_append(v_fields, 'description');
        end if;
        if (v_pending.action->'fieldsToUpdate') ? 'expiresAt' then
          v_fields := array_append(v_fields, 'expiresAt');
        end if;

        update public."Offers"
           set title = case
                 when (v_pending.action->'fieldsToUpdate') ? 'title'
                   then v_pending.action->>'title'
                 else title
               end,
               description = case
                 when (v_pending.action->'fieldsToUpdate') ? 'description'
                   and v_pending.action->'description' = 'null'::jsonb then null
                 when (v_pending.action->'fieldsToUpdate') ? 'description'
                   then v_pending.action->>'description'
                 else description
               end,
               "expiresAt" = case
                 when (v_pending.action->'fieldsToUpdate') ? 'expiresAt'
                   and v_pending.action->'expiresAt' = 'null'::jsonb then null
                 when (v_pending.action->'fieldsToUpdate') ? 'expiresAt'
                   then (v_pending.action->>'expiresAt')::timestamptz
                 else "expiresAt"
               end
         where id = (v_pending.action->>'targetOfferId')::bigint;
        v_offer_id := (v_pending.action->>'targetOfferId')::bigint;
      elsif v_operation = 'delete' then
        delete from public."Offers"
         where id = (v_pending.action->>'targetOfferId')::bigint;
        v_offer_id := (v_pending.action->>'targetOfferId')::bigint;
      else
        raise exception 'Unsupported offer action';
      end if;

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
        v_operation,
        v_offer_id,
        v_fields
      );

      v_result := jsonb_build_object(
        'status', 'applied',
        'operation', v_operation,
        'offerId', v_offer_id
      );
    end if;
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

revoke all on function public.offer_admin_claim_request(text, uuid)
  from public, anon, authenticated;
revoke all on function public.offer_admin_finish_request(text, uuid, uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.offer_admin_stage_action(text, uuid, uuid, text, jsonb, jsonb, timestamptz, jsonb)
  from public, anon, authenticated;
revoke all on function public.offer_admin_confirm_action(text, uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.offer_admin_claim_request(text, uuid)
  to service_role;
grant execute on function public.offer_admin_finish_request(text, uuid, uuid, jsonb)
  to service_role;
grant execute on function public.offer_admin_stage_action(text, uuid, uuid, text, jsonb, jsonb, timestamptz, jsonb)
  to service_role;
grant execute on function public.offer_admin_confirm_action(text, uuid, uuid, text)
  to service_role;
