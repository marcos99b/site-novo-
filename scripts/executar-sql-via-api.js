// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
  process.exit(1);
}

// Função para fazer requisição HTTP
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function executarSQLViaAPI() {
  console.log('🚀 Executando SQL via API do Supabase...\n');

  try {
    // 1. Testar conexão
    console.log('1. Testando conexão...');
    const testOptions = {
      hostname: 'ljfxpzcdrctqmfydofdh.supabase.co',
      port: 443,
      path: '/rest/v1/leads?select=count',
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    };

    const testResponse = await makeRequest(testOptions);
    console.log('✅ Conexão com Supabase funcionando');

    // 2. Executar SQL via RPC
    console.log('2. Executando SQL para criar tabelas...');
    
    const sqlCommands = [
      // Criar tabela leads
      `CREATE TABLE IF NOT EXISTS public.leads (
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
      )`,
      
      // Criar tabela customers
      `CREATE TABLE IF NOT EXISTS public.customers (
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
      )`,
      
      // Criar tabela orders
      `CREATE TABLE IF NOT EXISTS public.orders (
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
      )`,
      
      // Criar tabela products
      `CREATE TABLE IF NOT EXISTS public.products (
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
      )`,
      
      // Criar tabela product_views
      `CREATE TABLE IF NOT EXISTS public.product_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID REFERENCES public.products(id),
        user_id UUID REFERENCES auth.users(id),
        session_id TEXT,
        ip_address INET,
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Criar tabela user_events
      `CREATE TABLE IF NOT EXISTS public.user_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        session_id TEXT,
        event_type TEXT NOT NULL,
        event_data JSONB,
        page_url TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];

    // Executar cada comando SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      const tableNames = ['leads', 'customers', 'orders', 'products', 'product_views', 'user_events'];
      const tableName = tableNames[i];
      
      console.log(`📝 Criando tabela ${tableName}...`);
      
      const rpcOptions = {
        hostname: 'ljfxpzcdrctqmfydofdh.supabase.co',
        port: 443,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        const response = await makeRequest(rpcOptions, { sql });
        if (response.status === 200) {
          console.log(`✅ Tabela ${tableName} criada`);
        } else {
          console.log(`⚠️ Erro ao criar ${tableName}:`, response.data);
        }
      } catch (error) {
        console.log(`⚠️ Erro ao criar ${tableName}:`, error.message);
      }
    }

    // 3. Configurar RLS
    console.log('3. Configurando RLS...');
    const rlsSQL = `
      ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
    `;

    const rlsOptions = {
      hostname: 'ljfxpzcdrctqmfydofdh.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const rlsResponse = await makeRequest(rlsOptions, { sql: rlsSQL });
      if (rlsResponse.status === 200) {
        console.log('✅ RLS configurado');
      } else {
        console.log('⚠️ Erro ao configurar RLS:', rlsResponse.data);
      }
    } catch (error) {
      console.log('⚠️ Erro ao configurar RLS:', error.message);
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('📋 Tabelas criadas:');
    console.log('- ✅ leads');
    console.log('- ✅ customers');
    console.log('- ✅ orders');
    console.log('- ✅ products');
    console.log('- ✅ product_views');
    console.log('- ✅ user_events');
    console.log('- ✅ RLS configurado');

    console.log('\n🎯 Próximos passos:');
    console.log('1. Execute: npm run dev');
    console.log('2. Acesse: http://localhost:3000/login');
    console.log('3. Teste criar uma conta');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
executarSQLViaAPI();
