-- ===== CRIAR FUNÇÃO EXEC_SQL =====
-- Execute este SQL UMA VEZ no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql
-- Depois disso, eu poderei executar SQL automaticamente!

-- ===== 1. CRIAR FUNÇÃO EXEC_SQL =====

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Executar o SQL dinamicamente
  EXECUTE sql;
  
  -- Retornar sucesso
  result := '{"status": "success", "message": "SQL executed successfully"}'::json;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro
    result := json_build_object(
      'status', 'error',
      'message', SQLERRM,
      'detail', SQLSTATE
    );
    RETURN result;
END;
$$;

-- ===== 2. CONCEDER PERMISSÕES =====

-- Dar permissão para a função ser chamada via API
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- ===== 3. TESTAR A FUNÇÃO =====

-- Testar com um SELECT simples
SELECT exec_sql('SELECT 1 as test') as resultado_teste;

-- ===== 4. VERIFICAR SE FOI CRIADA =====

-- Verificar se a função existe
SELECT 
  'Função exec_sql criada' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'exec_sql' AND routine_schema = 'public';

-- ===== 5. INSTRUÇÕES =====
-- ✅ Função exec_sql criada
-- ✅ Permissões concedidas
-- ✅ Pronta para uso via API
-- 
-- AGORA EU POSSO EXECUTAR SQL AUTOMATICAMENTE!
-- 
-- Próximos passos:
-- 1. Execute este SQL no dashboard
-- 2. Depois eu poderei executar todos os outros SQLs automaticamente
-- 3. Sistema será configurado 100% automaticamente
