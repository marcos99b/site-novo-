-- ===== CORREÇÃO DE CONSTRAINTS =====
-- Execute este SQL no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. CORRIGIR CONSTRAINT DE SOURCE EM LEADS =====

-- Remover constraint antiga
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;

-- Adicionar constraint corrigida
ALTER TABLE public.leads ADD CONSTRAINT leads_source_check 
CHECK (source IN ('google', 'email', 'manual', 'facebook', 'instagram', 'google_ads', 'signup', 'test'));

-- ===== 2. CORRIGIR FOREIGN KEY EM CUSTOMERS =====

-- Remover foreign key antiga
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;

-- Adicionar foreign key corrigida com CASCADE
ALTER TABLE public.customers ADD CONSTRAINT customers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ===== 3. CORRIGIR FOREIGN KEY EM LEADS =====

-- Remover foreign key antiga
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_user_id_fkey;

-- Adicionar foreign key corrigida com CASCADE
ALTER TABLE public.leads ADD CONSTRAINT leads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ===== 4. CORRIGIR OUTRAS FOREIGN KEYS =====

-- Orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Product views
ALTER TABLE public.product_views DROP CONSTRAINT IF EXISTS product_views_user_id_fkey;
ALTER TABLE public.product_views ADD CONSTRAINT product_views_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.product_views DROP CONSTRAINT IF EXISTS product_views_product_id_fkey;
ALTER TABLE public.product_views ADD CONSTRAINT product_views_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- User events
ALTER TABLE public.user_events DROP CONSTRAINT IF EXISTS user_events_user_id_fkey;
ALTER TABLE public.user_events ADD CONSTRAINT user_events_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Cart items
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Favorites
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- ===== 5. VERIFICAR CONSTRAINTS =====

-- Verificar constraints de leads
SELECT 
  'Leads Constraints' as tabela,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'leads' AND table_schema = 'public';

-- Verificar constraints de customers
SELECT 
  'Customers Constraints' as tabela,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'customers' AND table_schema = 'public';

-- ===== 6. TESTAR INSERÇÃO =====

-- Testar inserção em leads
INSERT INTO public.leads (user_id, email, name, source, status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'teste@teste.com',
  'Teste Constraint',
  'test',
  'new'
);

-- Verificar se foi inserido
SELECT 'Lead Teste Inserido' as status, COUNT(*) as total FROM public.leads WHERE email = 'teste@teste.com';

-- Remover teste
DELETE FROM public.leads WHERE email = 'teste@teste.com';

-- ===== 7. INSTRUÇÕES FINAIS =====
-- ✅ Constraints corrigidas
-- ✅ Foreign keys com CASCADE
-- ✅ Source constraint atualizada
-- ✅ Sistema pronto para criação de usuários
-- 
-- PRÓXIMOS PASSOS:
-- 1. Configure Authentication > Settings no Dashboard
-- 2. Desative "Enable email confirmations"
-- 3. Configure Site URL: http://localhost:3000
-- 4. Adicione Redirect URLs: http://localhost:3000/auth/callback e http://localhost:3000
-- 5. Teste o login em: http://localhost:3000/login
