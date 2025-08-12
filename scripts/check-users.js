const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  console.log('👥 Verificando usuários cadastrados...\n');

  try {
    // 1. Verificar usuários na tabela auth.users (via admin)
    console.log('1. Verificando usuários na autenticação...');
    
    // Como não temos acesso admin, vamos tentar fazer login com alguns emails de teste
    const testEmails = [
      'test1754764041531@gmail.com',
      'test1754764099889@gmail.com'
    ];

    for (const email of testEmails) {
      console.log(`\n📧 Testando login com: ${email}`);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'Test123456!'
        });

        if (error) {
          console.log(`❌ Erro: ${error.message}`);
          console.log(`📋 Código: ${error.code}`);
        } else {
          console.log(`✅ Login bem-sucedido!`);
          console.log(`👤 Usuário: ${data.user?.email}`);
          console.log(`📧 Confirmado: ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
          
          // Fazer logout
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.log(`❌ Erro geral: ${err.message}`);
      }
    }

    // 2. Verificar leads
    console.log('\n2. Verificando leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (leadsError) {
      console.log('❌ Erro ao buscar leads:', leadsError.message);
    } else {
      console.log(`✅ Leads encontrados: ${leads?.length || 0}`);
      leads?.forEach((lead, index) => {
        console.log(`   ${index + 1}. ${lead.email} - ${lead.name} (${lead.status})`);
      });
    }

    // 3. Verificar customers
    console.log('\n3. Verificando customers...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (customersError) {
      console.log('❌ Erro ao buscar customers:', customersError.message);
    } else {
      console.log(`✅ Customers encontrados: ${customers?.length || 0}`);
      customers?.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.email} - ${customer.name} (${customer.status})`);
      });
    }

    // 4. Criar um novo usuário de teste
    console.log('\n4. Criando novo usuário de teste...');
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
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`👤 Email: ${signupData.user?.email}`);
      console.log(`📧 Confirmado: ${signupData.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
      
      // Tentar fazer login imediatamente
      console.log('\n5. Testando login imediato...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (loginError) {
        console.log('❌ Erro no login:', loginError.message);
        console.log('📋 Código:', loginError.code);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log(`👤 Usuário logado: ${loginData.user?.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
checkUsers();
