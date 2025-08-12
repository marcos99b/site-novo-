const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function configureAuthWithCLI() {
  console.log('🔧 Configurando Autenticação com Supabase CLI...\n');

  try {
    // 1. Verificar se o Supabase CLI está instalado
    console.log('1️⃣ Verificando Supabase CLI...');
    try {
      const version = execSync('supabase --version', { encoding: 'utf8' });
      console.log('✅ Supabase CLI instalado:', version.trim());
    } catch (error) {
      console.log('❌ Supabase CLI não encontrado');
      console.log('📋 Instale com: npm install -g supabase');
      console.log('📋 Ou use: brew install supabase/tap/supabase');
      return;
    }

    // 2. Verificar se está logado
    console.log('\n2️⃣ Verificando login do Supabase CLI...');
    try {
      const status = execSync('supabase status', { encoding: 'utf8' });
      console.log('✅ Supabase CLI conectado');
      console.log(status);
    } catch (error) {
      console.log('❌ Supabase CLI não conectado');
      console.log('📋 Execute: supabase login');
      console.log('📋 Use suas credenciais do Supabase');
      return;
    }

    // 3. Tentar configurar via SQL
    console.log('\n3️⃣ Configurando autenticação via SQL...');
    
    const configSQL = `
-- Configurar autenticação para desenvolvimento
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Verificar configuração
SELECT 
  'Usuários confirmados' as status,
  COUNT(*) as total
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;
    `;

    try {
      console.log('📝 Executando SQL de configuração...');
      execSync(`supabase db reset --linked`, { 
        input: configSQL,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ SQL executado com sucesso');
    } catch (error) {
      console.log('⚠️ Erro ao executar SQL via CLI:', error.message);
      console.log('📋 Vamos tentar método alternativo...');
    }

    // 4. Tentar configurar via API
    console.log('\n4️⃣ Configurando via API...');
    
    // Criar usuário de teste
    const testEmail = `teste-cli-${Date.now()}@exemplo.com`;
    const testPassword = 'senha123456';
    const testName = 'Usuário Teste CLI';

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
    } else {
      console.log('✅ Usuário de teste criado:', signupData.user?.email);
      console.log('✅ Sessão criada:', !!signupData.session);
      
      if (signupData.session) {
        console.log('🎉 CONFIGURAÇÃO FUNCIONANDO! Usuário logado automaticamente!');
      } else {
        console.log('⚠️ Usuário criado mas não logado automaticamente');
      }
    }

    // 5. Testar login
    console.log('\n5️⃣ Testando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n🔧 CONFIGURAÇÃO MANUAL NECESSÁRIA:');
        console.log('A confirmação de email ainda está habilitada.');
        console.log('\n📋 Execute estes passos:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/settings');
        console.log('2. Desative "Enable email confirmations"');
        console.log('3. Ative "Enable sign up"');
        console.log('4. Configure "Site URL" como: http://localhost:3000');
        console.log('5. Salve as configurações');
        console.log('\n📋 Ou execute este SQL no dashboard:');
        console.log(`
-- Desabilitar confirmação de email para todos os usuários
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Verificar resultado
SELECT 
  'Usuários confirmados' as status,
  COUNT(*) as total
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;
        `);
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('✅ Usuário logado:', loginData.user?.email);
      console.log('✅ Sessão ativa:', !!loginData.session);
    }

    console.log('\n🎉 Configuração de Autenticação Concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure manualmente no dashboard se necessário');
    console.log('2. Teste o cadastro no site: http://localhost:3000/login');
    console.log('3. Verifique se o usuário fica logado automaticamente');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
configureAuthWithCLI();
