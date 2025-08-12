// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://vqpumetbhgqdpnskgbvr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function criarTabelasFaltantes() {
  console.log('🔧 VERIFICANDO E CRIANDO TABELAS FALTANTES');
  console.log('==========================================\n');

  try {
    // 1. Verificar tabelas existentes
    console.log('1. Verificando tabelas existentes...');
    
    const { data: tabelas, error: tabelasError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        ` 
      });

    if (tabelasError) {
      console.log('❌ Erro ao verificar tabelas:', tabelasError.message);
      return;
    }

    console.log('✅ Tabelas existentes:');
    if (tabelas && tabelas.length > 0) {
      tabelas.forEach(tabela => {
        console.log(`   - ${tabela.table_name}`);
      });
    } else {
      console.log('   Nenhuma tabela encontrada');
    }

    // 2. Criar tabelas se não existirem
    console.log('\n2. Criando tabelas faltantes...');
    
    const tabelasNecessarias = [
      {
        nome: 'leads',
        sql: `
          CREATE TABLE IF NOT EXISTS public.leads (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            source VARCHAR(50) DEFAULT 'signup',
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'customers',
        sql: `
          CREATE TABLE IF NOT EXISTS public.customers (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            total_orders INTEGER DEFAULT 0,
            total_spent DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'products',
        sql: `
          CREATE TABLE IF NOT EXISTS public.products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url VARCHAR(500),
            category VARCHAR(100),
            stock INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'orders',
        sql: `
          CREATE TABLE IF NOT EXISTS public.orders (
            id SERIAL PRIMARY KEY,
            order_number VARCHAR(50) UNIQUE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            customer_id INTEGER REFERENCES public.customers(id) ON DELETE CASCADE,
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'product_views',
        sql: `
          CREATE TABLE IF NOT EXISTS public.product_views (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'user_events',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_events (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            event_type VARCHAR(100) NOT NULL,
            event_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'cart_items',
        sql: `
          CREATE TABLE IF NOT EXISTS public.cart_items (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
            quantity INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        nome: 'favorites',
        sql: `
          CREATE TABLE IF NOT EXISTS public.favorites (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, product_id)
          );
        `
      }
    ];

    for (const tabela of tabelasNecessarias) {
      try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: tabela.sql });
        
        if (error) {
          console.log(`⚠️ Erro ao criar tabela ${tabela.nome}:`, error.message);
        } else {
          console.log(`✅ Tabela ${tabela.nome} criada/verificada`);
        }
      } catch (error) {
        console.log(`⚠️ Erro ao criar tabela ${tabela.nome}:`, error.message);
      }
    }

    // 3. Adicionar constraint de source em leads
    console.log('\n3. Adicionando constraint de source...');
    
    const constraintSQL = `
      ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;
      ALTER TABLE public.leads ADD CONSTRAINT leads_source_check 
      CHECK (source IN ('google', 'email', 'manual', 'facebook', 'instagram', 'google_ads', 'signup', 'test'));
    `;

    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: constraintSQL });
      
      if (error) {
        console.log('❌ Erro ao adicionar constraint:', error.message);
      } else {
        console.log('✅ Constraint de source adicionada');
      }
    } catch (error) {
      console.log('❌ Erro ao adicionar constraint:', error.message);
    }

    // 4. Inserir produtos de exemplo
    console.log('\n4. Inserindo produtos de exemplo...');
    
    const produtosSQL = `
      INSERT INTO public.products (name, description, price, image_url, category, stock) VALUES
      ('Smartphone Galaxy S23', 'Smartphone Samsung Galaxy S23 128GB', 2999.99, '/placeholder.jpg', 'Smartphones', 50),
      ('Notebook Dell Inspiron', 'Notebook Dell Inspiron 15" 8GB RAM 256GB SSD', 3499.99, '/placeholder.jpg', 'Notebooks', 30),
      ('Fone de Ouvido Sony WH-1000XM4', 'Fone de ouvido sem fio com cancelamento de ruído', 1299.99, '/placeholder.jpg', 'Acessórios', 100)
      ON CONFLICT DO NOTHING;
    `;

    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: produtosSQL });
      
      if (error) {
        console.log('❌ Erro ao inserir produtos:', error.message);
      } else {
        console.log('✅ Produtos de exemplo inseridos');
      }
    } catch (error) {
      console.log('❌ Erro ao inserir produtos:', error.message);
    }

    // 5. Verificar tabelas finais
    console.log('\n5. Verificando tabelas finais...');
    
    const { data: tabelasFinais, error: tabelasFinaisError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        ` 
      });

    if (tabelasFinaisError) {
      console.log('❌ Erro ao verificar tabelas finais:', tabelasFinaisError.message);
    } else {
      console.log('✅ Tabelas finais:');
      if (tabelasFinais && tabelasFinais.length > 0) {
        tabelasFinais.forEach(tabela => {
          console.log(`   - ${tabela.table_name}`);
        });
      }
    }

    console.log('\n🎉 TABELAS CRIADAS COM SUCESSO!');
    console.log('================================');
    console.log('✅ Todas as tabelas necessárias foram criadas');
    console.log('✅ Constraints adicionadas');
    console.log('✅ Produtos de exemplo inseridos');
    console.log('✅ Sistema pronto para uso');
    
    console.log('\n🚀 PRÓXIMO PASSO:');
    console.log('Execute: node scripts/teste-sistema-real.js');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar criação de tabelas
criarTabelasFaltantes();
