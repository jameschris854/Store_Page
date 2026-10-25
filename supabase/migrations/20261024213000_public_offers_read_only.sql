alter table public."Offers" enable row level security;

revoke all on table public."Offers" from anon, authenticated;
grant select on table public."Offers" to anon, authenticated;

revoke all on sequence public."Offers_id_seq" from anon, authenticated;

drop policy if exists "Anyone can read offers" on public."Offers";
create policy "Anyone can read offers"
  on public."Offers"
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Offer admins can create offers" on public."Offers";
drop policy if exists "Offer admins can update offers" on public."Offers";
drop policy if exists "Offer admins can delete offers" on public."Offers";
