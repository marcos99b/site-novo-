const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPhoneField() {
  console.log('📱 Testando campo de telefone...\n');

  try {
    // 1. Verificar se o campo phone existe nas tabelas
    console.log('1. Verificando estrutura das tabelas...');
    
    const { data: leadsStructure, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (leadsError) {
      console.log('❌ Erro ao verificar leads:', leadsError.message);
    } else {
      console.log('✅ Tabela leads OK');
      console.log('📋 Campos disponíveis:', Object.keys(leadsStructure[0] || {}));
    }

    const { data: customersStructure, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (customersError) {
      console.log('❌ Erro ao verificar customers:', customersError.message);
    } else {
      console.log('✅ Tabela customers OK');
      console.log('📋 Campos disponíveis:', Object.keys(customersStructure[0] || {}));
    }

    // 2. Criar usuário de teste com telefone
    console.log('\n2. Criando usuário de teste com telefone...');
    const testEmail = `test-phone-${Date.now()}@gmail.com`;
    const testPassword = 'Test123456!';
    const testName = 'Test User Phone';
    const testPhone = '(11) 99999-9999';
    
    console.log(`📧 Email: ${testEmail}`);
    console.log(`📱 Telefone: ${testPhone}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          full_name: testName,
          phone: testPhone
        }
      }
    });

    if (signupError) {
      console.log('❌ Erro no signup:', signupError.message);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log(`👤 Email: ${signupData.user?.email}`);
    console.log(`📱 Telefone nos metadados: ${signupData.user?.user_metadata?.phone}`);

    // 3. Verificar se lead foi criado com telefone
    console.log('\n3. Verificando lead criado...');
    const { data: leads, error: leadsCheckError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', testEmail);

    if (leadsCheckError) {
      console.log('❌ Erro ao verificar leads:', leadsCheckError.message);
    } else {
      console.log(`✅ Leads encontrados: ${leads?.length || 0}`);
      if (leads && leads.length > 0) {
        const lead = leads[0];
        console.log('📊 Lead criado:', {
          email: lead.email,
          name: lead.name,
          phone: lead.phone,
          status: lead.status
        });
      }
    }

    // 4. Verificar se customer foi criado com telefone
    console.log('\n4. Verificando customer criado...');
    const { data: customers, error: customersCheckError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', testEmail);

    if (customersCheckError) {
      console.log('❌ Erro ao verificar customers:', customersCheckError.message);
    } else {
      console.log(`✅ Customers encontrados: ${customers?.length || 0}`);
      if (customers && customers.length > 0) {
        const customer = customers[0];
        console.log('📊 Customer criado:', {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          status: customer.status
        });
      }
    }

    // 5. Testar login
    console.log('\n5. Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`👤 Usuário logado: ${loginData.user?.email}`);
      console.log(`📱 Telefone: ${loginData.user?.user_metadata?.phone}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
testPhoneField();
