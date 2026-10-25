drop function if exists public.offer_admin_claim_request(text, uuid);
drop function if exists public.offer_admin_finish_request(text, uuid, uuid, jsonb);
drop function if exists public.offer_admin_stage_action(
  text,
  uuid,
  uuid,
  text,
  jsonb,
  jsonb,
  timestamptz,
  jsonb
);
drop function if exists public.offer_admin_confirm_action(text, uuid, uuid, text);
drop function if exists public.offer_admin_confirm_action_before_batch_create(
  text,
  uuid,
  uuid,
  text
);
drop function if exists public.offer_admin_confirm_latest_action(text, uuid, uuid);
drop function if exists public.offer_admin_get_conversation(uuid);
drop function if exists public.offer_admin_append_conversation(uuid, text, text);
drop function if exists public.offer_admin_reset_local_conversation(uuid, text);

drop table if exists private.offer_admin_requests;
drop table if exists private.offer_admin_pending_actions;
drop table if exists private.offer_admin_audit;
drop table if exists private.offer_admin_conversations;
