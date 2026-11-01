select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  p.policyname,
  p.cmd as policy_command,
  p.roles,
  p.qual as using_expression
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.schemaname = n.nspname
  and p.tablename = c.relname
where n.nspname = 'public'
  and c.relname = 'Offers';