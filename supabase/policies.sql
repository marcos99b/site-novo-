alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

-- profiles: dono pode ver/editar
reset role;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

-- addresses: dono pode ver/criar/editar/apagar
drop policy if exists "addresses_crud_own" on public.addresses;
create policy "addresses_crud_own" on public.addresses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
