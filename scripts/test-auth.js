const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔐 Testando autenticação do Supabase...\n');

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

    // 2. Testar signup com email
    console.log('\n2. Testando signup com email...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
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
      console.log('📋 Detalhes do erro:', signupError);
    } else {
      console.log('✅ Signup realizado com sucesso!');
      console.log('📧 Email:', testEmail);
      console.log('👤 Usuário:', signupData.user?.email);
      
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

      // 5. Limpar dados de teste
      console.log('\n5. Limpando dados de teste...');
      if (signupData.user) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(signupData.user.id);
        if (deleteError) {
          console.log('⚠️ Erro ao deletar usuário de teste:', deleteError.message);
        } else {
          console.log('✅ Usuário de teste deletado');
        }
      }
    }

    // 6. Testar configurações de autenticação
    console.log('\n6. Verificando configurações de autenticação...');
    const { data: authSettings, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Erro ao verificar configurações de auth:', authError.message);
    } else {
      console.log('✅ Configurações de auth OK');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Executar o teste
testAuth();
