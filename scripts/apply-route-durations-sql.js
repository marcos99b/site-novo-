#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://','').replace(/\/$/,'');
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !API_KEY) {
  console.error('❌ Supabase URL/KEY não configurados. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const SQL = `
create table if not exists public.user_route_durations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  session_id text not null,
  page_url text not null,
  route_date date not null default current_date,
  total_seconds integer not null default 0,
  last_seen timestamptz not null default now()
);

do $$ begin
  begin
    alter table public.user_route_durations
      add constraint uq_user_route unique (session_id, page_url, route_date);
  exception when duplicate_object then null; end;
end $$;

create index if not exists idx_urd_user on public.user_route_durations (user_id);
create index if not exists idx_urd_page_date on public.user_route_durations (page_url, route_date);

alter table public.user_route_durations enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_route_durations' and policyname='urd_select'
  ) then
    create policy urd_select on public.user_route_durations for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_route_durations' and policyname='urd_insert'
  ) then
    create policy urd_insert on public.user_route_durations for insert to anon, authenticated with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_route_durations' and policyname='urd_update'
  ) then
    create policy urd_update on public.user_route_durations for update to anon, authenticated using (true);
  end if;
end $$;

create or replace function public.upsert_user_route_duration(
  p_session_id text,
  p_user_id uuid,
  p_page_url text,
  p_seconds integer
) returns void language plpgsql as $$
begin
  insert into public.user_route_durations(session_id, user_id, page_url, route_date, total_seconds, last_seen)
  values (p_session_id, p_user_id, p_page_url, current_date, greatest(0, p_seconds), now())
  on conflict (session_id, page_url, route_date)
  do update set total_seconds = public.user_route_durations.total_seconds + greatest(0, p_seconds),
                user_id = coalesce(public.user_route_durations.user_id, excluded.user_id),
                last_seen = now();
end; $$;

grant execute on function public.upsert_user_route_duration(text,uuid,text,integer) to anon, authenticated, service_role;
`;

function callExecSql(sql) {
  const options = {
    hostname: SUPABASE_URL,
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body='';
      res.on('data', (c)=> body+=c);
      res.on('end', ()=>{
        if (res.statusCode === 200) return resolve(true);
        return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

(async () => {
  try {
    console.log('🔧 Aplicando SQL de user_route_durations...');
    await callExecSql(SQL);
    console.log('✅ Tabela/Políticas/RPC aplicadas.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha ao aplicar SQL:', e.message);
    process.exit(1);
  }
})();


