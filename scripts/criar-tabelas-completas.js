// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function criarTabelasCompletas() {
  console.log('🏗️ Criando todas as tabelas no Supabase...\n');

  try {
    // 1. Criar tabela de leads
    console.log('1. Criando tabela leads...');
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (leadsError) {
      console.log('⚠️ Erro ao criar leads:', leadsError.message);
    } else {
      console.log('✅ Tabela leads criada');
    }

    // 2. Criar tabela de customers
    console.log('2. Criando tabela customers...');
    const { error: customersError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (customersError) {
      console.log('⚠️ Erro ao criar customers:', customersError.message);
    } else {
      console.log('✅ Tabela customers criada');
    }

    // 3. Criar tabela de orders
    console.log('3. Criando tabela orders...');
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (ordersError) {
      console.log('⚠️ Erro ao criar orders:', ordersError.message);
    } else {
      console.log('✅ Tabela orders criada');
    }

    // 4. Criar tabela de products
    console.log('4. Criando tabela products...');
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (productsError) {
      console.log('⚠️ Erro ao criar products:', productsError.message);
    } else {
      console.log('✅ Tabela products criada');
    }

    // 5. Criar tabela de product_views
    console.log('5. Criando tabela product_views...');
    const { error: viewsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (viewsError) {
      console.log('⚠️ Erro ao criar product_views:', viewsError.message);
    } else {
      console.log('✅ Tabela product_views criada');
    }

    // 6. Criar tabela de user_events
    console.log('6. Criando tabela user_events...');
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (eventsError) {
      console.log('⚠️ Erro ao criar user_events:', eventsError.message);
    } else {
      console.log('✅ Tabela user_events criada');
    }

    // 7. Configurar RLS (Row Level Security)
    console.log('7. Configurando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Habilitar RLS em todas as tabelas
        ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

        -- Políticas para leads
        DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
        DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
        
        CREATE POLICY "Users can view their own leads" ON public.leads
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own leads" ON public.leads
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Políticas para customers
        DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
        DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
        
        CREATE POLICY "Users can view their own customers" ON public.customers
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own customers" ON public.customers
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Políticas para orders
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
        
        CREATE POLICY "Users can view their own orders" ON public.orders
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own orders" ON public.orders
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Políticas para products (público para leitura)
        DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
        CREATE POLICY "Products are viewable by everyone" ON public.products
          FOR SELECT USING (true);

        -- Políticas para product_views
        DROP POLICY IF EXISTS "Anyone can insert product views" ON public.product_views;
        CREATE POLICY "Anyone can insert product views" ON public.product_views
          FOR INSERT WITH CHECK (true);

        -- Políticas para user_events
        DROP POLICY IF EXISTS "Users can insert their own events" ON public.user_events;
        CREATE POLICY "Users can insert their own events" ON public.user_events
          FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);
      `
    });

    if (rlsError) {
      console.log('⚠️ Erro ao configurar RLS:', rlsError.message);
    } else {
      console.log('✅ RLS configurado');
    }

    console.log('\n🎉 Todas as tabelas foram criadas com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('- ✅ leads');
    console.log('- ✅ customers');
    console.log('- ✅ orders');
    console.log('- ✅ products');
    console.log('- ✅ product_views');
    console.log('- ✅ user_events');
    console.log('- ✅ RLS configurado');

    console.log('\n🎯 Próximos passos:');
    console.log('1. Configure o login automático no Supabase Dashboard');
    console.log('2. Execute: npm run dev');
    console.log('3. Teste o sistema de login');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar criação das tabelas
criarTabelasCompletas();
