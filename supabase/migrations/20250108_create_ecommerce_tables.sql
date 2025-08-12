-- Tabelas para E-commerce TechStore
-- Criado em: 2025-01-08

-- Tabela de categorias (DEVE VIR ANTES DOS PRODUTOS)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  stock_status VARCHAR(20) DEFAULT 'instock' CHECK (stock_status IN ('instock', 'outofstock', 'onbackorder')),
  status VARCHAR(20) DEFAULT 'publish' CHECK (status IN ('publish', 'draft', 'pending')),
  featured BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens de produtos
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  src VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de carrinho de compras
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, product_id)
);

-- Tabela de avaliações de produtos
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads (CRM)
CREATE TABLE IF NOT EXISTS leads (
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

-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description) VALUES
  ('Carregadores', 'carregadores', 'Carregadores magnéticos e wireless para dispositivos Apple'),
  ('Power Banks', 'power-banks', 'Baterias portáteis de alta capacidade'),
  ('Cabos', 'cabos', 'Cabos USB-C e Lightning de alta qualidade'),
  ('Acessórios', 'acessorios', 'Acessórios diversos para dispositivos Apple')
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO products (name, slug, description, short_description, price, regular_price, sale_price, stock_quantity, category_id, featured) VALUES
  (
    'Carregador Magnético 3-em-1',
    'carregador-magnetico-3-em-1',
    'Carregue iPhone, AirPods e Apple Watch simultaneamente com design magnético premium. Tecnologia avançada e acabamento de luxo.',
    'Carregamento magnético 3-em-1 para dispositivos Apple',
    379.00,
    549.00,
    379.00,
    50,
    (SELECT id FROM categories WHERE slug = 'carregadores'),
    true
  ),
  (
    'QuickCharge Pro®',
    'quickcharge-pro',
    'O nosso carregador mais avançado. Tecnologia de carregamento ultra-rápido, design magnético premium e compatibilidade total com dispositivos Apple.',
    'Carregamento ultra rápido com tecnologia QuickCharge Pro',
    299.00,
    399.00,
    299.00,
    30,
    (SELECT id FROM categories WHERE slug = 'carregadores'),
    true
  ),
  (
    'Power Bank 20000mAh',
    'power-bank-20000mah',
    'Power bank de alta capacidade com carregamento rápido e múltiplas saídas. Ideal para viagens e uso diário.',
    'Power bank portátil de 20000mAh',
    199.00,
    249.00,
    199.00,
    25,
    (SELECT id FROM categories WHERE slug = 'power-banks'),
    false
  ),
  (
    'Cabo USB-C Premium',
    'cabo-usb-c-premium',
    'Cabo USB-C de alta qualidade com suporte a carregamento rápido e transferência de dados. Durabilidade garantida.',
    'Cabo USB-C premium com carregamento rápido',
    49.00,
    69.00,
    49.00,
    100,
    (SELECT id FROM categories WHERE slug = 'cabos'),
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Inserir imagens para os produtos
INSERT INTO product_images (product_id, src, alt, position) VALUES
  ((SELECT id FROM products WHERE slug = 'carregador-magnetico-3-em-1'), 'https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=1200&auto=format&fit=crop', 'Carregador Magnético 3-em-1', 0),
  ((SELECT id FROM products WHERE slug = 'quickcharge-pro'), 'https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=1200&auto=format&fit=crop', 'QuickCharge Pro', 0),
  ((SELECT id FROM products WHERE slug = 'power-bank-20000mah'), 'https://images.unsplash.com/photo-1583947215259-38e31be8757d?q=80&w=1200&auto=format&fit=crop', 'Power Bank 20000mAh', 0),
  ((SELECT id FROM products WHERE slug = 'cabo-usb-c-premium'), 'https://images.unsplash.com/photo-1587202372775-98927b415cde?q=80&w=1200&auto=format&fit=crop', 'Cabo USB-C Premium', 0);

-- Inserir avaliações de exemplo
INSERT INTO product_reviews (product_id, customer_id, rating, title, comment) VALUES
  ((SELECT id FROM products WHERE slug = 'carregador-magnetico-3-em-1'), NULL, 5, 'Excelente produto!', 'Comprei quatro carregadores e todos funcionam perfeitamente. A qualidade é excepcional e o carregamento é realmente rápido.'),
  ((SELECT id FROM products WHERE slug = 'quickcharge-pro'), NULL, 5, 'Impressionante!', 'Impressionado com a qualidade do QuickCharge Pro. O design é elegante e o carregamento é incrivelmente rápido.'),
  ((SELECT id FROM products WHERE slug = 'power-bank-20000mah'), NULL, 5, 'Muito bom!', 'Atendimento excelente e power bank muito sólido. A bateria dura muito mais que o esperado.');

-- Inserir cupons de exemplo
INSERT INTO coupons (code, type, value, minimum_amount, usage_limit, valid_until) VALUES
  ('WELCOME10', 'percentage', 10.00, 100.00, 100, NOW() + INTERVAL '30 days'),
  ('FREESHIP', 'fixed', 15.00, 200.00, 50, NOW() + INTERVAL '15 days');

-- Inserir configurações do site
INSERT INTO site_settings (key, value, description) VALUES
  ('site_name', 'TechGear Brasil', 'Nome do site'),
  ('site_description', 'Acessórios Tecnológicos Premium', 'Descrição do site'),
  ('currency', 'BRL', 'Moeda padrão'),
  ('tax_rate', '0.00', 'Taxa de imposto padrão'),
  ('shipping_cost', '0.00', 'Custo de envio padrão'),
  ('min_order_amount', '0.00', 'Valor mínimo para pedido'),
  ('contact_email', 'contato@techgear.com.br', 'Email de contato'),
  ('contact_phone', '(11) 99999-9999', 'Telefone de contato')
ON CONFLICT (key) DO NOTHING;
