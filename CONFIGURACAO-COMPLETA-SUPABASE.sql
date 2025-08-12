-- ===== CONFIGURAÇÃO COMPLETA DO SUPABASE =====
-- Execute este SQL no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. CRIAR TODAS AS TABELAS =====

-- Tabela de leads (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT CHECK (source IN ('google', 'email', 'manual', 'facebook', 'instagram', 'google_ads', 'signup')) DEFAULT 'email',
  status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')) DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de customers (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  customer_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'inactive', 'vip')) DEFAULT 'active',
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de orders (E-commerce)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  customer_id UUID REFERENCES public.customers(id),
  status TEXT CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  tracking_url TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de products (E-commerce)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  profit_margin DECIMAL(5,2),
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT CHECK (stock_status IN ('instock', 'outofstock', 'onbackorder')) DEFAULT 'instock',
  status TEXT CHECK (status IN ('publish', 'draft', 'pending')) DEFAULT 'publish',
  featured BOOLEAN DEFAULT false,
  category_id UUID,
  supplier_id TEXT,
  supplier_product_id TEXT,
  weight DECIMAL(8,2),
  dimensions JSONB,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de product_views (Tracking)
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de user_events (Tracking)
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cart_items (E-commerce)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de favorites (E-commerce)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ===== 2. CONFIGURAR RLS (ROW LEVEL SECURITY) =====

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para customers
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para products (público para leitura)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Políticas para product_views
DROP POLICY IF EXISTS "Anyone can insert product views" ON public.product_views;
CREATE POLICY "Anyone can insert product views" ON public.product_views FOR INSERT WITH CHECK (true);

-- Políticas para user_events
DROP POLICY IF EXISTS "Users can insert their own events" ON public.user_events;
CREATE POLICY "Users can insert their own events" ON public.user_events FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

-- Políticas para cart_items
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;
CREATE POLICY "Users can manage their own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Políticas para favorites
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- ===== 3. CRIAR FUNÇÕES ÚTEIS =====

-- Função para criar lead automaticamente
CREATE OR REPLACE FUNCTION create_lead_from_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leads (user_id, email, name, source, status)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'signup', 'new')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar lead automaticamente
DROP TRIGGER IF EXISTS create_lead_trigger ON auth.users;
CREATE TRIGGER create_lead_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_lead_from_user();

-- Função para criar customer automaticamente
CREATE OR REPLACE FUNCTION create_customer_from_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (user_id, email, name, total_orders, total_spent, status)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 0, 0, 'active')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar customer automaticamente
DROP TRIGGER IF EXISTS create_customer_trigger ON auth.users;
CREATE TRIGGER create_customer_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_from_user();

-- Função para gerar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) THEN
      RETURN order_num;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===== 4. CONFIGURAR LOGIN AUTOMÁTICO =====

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

-- ===== 5. INSERIR DADOS DE EXEMPLO =====

-- Inserir produtos de exemplo
INSERT INTO public.products (name, slug, description, price, regular_price, stock_quantity, status)
VALUES 
  ('Smartphone Galaxy S23', 'smartphone-galaxy-s23', 'Smartphone Samsung Galaxy S23 128GB', 3999.99, 4499.99, 50, 'publish'),
  ('Notebook Dell Inspiron', 'notebook-dell-inspiron', 'Notebook Dell Inspiron 15" 8GB RAM', 2999.99, 3499.99, 30, 'publish'),
  ('Fone de Ouvido Bluetooth', 'fone-bluetooth', 'Fone de ouvido sem fio com cancelamento de ruído', 299.99, 399.99, 100, 'publish')
ON CONFLICT (slug) DO NOTHING;

-- ===== 6. VERIFICAR CONFIGURAÇÃO =====

-- Verificar tabelas criadas
SELECT 
  'Tabelas Criadas' as status,
  COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'customers', 'orders', 'products', 'product_views', 'user_events', 'cart_items', 'favorites');

-- Verificar configuração de auth
SELECT 
  'Configuração Auth' as status,
  email_confirm as email_confirmacao,
  enable_signup as signup_habilitado,
  site_url as url_site
FROM auth.config 
WHERE id = 1;

-- Verificar produtos inseridos
SELECT 
  'Produtos de Exemplo' as status,
  COUNT(*) as total_produtos
FROM public.products;
