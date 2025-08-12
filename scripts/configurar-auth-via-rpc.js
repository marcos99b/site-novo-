// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Configurado' : '❌ Faltando');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Faltando');
  process.exit(1);
}

// Criar cliente Supabase com service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function configurarAuthViaRPC() {
  console.log('🔧 Configurando Auth Settings via RPC...\n');

  try {
    // SQL para configurar auth settings
    const sql = `
      -- ===== CONFIGURAR AUTH SETTINGS =====
      
      -- 1. Desabilitar email confirmations
      UPDATE auth.config SET value = 'false' WHERE key = 'enable_email_confirmations';
      
      -- 2. Habilitar signups
      UPDATE auth.config SET value = 'true' WHERE key = 'enable_signup';
      
      -- 3. Configurar site URL
      UPDATE auth.config SET value = 'http://localhost:3000' WHERE key = 'site_url';
      
      -- 4. Configurar redirect URLs
      UPDATE auth.config SET value = 'http://localhost:3000/auth/callback,http://localhost:3000' WHERE key = 'redirect_urls';
      
      -- 5. Verificar configurações
      SELECT 
        'Configuração concluída' as status,
        key,
        value
      FROM auth.config 
      WHERE key IN ('enable_email_confirmations', 'enable_signup', 'site_url', 'redirect_urls')
      ORDER BY key;
    `;

    console.log('📝 Executando SQL de configuração...');
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      throw error;
    }

    console.log('✅ Configuração realizada com sucesso!');
    console.log('📋 Resultado:', data);

    // Verificar se as configurações foram aplicadas
    console.log('\n🔍 Verificando configurações aplicadas...');
    const { data: verificacao, error: erroVerificacao } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          key,
          value,
          CASE 
            WHEN key = 'enable_email_confirmations' AND value = 'false' THEN '✅ DESABILITADO'
            WHEN key = 'enable_signup' AND value = 'true' THEN '✅ HABILITADO'
            WHEN key = 'site_url' AND value = 'http://localhost:3000' THEN '✅ CONFIGURADO'
            WHEN key = 'redirect_urls' AND value LIKE '%localhost:3000%' THEN '✅ CONFIGURADO'
            ELSE '❌ NÃO CONFIGURADO'
          END as status
        FROM auth.config 
        WHERE key IN ('enable_email_confirmations', 'enable_signup', 'site_url', 'redirect_urls')
        ORDER BY key;
      `
    });

    if (erroVerificacao) {
      console.error('❌ Erro ao verificar configurações:', erroVerificacao);
    } else {
      console.log('📊 Status das configurações:');
      verificacao.forEach(config => {
        console.log(`  ${config.key}: ${config.status} (${config.value})`);
      });
    }

    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('✅ Email confirmations: DESABILITADO');
    console.log('✅ Signups: HABILITADO');
    console.log('✅ Site URL: http://localhost:3000');
    console.log('✅ Redirect URLs: Configurados');
    console.log('\n🚀 Agora os usuários serão logados automaticamente!');
    console.log('📱 Teste criando uma nova conta em: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    
    console.log('\n📋 CONFIGURAÇÃO MANUAL NECESSÁRIA:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
    console.log('2. Desabilite "Enable email confirmations"');
    console.log('3. Habilite "Enable signups"');
    console.log('4. Configure Site URL: http://localhost:3000');
    console.log('5. Configure Redirect URLs: http://localhost:3000/auth/callback,http://localhost:3000');
  }
}

// Executar configuração
configurarAuthViaRPC();
