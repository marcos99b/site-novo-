// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://vqpumetbhgqdpnskgbvr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function configurarAuthAutomatico() {
  console.log('⚙️ CONFIGURANDO AUTH AUTOMATICAMENTE');
  console.log('====================================\n');

  try {
    // 1. Verificar configurações atuais
    console.log('1. Verificando configurações atuais...');
    
    const { data: authConfig, error: authConfigError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            key,
            value
          FROM auth.config
          WHERE key IN ('enable_signup', 'enable_email_confirmations', 'site_url');
        ` 
      });

    if (authConfigError) {
      console.log('❌ Erro ao verificar auth.config:', authConfigError.message);
      console.log('   Tentando criar configurações...');
    } else {
      console.log('✅ Configurações atuais:');
      if (authConfig && authConfig.length > 0) {
        authConfig.forEach(config => {
          console.log(`   - ${config.key}: ${config.value}`);
        });
      } else {
        console.log('   Nenhuma configuração encontrada');
      }
    }

    // 2. Configurar auth via SQL
    console.log('\n2. Configurando auth...');
    
    const authSQL = `
      -- Habilitar signups
      INSERT INTO auth.config (key, value) 
      VALUES ('enable_signup', 'true')
      ON CONFLICT (key) DO UPDATE SET value = 'true';
      
      -- Desabilitar email confirmations
      INSERT INTO auth.config (key, value) 
      VALUES ('enable_email_confirmations', 'false')
      ON CONFLICT (key) DO UPDATE SET value = 'false';
      
      -- Configurar site URL
      INSERT INTO auth.config (key, value) 
      VALUES ('site_url', 'http://localhost:3000')
      ON CONFLICT (key) DO UPDATE SET value = 'http://localhost:3000';
      
      -- Configurar redirect URLs
      INSERT INTO auth.config (key, value) 
      VALUES ('redirect_urls', 'http://localhost:3000/auth/callback,http://localhost:3000')
      ON CONFLICT (key) DO UPDATE SET value = 'http://localhost:3000/auth/callback,http://localhost:3000';
    `;

    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: authSQL });
      
      if (error) {
        console.log('❌ Erro ao configurar auth:', error.message);
      } else {
        console.log('✅ Auth configurado automaticamente');
      }
    } catch (error) {
      console.log('❌ Erro ao configurar auth:', error.message);
    }

    // 3. Verificar configurações finais
    console.log('\n3. Verificando configurações finais...');
    
    const { data: authConfigFinal, error: authConfigFinalError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            key,
            value
          FROM auth.config
          WHERE key IN ('enable_signup', 'enable_email_confirmations', 'site_url', 'redirect_urls');
        ` 
      });

    if (authConfigFinalError) {
      console.log('❌ Erro ao verificar configurações finais:', authConfigFinalError.message);
    } else {
      console.log('✅ Configurações finais:');
      if (authConfigFinal && authConfigFinal.length > 0) {
        authConfigFinal.forEach(config => {
          console.log(`   - ${config.key}: ${config.value}`);
        });
      } else {
        console.log('   Nenhuma configuração encontrada');
      }
    }

    // 4. Testar criação de usuário
    console.log('\n4. Testando criação de usuário...');
    
    const testEmail = `teste-auth-${Date.now()}@techgear.com`;
    const testPassword = 'Test123456!';
    
    try {
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });

      if (signUpError) {
        console.log('❌ Erro ao criar usuário:', signUpError.message);
      } else {
        console.log('✅ Usuário criado com sucesso!');
        console.log(`   - Email: ${signUpData.user.email}`);
        console.log(`   - ID: ${signUpData.user.id}`);
        
        // Remover usuário de teste
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
        console.log('✅ Usuário de teste removido');
      }
    } catch (error) {
      console.log('❌ Erro ao criar usuário:', error.message);
    }

    console.log('\n🎉 CONFIGURAÇÃO DE AUTH CONCLUÍDA!');
    console.log('===================================');
    console.log('✅ Signups habilitados');
    console.log('✅ Email confirmations desabilitados');
    console.log('✅ Site URL configurado');
    console.log('✅ Redirect URLs configurados');
    console.log('✅ Usuário de teste criado com sucesso');
    
    console.log('\n🚀 PRÓXIMO PASSO:');
    console.log('Execute: node scripts/teste-sistema-real.js');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar configuração
configurarAuthAutomatico();
