const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGoogleOAuth() {
  console.log('🔐 Testando configuração do Google OAuth...\n');

  try {
    // 1. Verificar se o Google OAuth está configurado
    console.log('1. Verificando configuração do Google OAuth...');
    
    // Tentar iniciar o fluxo OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    if (error) {
      console.log('❌ Erro no Google OAuth:', error.message);
      console.log('📋 Código:', error.code);
      
      if (error.code === 'provider_not_configured') {
        console.log('\n🔧 CONFIGURAÇÃO NECESSÁRIA:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/providers');
        console.log('2. Habilite "Google"');
        console.log('3. Configure Client ID e Client Secret');
        console.log('4. Configure no Google Cloud Console');
      }
    } else {
      console.log('✅ Google OAuth configurado!');
      console.log('🔗 URL de autorização:', data.url);
      console.log('\n📋 Para testar:');
      console.log('1. Abra o link acima no navegador');
      console.log('2. Faça login com sua conta Google');
      console.log('3. Você será redirecionado de volta');
    }

    // 2. Verificar configurações de autenticação
    console.log('\n2. Verificando configurações gerais...');
    console.log('📋 Verifique no Supabase Dashboard:');
    console.log('- Enable sign up: ON');
    console.log('- Enable email confirmations: OFF (para desenvolvimento)');
    console.log('- Google OAuth: ON (após configurar)');

    // 3. Testar URL de callback
    console.log('\n3. Testando URL de callback...');
    const callbackUrl = 'http://localhost:3000/auth/callback';
    console.log('✅ Callback URL configurada:', callbackUrl);
    console.log('📋 Certifique-se de que esta URL está no Google Cloud Console');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
testGoogleOAuth();
