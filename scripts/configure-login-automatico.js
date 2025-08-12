const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  console.log('📋 Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY');
  console.log('🔗 Obtenha em: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configureLoginAutomatico() {
  console.log('🎯 Configurando Login Automático no Supabase...\n');

  try {
    // 1. Desativar confirmação de email
    console.log('1. Desativando confirmação de email...');
    const { error: emailError } = await supabase
      .from('auth.config')
      .update({ email_confirm: false })
      .eq('id', 1);

    if (emailError) {
      console.log('⚠️ Erro ao desativar email confirm:', emailError.message);
    } else {
      console.log('✅ Confirmação de email desativada');
    }

    // 2. Habilitar signup
    console.log('2. Habilitando signup...');
    const { error: signupError } = await supabase
      .from('auth.config')
      .update({ enable_signup: true })
      .eq('id', 1);

    if (signupError) {
      console.log('⚠️ Erro ao habilitar signup:', signupError.message);
    } else {
      console.log('✅ Signup habilitado');
    }

    // 3. Configurar site URL
    console.log('3. Configurando site URL...');
    const { error: urlError } = await supabase
      .from('auth.config')
      .update({ site_url: 'http://localhost:3000' })
      .eq('id', 1);

    if (urlError) {
      console.log('⚠️ Erro ao configurar site URL:', urlError.message);
    } else {
      console.log('✅ Site URL configurada');
    }

    // 4. Configurar redirect URLs
    console.log('4. Configurando redirect URLs...');
    const { error: redirectError } = await supabase
      .from('auth.config')
      .update({ 
        redirect_urls: ['http://localhost:3000/auth/callback', 'http://localhost:3000'] 
      })
      .eq('id', 1);

    if (redirectError) {
      console.log('⚠️ Erro ao configurar redirect URLs:', redirectError.message);
    } else {
      console.log('✅ Redirect URLs configuradas');
    }

    // 5. Verificar configuração atual
    console.log('\n5. Verificando configuração atual...');
    const { data: config, error: checkError } = await supabase
      .from('auth.config')
      .select('email_confirm, enable_signup, site_url, redirect_urls')
      .eq('id', 1)
      .single();

    if (checkError) {
      console.log('⚠️ Erro ao verificar configuração:', checkError.message);
    } else {
      console.log('📋 Configuração atual:');
      console.log('- Email confirm:', config.email_confirm ? '✅ ATIVO' : '❌ DESATIVADO');
      console.log('- Signup:', config.enable_signup ? '✅ HABILITADO' : '❌ DESABILITADO');
      console.log('- Site URL:', config.site_url);
      console.log('- Redirect URLs:', config.redirect_urls);
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('🌐 Teste em: http://localhost:3000/login');
    console.log('📱 Crie uma conta e será automaticamente logado');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
configureLoginAutomatico();
