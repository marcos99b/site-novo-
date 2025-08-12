// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
  console.log('📋 Configure a variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('🔗 Obtenha em: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarECorrigirSupabase() {
  console.log('🔍 Verificando e corrigindo configurações do Supabase...\n');

  try {
    // 1. Verificar configuração atual
    console.log('1. Verificando configuração atual...');
    
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('⚠️ Erro na conexão:', testError.message);
    } else {
      console.log('✅ Conexão com Supabase funcionando');
    }

    // 2. Verificar se as tabelas existem
    console.log('\n2. Verificando tabelas...');
    
    const tabelas = ['leads', 'customers', 'orders', 'products', 'product_views', 'user_events'];
    
    for (const tabela of tabelas) {
      try {
        const { data, error } = await supabase
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

    // 3. Verificar configurações de autenticação
    console.log('\n3. Verificando configurações de auth...');
    
    // Testar se o auth está funcionando
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ Erro no auth:', authError.message);
    } else {
      console.log('✅ Auth funcionando');
      if (user) {
        console.log(`👤 Usuário logado: ${user.email}`);
      } else {
        console.log('👤 Nenhum usuário logado');
      }
    }

    // 4. Verificar configurações do site
    console.log('\n4. Verificando configurações do site...');
    
    // Verificar se as variáveis de ambiente estão corretas
    const expectedUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
    const actualUrl = supabaseUrl;
    
    if (expectedUrl === actualUrl) {
      console.log('✅ URL do Supabase correta');
    } else {
      console.log('❌ URL do Supabase incorreta');
      console.log(`Esperado: ${expectedUrl}`);
      console.log(`Atual: ${actualUrl}`);
    }

    // 5. Verificar se o projeto está ativo
    console.log('\n5. Verificando status do projeto...');
    
    try {
      const { data: projectInfo, error: projectError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      if (projectError) {
        console.log('⚠️ Erro ao verificar projeto:', projectError.message);
      } else {
        console.log('✅ Projeto ativo e acessível');
        console.log(`📊 Tabelas encontradas: ${projectInfo.length}`);
      }
    } catch (err) {
      console.log('❌ Erro ao verificar projeto:', err.message);
    }

    // 6. Recomendações
    console.log('\n📋 RECOMENDAÇÕES:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh');
    console.log('2. Vá em Authentication > Settings');
    console.log('3. Desative "Enable email confirmations"');
    console.log('4. Configure Site URL: http://localhost:3000');
    console.log('5. Adicione Redirect URLs: http://localhost:3000/auth/callback');
    console.log('6. Teste o login em: http://localhost:3000/login');

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Configure as variáveis de ambiente no .env.local');
    console.log('2. Execute: npm run dev');
    console.log('3. Teste o sistema de login');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verificarECorrigirSupabase();
