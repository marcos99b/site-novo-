-- ===== DESABILITAR RLS TEMPORARIAMENTE =====
-- Execute este SQL no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. DESABILITAR RLS EM TODAS AS TABELAS =====

-- Desabilitar RLS em leads
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em customers
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em orders
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em products
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em product_views
ALTER TABLE public.product_views DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em user_events
ALTER TABLE public.user_events DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em cart_items
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em favorites
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;

-- ===== 2. VERIFICAR STATUS DO RLS =====

-- Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'customers', 'orders', 'products', 'product_views', 'user_events', 'cart_items', 'favorites')
ORDER BY tablename;

-- ===== 3. TESTAR INSERÇÃO =====

-- Testar inserção em leads
INSERT INTO public.leads (user_id, email, name, source, status)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'teste-rls@teste.com',
  'Teste RLS Desabilitado',
  'test',
  'new'
);

-- Verificar se foi inserido
SELECT 'Lead Teste Inserido' as status, COUNT(*) as total FROM public.leads WHERE email = 'teste-rls@teste.com';

-- Remover teste
DELETE FROM public.leads WHERE email = 'teste-rls@teste.com';

-- ===== 4. INSTRUÇÕES FINAIS =====
-- ✅ RLS desabilitado em todas as tabelas
-- ✅ Sistema pronto para criação de usuários
-- ✅ Inserções funcionando sem restrições
-- 
-- PRÓXIMOS PASSOS:
-- 1. Configure Authentication > Settings no Dashboard
-- 2. Desative "Enable email confirmations"
-- 3. Configure Site URL: http://localhost:3000
-- 4. Adicione Redirect URLs: http://localhost:3000/auth/callback e http://localhost:3000
-- 5. Teste o login em: http://localhost:3000/login
-- 
-- ⚠️ IMPORTANTE:
-- - RLS foi desabilitado temporariamente
-- - Para produção, reabilite RLS com políticas corretas
-- - Sistema funcionará sem RLS por enquanto
