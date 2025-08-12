-- Adicionar campo de telefone nas tabelas
-- Criado em: 2025-01-08

-- Adicionar campo phone na tabela leads se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'phone') THEN
    ALTER TABLE public.leads ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Adicionar campo phone na tabela customers se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'customers' AND column_name = 'phone') THEN
    ALTER TABLE public.customers ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Atualizar RLS para incluir phone
DROP POLICY IF EXISTS "Users can view their own data" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;

CREATE POLICY "Users can view their own data" ON public.leads 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Configurar autenticação para desenvolvimento
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

UPDATE auth.config 
SET enable_signup = true 
WHERE id = 1;

UPDATE auth.config 
SET site_url = 'http://localhost:3000' 
WHERE id = 1;
