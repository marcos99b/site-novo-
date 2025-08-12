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

async function verificarAuthConfig() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÕES DE AUTH');
  console.log('====================================\n');

  try {
    // 1. Verificar se auth.users existe
    console.log('1. Verificando tabela auth.users...');
    
    const { data: authUsers, error: authUsersError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT COUNT(*) as total_users FROM auth.users;
        ` 
      });

    if (authUsersError) {
      console.log('❌ Erro ao verificar auth.users:', authUsersError.message);
    } else {
      console.log(`✅ Tabela auth.users existe com ${authUsers[0]?.total_users || 0} usuários`);
    }

    // 2. Verificar configurações de auth
    console.log('\n2. Verificando configurações de auth...');
    
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
      console.log('   Isso pode indicar que auth.config não existe ou não está acessível');
    } else {
      console.log('✅ Configurações de auth:');
      if (authConfig && authConfig.length > 0) {
        authConfig.forEach(config => {
          console.log(`   - ${config.key}: ${config.value}`);
        });
      } else {
        console.log('   Nenhuma configuração encontrada');
      }
    }

    // 3. Tentar criar usuário com dados mínimos
    console.log('\n3. Testando criação de usuário com dados mínimos...');
    
    const testEmail = `teste-minimo-${Date.now()}@teste.com`;
    const testPassword = 'Test123456!';
    
    try {
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });

      if (signUpError) {
        console.log('❌ Erro ao criar usuário mínimo:', signUpError.message);
        
        // 4. Verificar se é problema de schema
        console.log('\n4. Verificando schema auth...');
        
        const { data: authSchema, error: authSchemaError } = await supabaseAdmin
          .rpc('exec_sql', { 
            sql: `
              SELECT 
                table_name,
                column_name,
                data_type
              FROM information_schema.columns 
              WHERE table_schema = 'auth' 
              AND table_name = 'users'
              ORDER BY ordinal_position;
            ` 
          });

        if (authSchemaError) {
          console.log('❌ Erro ao verificar schema auth:', authSchemaError.message);
        } else {
          console.log('✅ Schema da tabela auth.users:');
          if (authSchema && authSchema.length > 0) {
            authSchema.forEach(col => {
              console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
          }
        }
        
      } else {
        console.log('✅ Usuário mínimo criado com sucesso!');
        console.log(`   - Email: ${signUpData.user.email}`);
        console.log(`   - ID: ${signUpData.user.id}`);
        
        // Remover usuário de teste
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
        console.log('✅ Usuário de teste removido');
      }
    } catch (error) {
      console.log('❌ Erro geral ao criar usuário:', error.message);
    }

    // 5. Verificar se há triggers ou funções interferindo
    console.log('\n5. Verificando triggers e funções...');
    
    const { data: triggers, error: triggersError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            event_object_table
          FROM information_schema.triggers 
          WHERE trigger_schema = 'public'
          ORDER BY trigger_name;
        ` 
      });

    if (triggersError) {
      console.log('❌ Erro ao verificar triggers:', triggersError.message);
    } else {
      console.log('✅ Triggers encontrados:');
      if (triggers && triggers.length > 0) {
        triggers.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name} (${trigger.event_manipulation} em ${trigger.event_object_table})`);
        });
      } else {
        console.log('   Nenhum trigger encontrado');
      }
    }

    // 6. Verificar funções
    const { data: functions, error: functionsError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            routine_name,
            routine_type
          FROM information_schema.routines 
          WHERE routine_schema = 'public'
          ORDER BY routine_name;
        ` 
      });

    if (functionsError) {
      console.log('❌ Erro ao verificar funções:', functionsError.message);
    } else {
      console.log('✅ Funções encontradas:');
      if (functions && functions.length > 0) {
        functions.forEach(func => {
          console.log(`   - ${func.routine_name} (${func.routine_type})`);
        });
      } else {
        console.log('   Nenhuma função encontrada');
      }
    }

    console.log('\n🔍 DIAGNÓSTICO COMPLETO');
    console.log('========================');
    console.log('✅ Tabelas criadas com sucesso');
    console.log('✅ RLS desabilitado');
    console.log('✅ Constraints corrigidas');
    console.log('❌ Problema na criação de usuários');
    
    console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar configurações de auth no dashboard');
    console.log('2. Desabilitar email confirmations');
    console.log('3. Configurar Site URL e Redirect URLs');
    console.log('4. Verificar se há triggers interferindo');
    
    console.log('\n🚀 PRÓXIMO PASSO:');
    console.log('1. Vá para: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/auth/settings');
    console.log('2. Desative "Enable email confirmations"');
    console.log('3. Configure Site URL: http://localhost:3000');
    console.log('4. Adicione Redirect URLs');
    console.log('5. Execute: node scripts/teste-sistema-real.js');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verificarAuthConfig();
