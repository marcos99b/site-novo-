-- ===== CONFIGURAÇÃO PARA LOGIN AUTOMÁTICO =====

-- Desativar confirmação de email
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Habilitar signup
UPDATE auth.config 
SET enable_signup = true 
WHERE id = 1;

-- Configurar site URL
UPDATE auth.config 
SET site_url = 'http://localhost:3000' 
WHERE id = 1;

-- Configurar redirect URLs
UPDATE auth.config 
SET redirect_urls = ARRAY['http://localhost:3000/auth/callback', 'http://localhost:3000'] 
WHERE id = 1;

-- Verificar configuração
SELECT 
  'Configuração Atual' as status,
  email_confirm as email_confirmacao,
  enable_signup as signup_habilitado,
  site_url as url_site
FROM auth.config 
WHERE id = 1;
