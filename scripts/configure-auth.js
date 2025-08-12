const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function configureAuth() {
  console.log('🔧 Configurando Autenticação...\n');

  try {
    // 1. Verificar configuração atual
    console.log('1️⃣ Verificando configuração atual...');
    const { data: currentConfig, error: configError } = await supabase
      .from('auth.config')
      .select('*')
      .single();

    if (configError) {
      console.log('⚠️ Não foi possível verificar configuração atual (normal)');
    } else {
      console.log('📋 Configuração atual:', currentConfig);
    }

    // 2. Executar SQL de configuração
    console.log('\n2️⃣ Executando configuração de autenticação...');
    
    const configSQL = `
      -- Desativar confirmação de email
      UPDATE auth.config 
      SET email_confirm = false 
      WHERE id = 1;

      -- Habilitar signup
      UPDATE auth.config 
      SET enable_signup = true 
      WHERE id = 1;

      -- Configurar site URL
      UPDATE auth.config 
      SET site_url = 'http://localhost:3000' 
      WHERE id = 1;

      -- Configurar redirect URLs
      UPDATE auth.config 
      SET redirect_urls = ARRAY['http://localhost:3000/auth/callback', 'http://localhost:3000'] 
      WHERE id = 1;
    `;

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: configSQL });

    if (sqlError) {
      console.log('⚠️ Não foi possível executar SQL diretamente (normal em ambiente de desenvolvimento)');
      console.log('📝 Execute manualmente no dashboard do Supabase:');
      console.log('🌐 https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql');
      console.log('\n📋 SQL para executar:');
      console.log(configSQL);
    } else {
      console.log('✅ Configuração aplicada com sucesso!');
    }

    // 3. Testar configuração
    console.log('\n3️⃣ Testando nova configuração...');
    const testEmail = `teste-config-${Date.now()}@exemplo.com`;
    const testPassword = 'senha123456';
    const testName = 'Usuário Teste Config';

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
      console.error('❌ Erro no teste de cadastro:', signupError.message);
    } else {
      console.log('✅ Usuário de teste criado:', signupData.user?.email);
      console.log('✅ Sessão criada:', !!signupData.session);
      
      if (signupData.session) {
        console.log('🎉 CONFIGURAÇÃO FUNCIONANDO! Usuário logado automaticamente após cadastro!');
      } else {
        console.log('⚠️ Usuário criado mas não logado automaticamente');
      }
    }

    console.log('\n🎉 Configuração de Autenticação Concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o SQL no dashboard do Supabase se necessário');
    console.log('2. Teste o cadastro no site: http://localhost:3000/login');
    console.log('3. Verifique se o usuário fica logado automaticamente');

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
  }
}

// Executar configuração
configureAuth();
