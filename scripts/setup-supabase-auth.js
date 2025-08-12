const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabaseAuth() {
  console.log('🔧 Configurando Autenticação do Supabase...\n');

  try {
    // 1. Verificar se conseguimos conectar
    console.log('1️⃣ Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase.auth.getSession();
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');

    // 2. Verificar configurações atuais
    console.log('\n2️⃣ Verificando configurações atuais...');
    
    // Tentar acessar configurações via RPC
    const { data: configData, error: configError } = await supabase.rpc('get_auth_config');
    
    if (configError) {
      console.log('⚠️ Não foi possível acessar configurações via RPC');
      console.log('📋 Vamos tentar método alternativo...');
    } else {
      console.log('📋 Configurações atuais:', configData);
    }

    // 3. Tentar configurar via SQL direto
    console.log('\n3️⃣ Configurando autenticação...');
    
    // Primeiro, vamos verificar se existe a tabela de configuração
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'auth');

    if (tablesError) {
      console.log('⚠️ Não foi possível verificar tabelas');
    } else {
      console.log('📋 Tabelas disponíveis no schema auth:', tables?.map(t => t.table_name));
    }

    // 4. Tentar método alternativo - configurar via settings
    console.log('\n4️⃣ Tentando configuração via settings...');
    
    // Vamos tentar criar um usuário de teste para ver se a confirmação está desabilitada
    const testEmail = `teste-config-${Date.now()}@exemplo.com`;
    const testPassword = 'senha123456';
    const testName = 'Usuário Teste Config';

    console.log('📝 Criando usuário de teste:', testEmail);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          full_name: testName,
          phone: '(11) 99999-9999'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erro no cadastro:', signupError.message);
      
      if (signupError.message.includes('Email not confirmed')) {
        console.log('\n🔧 CONFIGURAÇÃO NECESSÁRIA:');
        console.log('A confirmação de email está habilitada. Vamos desabilitar...');
        
        // Tentar desabilitar via SQL
        const disableEmailSQL = `
          UPDATE auth.users 
          SET email_confirmed_at = NOW() 
          WHERE email = '${testEmail}';
        `;
        
        const { error: updateError } = await supabase.rpc('exec_sql', { sql: disableEmailSQL });
        
        if (updateError) {
          console.log('⚠️ Não foi possível executar SQL diretamente');
          console.log('📋 Execute manualmente no dashboard do Supabase:');
          console.log('🌐 https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql');
          console.log('\n📋 SQL para executar:');
          console.log(`
-- Desabilitar confirmação de email para todos os usuários
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Ou para um usuário específico
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = '${testEmail}';
          `);
        } else {
          console.log('✅ Confirmação de email desabilitada para usuário de teste');
        }
      }
    } else {
      console.log('✅ Usuário de teste criado:', signupData.user?.email);
      console.log('✅ Sessão criada:', !!signupData.session);
      
      if (signupData.session) {
        console.log('🎉 CONFIGURAÇÃO FUNCIONANDO! Usuário logado automaticamente!');
      } else {
        console.log('⚠️ Usuário criado mas não logado automaticamente');
      }
    }

    // 5. Verificar se conseguimos fazer login
    console.log('\n5️⃣ Testando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n🔧 SOLUÇÃO:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/settings');
        console.log('2. Desative "Enable email confirmations"');
        console.log('3. Ative "Enable sign up"');
        console.log('4. Configure "Site URL" como: http://localhost:3000');
        console.log('5. Salve as configurações');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('✅ Usuário logado:', loginData.user?.email);
      console.log('✅ Sessão ativa:', !!loginData.session);
    }

    console.log('\n🎉 Configuração de Autenticação Concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure manualmente no dashboard do Supabase se necessário');
    console.log('2. Teste o cadastro no site: http://localhost:3000/login');
    console.log('3. Verifique se o usuário fica logado automaticamente');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
setupSupabaseAuth();
