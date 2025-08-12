-- Supabase Autorun: schema de tracking, pedidos e pagamentos
-- Execute este arquivo no SQL Editor do Supabase

-- Extensões
create extension if not exists pgcrypto;

-- =========================
-- Tabelas de Tracking
-- =========================

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  page_url text,
  timestamp timestamptz not null default now(),
  user_agent text,
  ip_address text,
  referrer text,
  duration integer,
  element_id text,
  element_class text,
  element_text text,
  coordinates jsonb,
  screen_size jsonb
);

create index if not exists idx_user_events_type_ts on public.user_events (event_type, timestamp desc);
create index if not exists idx_user_events_session on public.user_events (session_id);
create index if not exists idx_user_events_user on public.user_events (user_id);
create index if not exists idx_user_events_data_gin on public.user_events using gin (event_data);
create index if not exists idx_user_events_ts on public.user_events (timestamp desc);

alter table public.user_events enable row level security;

-- Políticas (abrir leitura e inserção a partir do client para dashboards)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_events' and policyname='ue_select_all'
  ) then
    create policy ue_select_all on public.user_events for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_events' and policyname='ue_insert_all'
  ) then
    create policy ue_insert_all on public.user_events for insert to anon, authenticated with check (true);
  end if;
end $$;

create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid null,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_views_prod on public.product_views (product_id);
create index if not exists idx_product_views_user on public.product_views (user_id);

alter table public.product_views enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_views' and policyname='pv_select_all'
  ) then
    create policy pv_select_all on public.product_views for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_views' and policyname='pv_insert_all'
  ) then
    create policy pv_insert_all on public.product_views for insert to anon, authenticated with check (true);
  end if;
end $$;

-- Sessões e resumo (opcional, usados pelo dashboard `/tracking`)
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text unique,
  user_id uuid,
  started_at timestamptz not null default now(),
  last_seen timestamptz,
  page_views integer not null default 0,
  duration_seconds integer not null default 0
);

alter table public.user_sessions enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_sessions' and policyname='us_select_all'
  ) then
    create policy us_select_all on public.user_sessions for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_sessions' and policyname='us_insert_all'
  ) then
    create policy us_insert_all on public.user_sessions for insert to anon, authenticated with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_sessions' and policyname='us_update_all'
  ) then
    create policy us_update_all on public.user_sessions for update to anon, authenticated using (true);
  end if;
end $$;

create table if not exists public.analytics_summary (
  date date primary key,
  total_events bigint not null default 0,
  total_errors bigint not null default 0,
  avg_session_duration numeric not null default 0
);

-- Trigger para manter analytics_summary atualizado
create or replace function public.refresh_analytics_summary() returns trigger language plpgsql as $$
begin
  insert into public.analytics_summary as a (date, total_events, total_errors, avg_session_duration)
  values (current_date, 1, case when new.event_type = 'error' then 1 else 0 end,
          coalesce((select avg((e.event_data->>'duration_seconds')::numeric)
                    from public.user_events e
                    where e.event_type = 'time_spent' and e.timestamp::date = current_date), 0))
  on conflict (date)
  do update set
    total_events = a.total_events + 1,
    total_errors = a.total_errors + (case when new.event_type = 'error' then 1 else 0 end),
    avg_session_duration = coalesce((select avg((e.event_data->>'duration_seconds')::numeric)
                                     from public.user_events e
                                     where e.event_type = 'time_spent' and e.timestamp::date = current_date), a.avg_session_duration);
  return null;
end; $$;

drop trigger if exists trg_refresh_analytics_summary on public.user_events;
create trigger trg_refresh_analytics_summary
after insert on public.user_events
for each row execute function public.refresh_analytics_summary();

-- =========================
-- Tabela de durações por rota (agregado por dia)
-- =========================

create table if not exists public.user_route_durations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  session_id text not null,
  page_url text not null,
  route_date date not null default current_date,
  total_seconds integer not null default 0,
  last_seen timestamptz not null default now()
);

alter table public.user_route_durations
  add constraint uq_user_route unique (session_id, page_url, route_date);

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

-- RPC para upsert de duração por rota
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

-- =========================
-- E-commerce: orders e payments (Stripe webhook)
-- =========================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  total_amount_cents integer not null default 0,
  currency text not null default 'EUR',
  stripe_session_id text unique,
  payment_intent_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);

alter table public.orders enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_select_self'
  ) then
    create policy orders_select_self on public.orders for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert'
  ) then
    create policy orders_insert on public.orders for insert to anon, authenticated with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_update_self'
  ) then
    create policy orders_update_self on public.orders for update to authenticated using (true);
  end if;
end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null,
  amount_cents integer not null,
  currency text not null,
  status text not null,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order on public.payments (order_id);

alter table public.payments enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='payments_select_self'
  ) then
    create policy payments_select_self on public.payments for select to authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='payments' and policyname='payments_insert'
  ) then
    create policy payments_insert on public.payments for insert to authenticated with check (true);
  end if;
end $$;

-- =========================
-- Views para facilitar análise
-- =========================

create or replace view public.v_events_recent as
select id, event_type, event_data, page_url, timestamp, session_id, user_id
from public.user_events
order by timestamp desc
limit 200;

create or replace view public.v_cart_events as
select * from public.user_events
where event_type in ('add_to_cart', 'cart_opened')
order by timestamp desc;

create or replace view public.v_funnel_today as
select event_type,
       count(*) as cnt
from public.user_events
where timestamp::date = current_date
group by event_type
order by cnt desc;

-- Fim


