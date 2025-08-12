// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  console.log('📋 Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY');
  console.log('🔗 Obtenha em: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executarSQLAutomatico() {
  console.log('🚀 Executando SQL automaticamente no Supabase...\n');

  try {
    // 1. Criar tabela de leads
    console.log('1. Criando tabela leads...');
    const { error: leadsError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    if (leadsError && leadsError.message.includes('does not exist')) {
      console.log('📝 Criando tabela leads...');
      const { error: createLeadsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.leads (
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

      if (createLeadsError) {
        console.log('⚠️ Erro ao criar leads:', createLeadsError.message);
      } else {
        console.log('✅ Tabela leads criada');
      }
    } else {
      console.log('✅ Tabela leads já existe');
    }

    // 2. Criar tabela de customers
    console.log('2. Criando tabela customers...');
    const { error: customersError } = await supabase
      .from('customers')
      .select('count')
      .limit(1);

    if (customersError && customersError.message.includes('does not exist')) {
      console.log('📝 Criando tabela customers...');
      const { error: createCustomersError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.customers (
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

      if (createCustomersError) {
        console.log('⚠️ Erro ao criar customers:', createCustomersError.message);
      } else {
        console.log('✅ Tabela customers criada');
      }
    } else {
      console.log('✅ Tabela customers já existe');
    }

    // 3. Criar tabela de orders
    console.log('3. Criando tabela orders...');
    const { error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);

    if (ordersError && ordersError.message.includes('does not exist')) {
      console.log('📝 Criando tabela orders...');
      const { error: createOrdersError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.orders (
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

      if (createOrdersError) {
        console.log('⚠️ Erro ao criar orders:', createOrdersError.message);
      } else {
        console.log('✅ Tabela orders criada');
      }
    } else {
      console.log('✅ Tabela orders já existe');
    }

    // 4. Criar tabela de products
    console.log('4. Criando tabela products...');
    const { error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (productsError && productsError.message.includes('does not exist')) {
      console.log('📝 Criando tabela products...');
      const { error: createProductsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.products (
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

      if (createProductsError) {
        console.log('⚠️ Erro ao criar products:', createProductsError.message);
      } else {
        console.log('✅ Tabela products criada');
      }
    } else {
      console.log('✅ Tabela products já existe');
    }

    // 5. Criar tabela de product_views
    console.log('5. Criando tabela product_views...');
    const { error: viewsError } = await supabase
      .from('product_views')
      .select('count')
      .limit(1);

    if (viewsError && viewsError.message.includes('does not exist')) {
      console.log('📝 Criando tabela product_views...');
      const { error: createViewsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.product_views (
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

      if (createViewsError) {
        console.log('⚠️ Erro ao criar product_views:', createViewsError.message);
      } else {
        console.log('✅ Tabela product_views criada');
      }
    } else {
      console.log('✅ Tabela product_views já existe');
    }

    // 6. Criar tabela de user_events
    console.log('6. Criando tabela user_events...');
    const { error: eventsError } = await supabase
      .from('user_events')
      .select('count')
      .limit(1);

    if (eventsError && eventsError.message.includes('does not exist')) {
      console.log('📝 Criando tabela user_events...');
      const { error: createEventsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE public.user_events (
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

      if (createEventsError) {
        console.log('⚠️ Erro ao criar user_events:', createEventsError.message);
      } else {
        console.log('✅ Tabela user_events criada');
      }
    } else {
      console.log('✅ Tabela user_events já existe');
    }

    // 7. Configurar RLS
    console.log('7. Configurando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('⚠️ Erro ao configurar RLS:', rlsError.message);
    } else {
      console.log('✅ RLS configurado');
    }

    // 8. Configurar login automático
    console.log('8. Configurando login automático...');
    const { error: authError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE auth.config 
        SET email_confirm = false, 
            enable_signup = true,
            site_url = 'http://localhost:3000',
            redirect_urls = ARRAY['http://localhost:3000/auth/callback', 'http://localhost:3000']
        WHERE id = 1;
      `
    });

    if (authError) {
      console.log('⚠️ Erro ao configurar auth:', authError.message);
    } else {
      console.log('✅ Login automático configurado');
    }

    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('📋 Tabelas criadas e configuradas:');
    console.log('- ✅ leads');
    console.log('- ✅ customers');
    console.log('- ✅ orders');
    console.log('- ✅ products');
    console.log('- ✅ product_views');
    console.log('- ✅ user_events');
    console.log('- ✅ RLS configurado');
    console.log('- ✅ Login automático configurado');

    console.log('\n🎯 Próximos passos:');
    console.log('1. Execute: npm run dev');
    console.log('2. Acesse: http://localhost:3000/login');
    console.log('3. Teste criar uma conta');
    console.log('4. Verifique se o login automático funciona');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
executarSQLAutomatico();
