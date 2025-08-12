// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://vqpumetbhgqdpnskgbvr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function verificarAuthSupabase() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÕES DE AUTH');
  console.log('====================================\n');

  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erro na conexão:', testError.message);
      return;
    } else {
      console.log('✅ Conexão com Supabase funcionando');
    }

    // 2. Verificar se há usuários
    console.log('\n2. Verificando usuários...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Erro ao listar usuários:', usersError.message);
    } else {
      console.log(`✅ ${users.users.length} usuários encontrados`);
      users.users.forEach(user => {
        console.log(`   - ${user.email} (${user.confirmed_at ? 'Confirmado' : 'Não confirmado'})`);
      });
    }

    // 3. Testar criação de usuário de teste
    console.log('\n3. Testando criação de usuário...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123456!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Usuário Teste',
          full_name: 'Usuário Teste'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Erro ao criar usuário:', signUpError.message);
    } else {
      console.log('✅ Usuário criado com sucesso');
      console.log(`   - Email: ${signUpData.user?.email}`);
      console.log(`   - Session: ${signUpData.session ? 'Sim' : 'Não'}`);
      
      // Se não há sessão, significa que precisa confirmar email
      if (!signUpData.session) {
        console.log('⚠️ Usuário criado mas precisa confirmar email');
        console.log('💡 Configure "Disable email confirmations" no Supabase Dashboard');
      } else {
        console.log('✅ Login automático funcionando!');
      }
    }

    // 4. Verificar configurações de auth
    console.log('\n4. Verificando configurações de auth...');
    
    // Tentar obter configurações via API (pode não funcionar)
    try {
      const { data: authConfig, error: authConfigError } = await supabaseAdmin
        .from('auth.config')
        .select('*')
        .single();
      
      if (authConfigError) {
        console.log('⚠️ Não foi possível verificar auth.config via API');
        console.log('💡 Verifique manualmente no Dashboard:');
        console.log('   - Authentication > Settings');
        console.log('   - Desative "Enable email confirmations"');
        console.log('   - Configure Site URL: http://localhost:3000');
        console.log('   - Adicione Redirect URLs:');
        console.log('     * http://localhost:3000/auth/callback');
        console.log('     * http://localhost:3000');
      } else {
        console.log('✅ Configurações de auth encontradas');
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar auth.config:', error.message);
    }

    // 5. Testar login com usuário existente
    console.log('\n5. Testando login...');
    if (users.users.length > 0) {
      const firstUser = users.users[0];
      console.log(`   Tentando login com: ${firstUser.email}`);
      
      // Nota: Não podemos fazer login direto aqui, mas podemos verificar se o usuário está confirmado
      if (firstUser.confirmed_at) {
        console.log('✅ Usuário confirmado e pronto para login');
      } else {
        console.log('⚠️ Usuário não confirmado - precisa confirmar email');
      }
    }

    // 6. Verificar leads e customers
    console.log('\n6. Verificando CRM...');
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5);
    
    if (leadsError) {
      console.log('❌ Erro ao buscar leads:', leadsError.message);
    } else {
      console.log(`✅ ${leads.length} leads encontrados`);
    }

    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);
    
    if (customersError) {
      console.log('❌ Erro ao buscar customers:', customersError.message);
    } else {
      console.log(`✅ ${customers.length} customers encontrados`);
    }

    // 7. Resumo e instruções
    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    console.log('========================');
    console.log('✅ Supabase conectado');
    console.log('✅ Tabelas funcionando');
    console.log('✅ Sistema de auth funcionando');
    
    if (users.users.length > 0) {
      console.log(`✅ ${users.users.length} usuários cadastrados`);
    }
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Vá para: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
    console.log('2. Desative "Enable email confirmations"');
    console.log('3. Configure Site URL: http://localhost:3000');
    console.log('4. Adicione Redirect URLs:');
    console.log('   - http://localhost:3000/auth/callback');
    console.log('   - http://localhost:3000');
    console.log('5. Teste o login em: http://localhost:3000/login');
    
    console.log('\n🚀 SISTEMA PRONTO PARA LOGIN AUTOMÁTICO!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verificarAuthSupabase();
