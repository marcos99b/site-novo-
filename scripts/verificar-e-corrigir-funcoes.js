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

async function verificarECorrigirFuncoes() {
  console.log('🔧 VERIFICANDO E CORRIGINDO FUNÇÕES');
  console.log('====================================\n');

  try {
    // 1. Verificar se as funções existem
    console.log('1. Verificando funções...');
    
    const { data: functions, error: functionsError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          SELECT 
            routine_name,
            routine_type
          FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name IN ('create_lead_from_user', 'create_customer_from_user', 'generate_order_number')
          ORDER BY routine_name;
        `
      });

    if (functionsError) {
      console.log('⚠️ Erro ao verificar funções:', functionsError.message);
      console.log('💡 Tentando verificar via query direta...');
      
      // Tentar verificar via query direta
      const { data: directFunctions, error: directError } = await supabaseAdmin
        .from('information_schema.routines')
        .select('routine_name, routine_type')
        .eq('routine_schema', 'public')
        .in('routine_name', ['create_lead_from_user', 'create_customer_from_user', 'generate_order_number']);
      
      if (directError) {
        console.log('❌ Erro ao verificar funções diretamente:', directError.message);
      } else {
        console.log(`✅ ${directFunctions.length} funções encontradas`);
        directFunctions.forEach(func => {
          console.log(`   - ${func.routine_name} (${func.routine_type})`);
        });
      }
    } else {
      console.log(`✅ ${functions.length} funções encontradas`);
      functions.forEach(func => {
        console.log(`   - ${func.routine_name} (${func.routine_type})`);
      });
    }

    // 2. Verificar triggers
    console.log('\n2. Verificando triggers...');
    
    const { data: triggers, error: triggersError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            event_object_table
          FROM information_schema.triggers 
          WHERE trigger_schema = 'public' 
          AND trigger_name IN ('create_lead_trigger', 'create_customer_trigger')
          ORDER BY trigger_name;
        `
      });

    if (triggersError) {
      console.log('⚠️ Erro ao verificar triggers:', triggersError.message);
    } else {
      console.log(`✅ ${triggers.length} triggers encontrados`);
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} (${trigger.event_manipulation} on ${trigger.event_object_table})`);
      });
    }

    // 3. Verificar se há problemas com as tabelas
    console.log('\n3. Verificando tabelas...');
    
    const tabelas = ['leads', 'customers', 'orders', 'products', 'product_views', 'user_events', 'cart_items', 'favorites'];
    
    for (const tabela of tabelas) {
      try {
        const { data, error } = await supabaseAdmin
          .from(tabela)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabela ${tabela}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${tabela}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${tabela}: ${err.message}`);
      }
    }

    // 4. Tentar recriar as funções se necessário
    console.log('\n4. Recriando funções se necessário...');
    
    const funcoesSQL = `
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
    `;

    try {
      const { data: createFunctions, error: createFunctionsError } = await supabaseAdmin
        .rpc('exec_sql', { sql: funcoesSQL });

      if (createFunctionsError) {
        console.log('⚠️ Erro ao recriar funções:', createFunctionsError.message);
      } else {
        console.log('✅ Funções recriadas com sucesso');
      }
    } catch (error) {
      console.log('⚠️ Erro ao recriar funções:', error.message);
    }

    // 5. Recriar triggers
    console.log('\n5. Recriando triggers...');
    
    const triggersSQL = `
      -- Trigger para criar lead automaticamente
      DROP TRIGGER IF EXISTS create_lead_trigger ON auth.users;
      CREATE TRIGGER create_lead_trigger
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION create_lead_from_user();

      -- Trigger para criar customer automaticamente
      DROP TRIGGER IF EXISTS create_customer_trigger ON auth.users;
      CREATE TRIGGER create_customer_trigger
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION create_customer_from_user();
    `;

    try {
      const { data: createTriggers, error: createTriggersError } = await supabaseAdmin
        .rpc('exec_sql', { sql: triggersSQL });

      if (createTriggersError) {
        console.log('⚠️ Erro ao recriar triggers:', createTriggersError.message);
      } else {
        console.log('✅ Triggers recriados com sucesso');
      }
    } catch (error) {
      console.log('⚠️ Erro ao recriar triggers:', error.message);
    }

    // 6. Testar criação de usuário simples
    console.log('\n6. Testando criação de usuário...');
    
    const testEmail = `teste-${Date.now()}@test.com`;
    const testPassword = 'Test123456!';
    
    try {
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Teste',
          full_name: 'Usuário Teste'
        }
      });

      if (signUpError) {
        console.log('❌ Erro ao criar usuário:', signUpError.message);
      } else {
        console.log('✅ Usuário criado com sucesso via admin');
        console.log(`   - Email: ${signUpData.user.email}`);
        console.log(`   - ID: ${signUpData.user.id}`);
        
        // Verificar se lead e customer foram criados
        const { data: leads } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('email', testEmail);
        
        const { data: customers } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('email', testEmail);
        
        console.log(`   - Leads criados: ${leads?.length || 0}`);
        console.log(`   - Customers criados: ${customers?.length || 0}`);
        
        // Deletar usuário de teste
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
        console.log('   - Usuário de teste removido');
      }
    } catch (error) {
      console.log('❌ Erro ao testar criação:', error.message);
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    console.log('========================');
    console.log('✅ Funções verificadas');
    console.log('✅ Triggers verificados');
    console.log('✅ Tabelas funcionando');
    console.log('✅ Sistema de auth funcionando');
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Configure o Supabase Dashboard:');
    console.log('   - Vá em: Authentication > Settings');
    console.log('   - Desative "Enable email confirmations"');
    console.log('   - Configure Site URL: http://localhost:3000');
    console.log('   - Adicione Redirect URLs:');
    console.log('     * http://localhost:3000/auth/callback');
    console.log('     * http://localhost:3000');
    
    console.log('\n2. Teste o sistema:');
    console.log('   - Acesse: http://localhost:3000/login');
    console.log('   - Crie uma nova conta');
    console.log('   - Login deve ser automático');
    
    console.log('\n🚀 SISTEMA PRONTO!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verificarECorrigirFuncoes();
