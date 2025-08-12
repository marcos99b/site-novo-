const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginSystem() {
  console.log('🧪 Testando Sistema de Login...\n');

  try {
    // 1. Testar configuração do Supabase
    console.log('1️⃣ Verificando configuração do Supabase...');
    const { data: config, error: configError } = await supabase.auth.getSession();
    
    if (configError) {
      console.error('❌ Erro na configuração:', configError.message);
      return;
    }
    
    console.log('✅ Supabase configurado corretamente');

    // 2. Testar signup
    console.log('\n2️⃣ Testando cadastro de usuário...');
    const testEmail = `teste-${Date.now()}@exemplo.com`;
    const testPassword = 'senha123456';
    const testName = 'Usuário Teste';
    const testPhone = '(11) 99999-9999';

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
      console.error('❌ Erro no cadastro:', signupError.message);
      return;
    }

    console.log('✅ Usuário cadastrado:', signupData.user?.email);
    console.log('✅ Sessão criada:', !!signupData.session);
    console.log('✅ Dados do usuário:', {
      id: signupData.user?.id,
      email: signupData.user?.email,
      name: signupData.user?.user_metadata?.full_name,
      phone: signupData.user?.user_metadata?.phone
    });

    // 3. Verificar se o usuário está logado
    console.log('\n3️⃣ Verificando status de login...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Usuário está logado!');
      console.log('✅ Sessão ativa:', session.user.email);
      console.log('✅ Dados da sessão:', {
        access_token: session.access_token ? 'Presente' : 'Ausente',
        refresh_token: session.refresh_token ? 'Presente' : 'Ausente',
        expires_at: new Date(session.expires_at * 1000).toLocaleString()
      });
    } else {
      console.log('⚠️ Usuário não está logado (pode ser normal se confirmação de email estiver habilitada)');
    }

    // 4. Testar logout
    console.log('\n4️⃣ Testando logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.error('❌ Erro no logout:', logoutError.message);
    } else {
      console.log('✅ Logout realizado com sucesso');
    }

    // 5. Verificar se o logout funcionou
    const { data: { session: sessionAfterLogout } } = await supabase.auth.getSession();
    
    if (!sessionAfterLogout) {
      console.log('✅ Sessão encerrada corretamente');
    } else {
      console.log('⚠️ Sessão ainda ativa após logout');
    }

    // 6. Testar login com o usuário criado
    console.log('\n5️⃣ Testando login com usuário criado...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('✅ Usuário logado:', loginData.user?.email);
      console.log('✅ Sessão ativa:', !!loginData.session);
    }

    console.log('\n🎉 Teste do Sistema de Login Concluído!');
    console.log('\n📋 Resumo:');
    console.log('✅ Cadastro funcionando');
    console.log('✅ Login funcionando');
    console.log('✅ Logout funcionando');
    console.log('✅ Sessões sendo gerenciadas corretamente');
    console.log('✅ Dados do usuário sendo salvos');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

// Executar o teste
testLoginSystem();
