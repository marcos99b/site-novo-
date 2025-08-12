// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Configurado' : '❌ Faltando');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', ANON_KEY ? '✅ Configurado' : '❌ Faltando');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testarLoginReal() {
  console.log('🔍 Testando Login Real...\n');

  try {
    // 1. Verificar configurações de auth
    console.log('📋 Verificando configurações de auth...');
    const { data: authSettings, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Erro ao verificar auth:', authError);
    } else {
      console.log('✅ Auth configurado:', authSettings ? 'Sim' : 'Não');
    }

    // 2. Tentar criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `teste-${Date.now()}@techgear.com`;
    const password = 'Test123456!';
    const name = 'Usuário Teste';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          full_name: name
        }
      }
    });

    if (signUpError) {
      console.error('❌ Erro ao criar usuário:', signUpError.message);
      
      if (signUpError.message.includes('Email signups are disabled')) {
        console.log('🔧 SOLUÇÃO: Habilitar signups no Supabase Dashboard');
        console.log('📱 Acesse: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
        console.log('✅ Habilite "Enable signups"');
      }
      
      if (signUpError.message.includes('Email not confirmed')) {
        console.log('🔧 SOLUÇÃO: Desabilitar confirmação de email');
        console.log('📱 Acesse: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
        console.log('❌ Desabilite "Enable email confirmations"');
      }
      
      return;
    }

    if (signUpData.user) {
      console.log('✅ Usuário criado com sucesso!');
      console.log('📧 Email:', signUpData.user.email);
      console.log('🆔 ID:', signUpData.user.id);
      console.log('📅 Criado em:', signUpData.user.created_at);
      
      if (signUpData.session) {
        console.log('🎉 SESSÃO CRIADA AUTOMATICAMENTE!');
        console.log('✅ Login automático funcionando!');
      } else {
        console.log('⚠️ Sessão não criada automaticamente');
        console.log('🔧 Verificar configurações de auth');
      }
    }

    // 3. Verificar se usuário foi criado na tabela auth.users
    console.log('\n🔍 Verificando usuário na tabela auth.users...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (usersError) {
      console.log('ℹ️ Não foi possível verificar auth.users (normal)');
    } else {
      console.log('✅ Usuário encontrado na tabela auth.users');
    }

    // 4. Verificar se lead foi criado
    console.log('\n📊 Verificando se lead foi criado...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (leadsError) {
      console.error('❌ Erro ao verificar leads:', leadsError);
    } else if (leads && leads.length > 0) {
      console.log('✅ Lead criado automaticamente!');
      console.log('📋 Lead:', leads[0]);
    } else {
      console.log('⚠️ Lead não foi criado automaticamente');
    }

    // 5. Verificar se customer foi criado
    console.log('\n👤 Verificando se customer foi criado...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (customersError) {
      console.error('❌ Erro ao verificar customers:', customersError);
    } else if (customers && customers.length > 0) {
      console.log('✅ Customer criado automaticamente!');
      console.log('📋 Customer:', customers[0]);
    } else {
      console.log('⚠️ Customer não foi criado automaticamente');
    }

    console.log('\n🎯 RESUMO:');
    console.log('✅ Usuário criado:', signUpData.user ? 'Sim' : 'Não');
    console.log('✅ Sessão automática:', signUpData.session ? 'Sim' : 'Não');
    console.log('✅ Lead criado:', leads && leads.length > 0 ? 'Sim' : 'Não');
    console.log('✅ Customer criado:', customers && customers.length > 0 ? 'Sim' : 'Não');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testarLoginReal();
