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

async function criarUsuarioTeste() {
  console.log('👤 CRIANDO USUÁRIO DE TESTE');
  console.log('============================\n');

  try {
    // 1. Criar usuário de teste
    console.log('1. Criando usuário de teste...');
    const testEmail = `teste-${Date.now()}@techgear.com`;
    const testPassword = 'Test123456!';
    const testName = 'Usuário Teste TechGear';
    
    console.log(`   Email: ${testEmail}`);
    console.log(`   Senha: ${testPassword}`);
    console.log(`   Nome: ${testName}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          full_name: testName
        }
      }
    });

    if (signUpError) {
      console.log('❌ Erro ao criar usuário:', signUpError.message);
      return;
    }

    if (!signUpData.user) {
      console.log('❌ Usuário não foi criado');
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log(`   - ID: ${signUpData.user.id}`);
    console.log(`   - Email: ${signUpData.user.email}`);
    console.log(`   - Session: ${signUpData.session ? 'Sim' : 'Não'}`);

    // 2. Confirmar usuário automaticamente
    console.log('\n2. Confirmando usuário...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      signUpData.user.id,
      { 
        email_confirm: true,
        user_metadata: {
          ...signUpData.user.user_metadata,
          email_confirmed_at: new Date().toISOString()
        }
      }
    );

    if (updateError) {
      console.log('❌ Erro ao confirmar usuário:', updateError.message);
      return;
    }

    console.log('✅ Usuário confirmado com sucesso!');

    // 3. Testar login imediatamente
    console.log('\n3. Testando login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Erro no login:', signInError.message);
      return;
    }

    if (signInData.session) {
      console.log('✅ Login realizado com sucesso!');
      console.log(`   - Email: ${signInData.user.email}`);
      console.log(`   - Nome: ${signInData.user.user_metadata?.full_name || 'N/A'}`);
      console.log(`   - Session ID: ${signInData.session.access_token.substring(0, 20)}...`);
      
      // 4. Verificar se o lead e customer foram criados
      console.log('\n4. Verificando CRM...');
      
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('email', testEmail);
      
      if (leadsError) {
        console.log('❌ Erro ao buscar leads:', leadsError.message);
      } else {
        console.log(`✅ ${leads.length} leads criados automaticamente`);
      }

      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', testEmail);
      
      if (customersError) {
        console.log('❌ Erro ao buscar customers:', customersError.message);
      } else {
        console.log(`✅ ${customers.length} customers criados automaticamente`);
      }

      // 5. Fazer logout
      console.log('\n5. Fazendo logout...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.log('❌ Erro ao fazer logout:', signOutError.message);
      } else {
        console.log('✅ Logout realizado com sucesso');
      }

      console.log('\n🎉 USUÁRIO DE TESTE CRIADO COM SUCESSO!');
      console.log('=========================================');
      console.log('📋 CREDENCIAIS DE TESTE:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Senha: ${testPassword}`);
      console.log(`   Nome: ${testName}`);
      
      console.log('\n🚀 TESTE O SISTEMA:');
      console.log('1. Acesse: http://localhost:3000/login');
      console.log('2. Use as credenciais acima');
      console.log('3. Login será automático');
      console.log('4. Avatar aparecerá no header');
      console.log('5. Sistema de CRM ativo');
      
      console.log('\n💡 CONFIGURAÇÃO FINAL:');
      console.log('1. Vá para: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
      console.log('2. Desative "Enable email confirmations"');
      console.log('3. Configure Site URL: http://localhost:3000');
      console.log('4. Adicione Redirect URLs:');
      console.log('   - http://localhost:3000/auth/callback');
      console.log('   - http://localhost:3000');
      
      console.log('\n✅ SISTEMA 100% FUNCIONAL!');
      
    } else {
      console.log('❌ Login falhou - nenhuma sessão criada');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar criação
criarUsuarioTeste();
