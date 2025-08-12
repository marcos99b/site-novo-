const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthReal() {
  console.log('🔐 Testando autenticação com email real...\n');

  try {
    // 1. Testar configuração básica
    console.log('1. Testando configuração básica...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Erro ao obter sessão:', sessionError.message);
    } else {
      console.log('✅ Configuração básica OK');
      console.log(`📊 Sessão ativa: ${session ? 'Sim' : 'Não'}`);
    }

    // 2. Testar signup com email real
    console.log('\n2. Testando signup com email real...');
    const testEmail = `test${Date.now()}@gmail.com`;
    const testPassword = 'Test123456!';
    
    console.log('📧 Email de teste:', testEmail);
    console.log('🔑 Senha de teste:', testPassword);
    
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
      console.log('📋 Código do erro:', signupError.code);
      console.log('📋 Status do erro:', signupError.status);
    } else {
      console.log('✅ Signup realizado com sucesso!');
      console.log('👤 Usuário:', signupData.user?.email);
      console.log('📧 Confirmação necessária:', signupData.user?.email_confirmed_at ? 'Não' : 'Sim');
      
      // 3. Testar se o lead foi criado
      console.log('\n3. Verificando se lead foi criado...');
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('email', testEmail);

      if (leadsError) {
        console.log('❌ Erro ao verificar leads:', leadsError.message);
      } else {
        console.log(`✅ Leads encontrados: ${leads?.length || 0}`);
        if (leads && leads.length > 0) {
          console.log('📊 Lead criado:', leads[0]);
        }
      }

      // 4. Testar se o customer foi criado
      console.log('\n4. Verificando se customer foi criado...');
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', testEmail);

      if (customersError) {
        console.log('❌ Erro ao verificar customers:', customersError.message);
      } else {
        console.log(`✅ Customers encontrados: ${customers?.length || 0}`);
        if (customers && customers.length > 0) {
          console.log('📊 Customer criado:', customers[0]);
        }
      }
    }

    // 5. Testar configurações de autenticação
    console.log('\n5. Verificando configurações de autenticação...');
    
    // Verificar se o signup está habilitado
    console.log('📋 Para verificar se o signup está habilitado:');
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/settings');
    console.log('📋 Verifique se "Enable sign up" está ativado');
    console.log('📋 Verifique se "Enable email confirmations" está configurado corretamente');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Executar o teste
testAuthReal();
