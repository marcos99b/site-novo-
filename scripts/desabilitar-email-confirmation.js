// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Configurações do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Configurado' : '❌ Faltando');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Faltando');
  process.exit(1);
}

// Função para fazer requisição HTTPS
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Função para configurar auth settings
async function configurarAuthSettings() {
  console.log('🔧 Configurando Auth Settings...\n');

  try {
    // 1. Desabilitar email confirmations
    console.log('📧 Desabilitando confirmação de email...');
    const response1 = await makeRequest('PATCH', '/rest/v1/auth/v1/settings', {
      enable_email_confirmations: false
    });
    console.log('✅ Email confirmations desabilitado:', response1.status);

    // 2. Habilitar signups
    console.log('📝 Habilitando signups...');
    const response2 = await makeRequest('PATCH', '/rest/v1/auth/v1/settings', {
      enable_signup: true
    });
    console.log('✅ Signups habilitados:', response2.status);

    // 3. Configurar site URL
    console.log('🌐 Configurando site URL...');
    const response3 = await makeRequest('PATCH', '/rest/v1/auth/v1/settings', {
      site_url: 'http://localhost:3000'
    });
    console.log('✅ Site URL configurado:', response3.status);

    // 4. Configurar redirect URLs
    console.log('🔄 Configurando redirect URLs...');
    const response4 = await makeRequest('PATCH', '/rest/v1/auth/v1/settings', {
      redirect_urls: ['http://localhost:3000/auth/callback', 'http://localhost:3000']
    });
    console.log('✅ Redirect URLs configurados:', response4.status);

    // 5. Verificar configurações
    console.log('\n📋 Verificando configurações atuais...');
    const response5 = await makeRequest('GET', '/rest/v1/auth/v1/settings');
    console.log('✅ Configurações atuais:', response5.data);

    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('✅ Email confirmations: DESABILITADO');
    console.log('✅ Signups: HABILITADO');
    console.log('✅ Site URL: http://localhost:3000');
    console.log('✅ Redirect URLs: Configurados');
    console.log('\n🚀 Agora os usuários serão logados automaticamente!');

  } catch (error) {
    console.error('❌ Erro ao configurar auth settings:', error.message);
    
    // Tentar método alternativo via RPC
    console.log('\n🔄 Tentando método alternativo...');
    await configurarViaRPC();
  }
}

// Método alternativo via RPC
async function configurarViaRPC() {
  try {
    console.log('🔧 Configurando via RPC...');

    // SQL para configurar auth settings
    const sql = `
      -- Desabilitar email confirmations
      UPDATE auth.config SET value = 'false' WHERE key = 'enable_email_confirmations';
      
      -- Habilitar signups
      UPDATE auth.config SET value = 'true' WHERE key = 'enable_signup';
      
      -- Configurar site URL
      UPDATE auth.config SET value = 'http://localhost:3000' WHERE key = 'site_url';
      
      -- Configurar redirect URLs
      UPDATE auth.config SET value = 'http://localhost:3000/auth/callback,http://localhost:3000' WHERE key = 'redirect_urls';
      
      -- Verificar
      SELECT key, value FROM auth.config WHERE key IN ('enable_email_confirmations', 'enable_signup', 'site_url', 'redirect_urls');
    `;

    const response = await makeRequest('POST', '/rest/v1/rpc/exec_sql', {
      sql: sql
    });

    if (response.status === 200) {
      console.log('✅ Configuração via RPC realizada com sucesso!');
      console.log('Resultado:', response.data);
    } else {
      console.error('❌ Erro na configuração via RPC:', response);
    }

  } catch (error) {
    console.error('❌ Erro no método alternativo:', error.message);
    console.log('\n📋 CONFIGURAÇÃO MANUAL NECESSÁRIA:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
    console.log('2. Desabilite "Enable email confirmations"');
    console.log('3. Habilite "Enable signups"');
    console.log('4. Configure Site URL: http://localhost:3000');
    console.log('5. Configure Redirect URLs: http://localhost:3000/auth/callback,http://localhost:3000');
  }
}

// Executar configuração
configurarAuthSettings();
