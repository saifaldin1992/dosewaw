-- DOSEWAW 0003: review stamp and error reports. Runs after core_test.sql (same database).
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', coalesce(u::text,''), false); end $$;
create or replace function pg_temp.expect_error(q text, msg text) returns void language plpgsql as $$
begin begin execute q; exception when others then raise notice 'ok  refused: % -> %', msg, sqlerrm; return; end; raise exception 'FAIL not refused: %', msg; end $$;

-- visitors send reports; bad ones are refused; visitors cannot read them
set role anon; select pg_temp.as_user(null);
select public.submit_report('d/amox', 'الجرعة في السطر الثاني تختلف عن النشرة', 'ar');
select pg_temp.expect_error($$select public.submit_report('d/amox', 'x', 'ar')$$, 'report too short');
select pg_temp.expect_error($$select public.submit_report('d/amox', 'bad <script> text', 'ar')$$, 'report with < or >');
select pg_temp.expect_error($$select public.submit_report('http://evil', 'a normal message', 'ar')$$, 'report with a strange page');
select pg_temp.expect_error($$select * from public.reports$$, 'visitor reading reports');
select pg_temp.expect_error($$select public.report_done(1)$$, 'visitor closing a report');
-- a flood stops itself
reset role;
insert into public.reports(page, msg) select 'd/amox', 'flood test message' from generate_series(1, 60);
set role anon;
select pg_temp.expect_error($$select public.submit_report('d/amox', 'one more message', 'ar')$$, 'more than 60 reports in 10 minutes');
reset role; delete from public.reports where msg = 'flood test message';

-- the owner reads and closes reports; a published drug change carries the review stamp
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-000000000001');
do $$ begin assert (select count(*) from public.reports) = 1, 'owner reads the report'; end $$;
select public.report_done((select min(id) from public.reports));
do $$ begin assert (select status from public.reports limit 1) = 'done', 'report closed'; end $$;
select public.submit_change('drug', 'amox', '{"timing":{"ar":"مع الطعام","en":"with food"}}', 'label 2.1');
select public.publish_site('review stamp');
do $$ declare r jsonb := (select data->'antibiotics'->0->'rev' from public.published); begin
  assert r->>'at' = to_char(now(), 'YYYY-MM-DD'), 'review date = approval date';
  assert r->'by'->>'ar' = 'Owner', 'reviewer = the approving member';
end $$;
reset role;
select 'ALL REPORT CHECKS PASSED' as result;
