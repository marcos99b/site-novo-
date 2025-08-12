-- PERFIL VINCULADO AO auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamp with time zone default now()
);

-- ENDEREÇO OBRIGATÓRIO NO ONBOARDING
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

-- Trigger para auto-inserir profiles no signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
