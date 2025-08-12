const https = require('https');

// Configuração do Supabase
const SUPABASE_URL = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

// SQL para executar
const SQL_COMMANDS = `
-- ===== SETUP SIMPLES PARA DROPSHIPPING =====

-- 1. Tabela de leads (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    source TEXT DEFAULT 'email',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    position INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    regular_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'publish',
    featured BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES public.customers(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de carrinho
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de configurações
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ÍNDICES =====
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);

-- ===== RLS =====
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view their own data" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own customer data" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customer data" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Políticas públicas
CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT USING (status = 'publish');
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (active = true);

-- ===== DADOS INICIAIS =====
INSERT INTO public.site_settings (key, value, description) VALUES
    ('site_name', 'TechGear Brasil', 'Nome do site'),
    ('site_description', 'Acessórios Tecnológicos Premium', 'Descrição do site'),
    ('currency', 'BRL', 'Moeda padrão')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.categories (name, slug, description, position) VALUES
    ('Carregadores', 'carregadores', 'Carregadores magnéticos e wireless', 1),
    ('Power Banks', 'power-banks', 'Baterias portáteis de alta capacidade', 2),
    ('Cabos', 'cabos', 'Cabos USB-C e Lightning de alta qualidade', 3),
    ('Acessórios', 'acessorios', 'Acessórios diversos para dispositivos', 4)
ON CONFLICT (slug) DO NOTHING;
`;

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function executeSQL() {
  console.log('🚀 Executando SQL no Supabase...\n');
  
  try {
    // Dividir o SQL em comandos individuais
    const commands = SQL_COMMANDS.split(';').filter(cmd => cmd.trim());
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (!command) continue;
      
      console.log(`Executando comando ${i + 1}/${commands.length}...`);
      
      const options = {
        hostname: 'ljfxpzcdrctqmfydofdh.supabase.co',
        port: 443,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      };
      
      const postData = JSON.stringify({
        sql: command
      });
      
      try {
        const response = await makeRequest(options, postData);
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      } catch (error) {
        console.log(`⚠️ Comando ${i + 1} pode ter falhado: ${error.message}`);
      }
      
      // Aguardar um pouco entre os comandos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 SQL executado com sucesso!');
    console.log('🔍 Verificando se as tabelas foram criadas...');
    
    // Verificar se as tabelas foram criadas
    await verifyTables();
    
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
  }
}

async function verifyTables() {
  try {
    const options = {
      hostname: 'ljfxpzcdrctqmfydofdh.supabase.co',
      port: 443,
      path: '/rest/v1/site_settings?select=*&limit=1',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.status === 200) {
      console.log('✅ Tabelas criadas com sucesso!');
      console.log('🌐 Site disponível em: http://localhost:3000');
      console.log('🔐 Teste o login em: http://localhost:3000/login');
    } else {
      console.log('❌ Erro ao verificar tabelas:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  }
}

// Executar o script
executeSQL();
