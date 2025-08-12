// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SQL_TABLES = `
-- Extensões
create extension if not exists pgcrypto;

-- Profiles (1-1 com auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  is_anonymous boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at genérica
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

-- Triggers updated_at
 drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Criar profile ao criar usuário
create or replace function public.create_profile_from_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, name, is_anonymous)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), coalesce((new.raw_user_meta_data->>'is_anonymous')::boolean, false))
  on conflict (user_id) do nothing;
  return new;
exception when others then
  raise warning 'Falha ao criar profile: %', sqlerrm;
  return new;
end; $$ language plpgsql security definer;

 drop trigger if exists create_profile_from_user_trigger on auth.users;
create trigger create_profile_from_user_trigger
  after insert on auth.users
  for each row execute function public.create_profile_from_user();

-- Carts
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
 drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();

-- Cart Items (snapshot de preço)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  total_price_cents integer generated always as (unit_price_cents * quantity) stored,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','payment_pending','payment_failed','cancelled','refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','failed','refunded')),
  total_amount_cents integer not null default 0,
  currency text not null default 'EUR',
  shipping_address jsonb,
  billing_address jsonb,
  stripe_session_id text,
  payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
 drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- Order Items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  total_price_cents integer generated always as (unit_price_cents * quantity) stored,
  created_at timestamptz not null default now()
);

-- Payments log
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'stripe',
  amount_cents integer not null,
  currency text not null default 'EUR',
  status text not null,
  raw_event jsonb,
  created_at timestamptz not null default now()
);
`;

const SQL_RLS = `
-- Enable RLS e Policies
alter table public.profiles enable row level security;
 drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
 drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.carts enable row level security;
 drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own" on public.carts for select using (auth.uid() = user_id);
 drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own" on public.carts for insert with check (auth.uid() = user_id);
 drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own" on public.carts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
 drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own" on public.carts for delete using (auth.uid() = user_id);

alter table public.cart_items enable row level security;
 drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own" on public.cart_items for select using (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
 drop policy if exists "cart_items_cud_own" on public.cart_items;
create policy "cart_items_cud_own" on public.cart_items for all using (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

alter table public.orders enable row level security;
 drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
 drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
 drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own" on public.orders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.order_items enable row level security;
 drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items for select using (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
 drop policy if exists "order_items_cud_own" on public.order_items;
create policy "order_items_cud_own" on public.order_items for all using (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())) with check (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

alter table public.payments enable row level security;
 drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select using (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
`;

(async () => {
  console.log('🔧 Criando tabelas base Stripe...');
  let res = await supabase.rpc('exec_sql', { sql: SQL_TABLES });
  if (res.error) {
    console.error('❌ Erro TABELAS:', res.error);
    process.exit(1);
  }
  console.log('✅ Tabelas OK');

  console.log('🛡️ Aplicando RLS/Policies...');
  res = await supabase.rpc('exec_sql', { sql: SQL_RLS });
  if (res.error) {
    console.error('❌ Erro RLS:', res.error);
    process.exit(1);
  }
  console.log('✅ RLS/Policies OK');
})();
