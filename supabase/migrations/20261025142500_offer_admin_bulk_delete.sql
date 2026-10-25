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
  v_requested_ids bigint[];
  v_snapshot_ids bigint[];
  v_deleted_ids bigint[];
  v_snapshot_count integer;
  v_current_count integer;
  v_deleted_count integer;
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

    if v_operation = 'update'
       or (v_operation = 'delete' and not (v_pending.action ? 'targetOfferIds')) then
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
    elsif v_operation = 'delete' then
      if jsonb_typeof(v_pending.action->'targetOfferIds') <> 'array'
         or jsonb_typeof(v_pending.target_snapshot) <> 'array' then
        raise exception 'Invalid bulk delete proposal';
      end if;

      v_snapshot_count := jsonb_array_length(v_pending.target_snapshot);
      if v_snapshot_count = 0 or v_snapshot_count > 100 then
        raise exception 'Invalid bulk delete proposal size';
      end if;

      select array_agg(value::bigint order by value::bigint)
        into v_requested_ids
        from jsonb_array_elements_text(
          v_pending.action->'targetOfferIds'
        ) as requested(value);
      select array_agg((item->>'id')::bigint order by (item->>'id')::bigint)
        into v_snapshot_ids
        from jsonb_array_elements(v_pending.target_snapshot) as snapshot(item);

      if cardinality(v_requested_ids) <> v_snapshot_count
         or cardinality(v_snapshot_ids) <> v_snapshot_count
         or v_requested_ids is distinct from v_snapshot_ids then
        raise exception 'Invalid bulk delete target set';
      end if;

      lock table public."Offers" in share row exclusive mode;

      select count(*)::integer
        into v_current_count
        from public."Offers";

      if v_current_count <> v_snapshot_count
         or exists (
           select 1
             from jsonb_array_elements(v_pending.target_snapshot) as snapshot(item)
             left join public."Offers" as offer
               on offer.id = (snapshot.item->>'id')::bigint
            where offer.id is null
               or snapshot.item->>'title' is distinct from offer.title
               or snapshot.item->>'description' is distinct from offer.description
               or (snapshot.item->>'expiresAt')::timestamptz
                    is distinct from offer."expiresAt"
         ) then
        update private.offer_admin_pending_actions
           set status = 'stale'
         where id = v_pending.id;
        v_result := jsonb_build_object(
          'status', 'stale',
          'message', 'The offers changed since the proposal. Submit the request again.'
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
      elsif v_operation = 'delete' and v_pending.action ? 'targetOfferIds' then
        with deleted as (
          delete from public."Offers"
           where id = any(v_requested_ids)
          returning id
        )
        select array_agg(id order by id), count(*)::integer
          into v_deleted_ids, v_deleted_count
          from deleted;

        v_fields := array(
          select 'offer_id:' || deleted_id::text
            from unnest(v_deleted_ids) as deleted(deleted_id)
           order by deleted_id
        );
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

      if v_operation = 'delete' and v_pending.action ? 'targetOfferIds' then
        v_result := jsonb_build_object(
          'status', 'applied',
          'operation', v_operation,
          'offerId', null,
          'deletedCount', v_deleted_count,
          'offerIds', to_jsonb(v_deleted_ids)
        );
      else
        v_result := jsonb_build_object(
          'status', 'applied',
          'operation', v_operation,
          'offerId', v_offer_id
        );
      end if;
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
