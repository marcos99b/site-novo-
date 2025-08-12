const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginNoConfirm() {
  console.log('🔐 Testando login sem confirmação de email...\n');

  try {
    // 1. Criar usuário de teste
    console.log('1. Criando usuário de teste...');
    const testEmail = `test-${Date.now()}@gmail.com`;
    const testPassword = 'Test123456!';
    
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Senha: ${testPassword}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
          full_name: 'Test User'
        }
      }
    });

    if (signupError) {
      console.log('❌ Erro no signup:', signupError.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log(`👤 Email: ${signupData.user?.email}`);
    console.log(`📧 Confirmado: ${signupData.user?.email_confirmed_at ? 'Sim' : 'Não'}`);

    // 2. Tentar fazer login imediatamente
    console.log('\n2. Tentando login imediato...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      console.log('📋 Código:', loginError.code);
      
      if (loginError.code === 'email_not_confirmed') {
        console.log('\n🔧 SOLUÇÃO:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/settings');
        console.log('2. Desative "Enable email confirmations"');
        console.log('3. Ou configure um email SMTP para envio de emails');
        console.log('4. Teste novamente o login');
      }
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`👤 Usuário logado: ${loginData.user?.email}`);
      
      // 3. Verificar se lead e customer foram criados
      console.log('\n3. Verificando lead e customer...');
      
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('email', testEmail);

      if (leadsError) {
        console.log('❌ Erro ao verificar leads:', leadsError.message);
      } else {
        console.log(`✅ Leads encontrados: ${leads?.length || 0}`);
      }

      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', testEmail);

      if (customersError) {
        console.log('❌ Erro ao verificar customers:', customersError.message);
      } else {
        console.log(`✅ Customers encontrados: ${customers?.length || 0}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
testLoginNoConfirm();
