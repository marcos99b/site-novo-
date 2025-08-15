-- =====================================================
-- CONFIGURAÇÃO COMPLETA SUPABASE PARA VENDAS DIRETAS
-- =====================================================
-- Este script configura o Supabase para:
-- 1. Produtos automatizados
-- 2. Vendas diretas via Stripe
-- 3. Gestão manual de pedidos
-- 4. Sistema de estoque automático
-- =====================================================

-- ===== 1. CONFIGURAÇÃO DE AUTENTICAÇÃO =====
-- Desabilitar confirmação de email (para desenvolvimento)
UPDATE auth.config SET confirm_email_change = false;
UPDATE auth.config SET enable_signup = true;
UPDATE auth.config SET enable_confirmations = false;

-- ===== 2. TABELAS PRINCIPAIS =====

-- Tabela de produtos (otimizada para vendas diretas)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  stock_status VARCHAR(20) DEFAULT 'instock' CHECK (stock_status IN ('instock', 'outofstock', 'onbackorder')),
  status VARCHAR(20) DEFAULT 'publish' CHECK (status IN ('publish', 'draft', 'pending')),
  featured BOOLEAN DEFAULT false,
  category VARCHAR(100),
  tags TEXT[],
  weight DECIMAL(8,2),
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens de produtos
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  src VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de variantes de produtos
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  attributes JSONB, -- {color: "preto", size: "M"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos (otimizada para Stripe)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB,
  billing_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de carrinho de compras
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, product_id, variant_id)
);

-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 3. ÍNDICES PARA PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);

-- ===== 4. FUNÇÕES AUTOMÁTICAS =====

-- Função para gerar número de pedido automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(CAST(nextval('order_sequence') AS TEXT), 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequência para números de pedido
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Função para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estoque do produto principal
  UPDATE public.products 
  SET stock = stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  -- Atualizar estoque da variante se existir
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== 5. TRIGGERS AUTOMÁTICOS =====

-- Trigger para gerar número de pedido
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Trigger para atualizar estoque
DROP TRIGGER IF EXISTS trigger_update_stock ON public.order_items;
CREATE TRIGGER trigger_update_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Triggers para atualizar updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at 
  BEFORE UPDATE ON public.product_variants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON public.customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON public.cart_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== 6. ROW LEVEL SECURITY =====

-- Habilitar RLS nas tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ===== 7. POLÍTICAS DE SEGURANÇA =====

-- Produtos: todos podem ver, apenas admin pode editar
DROP POLICY IF EXISTS "products_select_all" ON public.products;
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (auth.role() = 'authenticated' AND auth.email() IN (
    SELECT email FROM public.site_settings WHERE key = 'admin_emails'
  ));

-- Imagens de produtos: todos podem ver
DROP POLICY IF EXISTS "product_images_select_all" ON public.product_images;
CREATE POLICY "product_images_select_all" ON public.product_images
  FOR SELECT USING (true);

-- Variantes: todos podem ver
DROP POLICY IF EXISTS "product_variants_select_all" ON public.product_variants;
CREATE POLICY "product_variants_select_all" ON public.product_variants
  FOR SELECT USING (true);

-- Clientes: usuário pode ver/editar apenas seus dados
DROP POLICY IF EXISTS "customers_own_data" ON public.customers;
CREATE POLICY "customers_own_data" ON public.customers
  FOR ALL USING (auth.uid() = user_id);

-- Pedidos: usuário pode ver apenas seus pedidos
DROP POLICY IF EXISTS "orders_own_data" ON public.orders;
CREATE POLICY "orders_own_data" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Itens do pedido: usuário pode ver apenas seus itens
DROP POLICY IF EXISTS "order_items_own_data" ON public.order_items;
CREATE POLICY "order_items_own_data" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_items.order_id 
      AND customer_id IN (
        SELECT id FROM public.customers WHERE user_id = auth.uid()
      )
    )
  );

-- Carrinho: usuário pode gerenciar apenas seu carrinho
DROP POLICY IF EXISTS "cart_items_own_data" ON public.cart_items;
CREATE POLICY "cart_items_own_data" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Configurações: apenas admin pode acessar
DROP POLICY IF EXISTS "site_settings_admin" ON public.site_settings;
CREATE POLICY "site_settings_admin" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated' AND auth.email() IN (
    SELECT email FROM public.site_settings WHERE key = 'admin_emails'
  ));

-- ===== 8. DADOS INICIAIS =====

-- Configurações padrão do site
INSERT INTO public.site_settings (key, value, description) VALUES
  ('site_name', 'Reliet - Moda Feminina', 'Nome do site'),
  ('site_description', 'Moda feminina elegante com envio para Portugal', 'Descrição do site'),
  ('currency', 'EUR', 'Moeda padrão'),
  ('tax_rate', '0.00', 'Taxa de imposto padrão'),
  ('shipping_cost', '0.00', 'Custo de envio padrão'),
  ('min_order_amount', '0.00', 'Valor mínimo para pedido'),
  ('contact_email', 'contato@reliet.pt', 'Email de contato'),
  ('admin_emails', 'admin@reliet.pt,seu-email@exemplo.com', 'Emails de administradores'),
  ('stripe_webhook_secret', '', 'Secret do webhook do Stripe'),
  ('stripe_publishable_key', '', 'Chave pública do Stripe')
ON CONFLICT (key) DO NOTHING;

-- ===== 9. FUNÇÕES ÚTEIS PARA GESTÃO =====

-- Função para obter estatísticas de vendas
CREATE OR REPLACE FUNCTION get_sales_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL(10,2),
  avg_order_value DECIMAL(10,2),
  top_product VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COALESCE(p.name, 'N/A') as top_product
  FROM public.orders o
  LEFT JOIN (
    SELECT oi.order_id, oi.product_id, p.name,
           ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rn
    FROM public.order_items oi
    JOIN public.products p ON oi.product_id = p.id
    WHERE oi.created_at BETWEEN start_date AND end_date
    GROUP BY oi.product_id, p.name
    LIMIT 1
  ) top ON top.order_id = o.id
  WHERE o.created_at BETWEEN start_date AND end_date
  AND o.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status de pedido
CREATE OR REPLACE FUNCTION update_order_status(
  order_id UUID,
  new_status VARCHAR(50),
  tracking_number VARCHAR(100) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.orders 
  SET status = new_status,
      tracking_number = COALESCE(tracking_number, tracking_number),
      shipped_at = CASE WHEN new_status = 'completed' THEN NOW() ELSE shipped_at END,
      updated_at = NOW()
  WHERE id = order_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ===== 10. COMENTÁRIOS E DOCUMENTAÇÃO =====

COMMENT ON TABLE public.products IS 'Produtos disponíveis para venda';
COMMENT ON TABLE public.product_images IS 'Imagens dos produtos';
COMMENT ON TABLE public.product_variants IS 'Variantes dos produtos (cor, tamanho, etc.)';
COMMENT ON TABLE public.customers IS 'Clientes cadastrados';
COMMENT ON TABLE public.orders IS 'Pedidos realizados';
COMMENT ON TABLE public.order_items IS 'Itens dos pedidos';
COMMENT ON TABLE public.cart_items IS 'Itens no carrinho de compras';
COMMENT ON TABLE public.site_settings IS 'Configurações do site';

COMMENT ON FUNCTION generate_order_number() IS 'Gera número de pedido automático';
COMMENT ON FUNCTION update_product_stock() IS 'Atualiza estoque automaticamente após venda';
COMMENT ON FUNCTION get_sales_stats() IS 'Obtém estatísticas de vendas';
COMMENT ON FUNCTION update_order_status() IS 'Atualiza status de pedido';

-- =====================================================
-- CONFIGURAÇÃO COMPLETA FINALIZADA
-- =====================================================
-- Para usar:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Configure as chaves do Stripe em site_settings
-- 3. Adicione produtos via API ou SQL
-- 4. Configure webhook do Stripe para atualizar pedidos
-- =====================================================
