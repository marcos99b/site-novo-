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

async function confirmarUsuarioTeste() {
  console.log('🔧 CONFIRMANDO USUÁRIO DE TESTE');
  console.log('================================\n');

  try {
    // 1. Listar usuários
    console.log('1. Listando usuários...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Erro ao listar usuários:', usersError.message);
      return;
    }

    console.log(`✅ ${users.users.length} usuários encontrados`);
    
    // 2. Encontrar usuário não confirmado
    const unconfirmedUser = users.users.find(user => !user.confirmed_at);
    
    if (!unconfirmedUser) {
      console.log('✅ Todos os usuários já estão confirmados');
      return;
    }

    console.log(`📧 Usuário não confirmado: ${unconfirmedUser.email}`);

    // 3. Confirmar usuário
    console.log('\n2. Confirmando usuário...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      unconfirmedUser.id,
      { 
        email_confirm: true,
        user_metadata: {
          ...unconfirmedUser.user_metadata,
          email_confirmed_at: new Date().toISOString()
        }
      }
    );

    if (updateError) {
      console.log('❌ Erro ao confirmar usuário:', updateError.message);
      return;
    }

    console.log('✅ Usuário confirmado com sucesso!');
    console.log(`   - Email: ${updateData.user.email}`);
    console.log(`   - Confirmado em: ${updateData.user.confirmed_at}`);

    // 4. Verificar se o usuário foi confirmado
    console.log('\n3. Verificando confirmação...');
    const { data: verifyUsers, error: verifyError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (verifyError) {
      console.log('❌ Erro ao verificar usuários:', verifyError.message);
      return;
    }

    const confirmedUser = verifyUsers.users.find(user => user.email === unconfirmedUser.email);
    
    if (confirmedUser && confirmedUser.confirmed_at) {
      console.log('✅ Usuário confirmado com sucesso!');
      console.log(`   - Email: ${confirmedUser.email}`);
      console.log(`   - Status: Confirmado`);
      console.log(`   - Data: ${confirmedUser.confirmed_at}`);
      
      console.log('\n🎯 PRÓXIMOS PASSOS:');
      console.log('1. Configure o Supabase Dashboard:');
      console.log('   - Vá em: Authentication > Settings');
      console.log('   - Desative "Enable email confirmations"');
      console.log('   - Configure Site URL: http://localhost:3000');
      console.log('   - Adicione Redirect URLs:');
      console.log('     * http://localhost:3000/auth/callback');
      console.log('     * http://localhost:3000');
      
      console.log('\n2. Teste o login:');
      console.log('   - Acesse: http://localhost:3000/login');
      console.log(`   - Use o email: ${confirmedUser.email}`);
      console.log('   - Digite sua senha');
      console.log('   - Deve fazer login automaticamente');
      
      console.log('\n🚀 SISTEMA PRONTO PARA LOGIN AUTOMÁTICO!');
      
    } else {
      console.log('❌ Usuário ainda não confirmado');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar confirmação
confirmarUsuarioTeste();
