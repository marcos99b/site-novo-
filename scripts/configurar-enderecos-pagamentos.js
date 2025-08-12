// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Configurado' : '❌ Faltando');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Faltando');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SQL = `
-- EXTENSÕES REQUERIDAS
create extension if not exists pgcrypto;

-- ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('shipping','billing')),
  name text,
  street text not null,
  number text,
  complement text,
  neighborhood text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'BR',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_addresses_updated_at on public.addresses;
create trigger set_addresses_updated_at before update on public.addresses
for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

-- Policies
drop policy if exists "Addresses select own" on public.addresses;
create policy "Addresses select own" on public.addresses
for select using (auth.uid() = user_id);

drop policy if exists "Addresses insert own" on public.addresses;
create policy "Addresses insert own" on public.addresses
for insert with check (auth.uid() = user_id);

drop policy if exists "Addresses update own" on public.addresses;
create policy "Addresses update own" on public.addresses
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Addresses delete own" on public.addresses;
create policy "Addresses delete own" on public.addresses
for delete using (auth.uid() = user_id);

-- PAYMENT METHODS
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('card','pix','boleto','paypal','mbway')),
  brand text,
  last4 text,
  holder_name text,
  expiry_month int,
  expiry_year int,
  billing_address_id uuid references public.addresses(id) on delete set null,
  is_default boolean not null default false,
  provider text,
  provider_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_payment_methods_updated_at on public.payment_methods;
create trigger set_payment_methods_updated_at before update on public.payment_methods
for each row execute function public.set_updated_at();

alter table public.payment_methods enable row level security;

-- Policies
drop policy if exists "Payment methods select own" on public.payment_methods;
create policy "Payment methods select own" on public.payment_methods
for select using (auth.uid() = user_id);

drop policy if exists "Payment methods insert own" on public.payment_methods;
create policy "Payment methods insert own" on public.payment_methods
for insert with check (auth.uid() = user_id);

drop policy if exists "Payment methods update own" on public.payment_methods;
create policy "Payment methods update own" on public.payment_methods
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Payment methods delete own" on public.payment_methods;
create policy "Payment methods delete own" on public.payment_methods
for delete using (auth.uid() = user_id);

-- GARANTIR APENAS UM DEFAULT POR USUÁRIO (opcional via trigger simples)
create or replace function public.ensure_single_default()
returns trigger as $$
begin
  if new.is_default is true then
    -- desmarca outros como default
    if tg_table_name = 'addresses' then
      update public.addresses set is_default = false where user_id = new.user_id and id <> new.id and type = new.type;
    elsif tg_table_name = 'payment_methods' then
      update public.payment_methods set is_default = false where user_id = new.user_id and id <> new.id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists addresses_single_default on public.addresses;
create trigger addresses_single_default before insert or update on public.addresses
for each row execute function public.ensure_single_default();

drop trigger if exists payment_methods_single_default on public.payment_methods;
create trigger payment_methods_single_default before insert or update on public.payment_methods
for each row execute function public.ensure_single_default();
`;

(async () => {
  console.log('🔧 Configurando tabelas de endereços e pagamentos...');
  const { data, error } = await supabase.rpc('exec_sql', { sql: SQL });
  if (error) {
    console.error('❌ Erro ao configurar:', error);
    process.exit(1);
  }
  console.log('✅ Configuração concluída:', data);
  console.log('📦 Tabelas: addresses, payment_methods');
  console.log('🛡️ RLS: políticas criadas (acesso apenas do próprio usuário)');
})();
