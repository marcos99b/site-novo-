-- Criar tabela de leads para captura de emails
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'Geral',
  source VARCHAR(100) DEFAULT 'website',
  discount_offered VARCHAR(50) DEFAULT '15%',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por email
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Criar índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);

-- Criar índice para busca por status
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Criar índice para busca por data de criação
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de leads (qualquer usuário pode inserir)
CREATE POLICY "Allow public insert on leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados (opcional)
CREATE POLICY "Allow authenticated read on leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente o timestamp
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Inserir alguns leads de exemplo (opcional)
INSERT INTO leads (email, category, source, discount_offered) VALUES
  ('exemplo1@email.com', 'Vestidos', 'catalogo', '15%'),
  ('exemplo2@email.com', 'Conjuntos', 'catalogo', '15%'),
  ('exemplo3@email.com', 'Outono / Inverno', 'catalogo', '15%')
ON CONFLICT (email) DO NOTHING;
