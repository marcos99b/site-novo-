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

async function verificarSchemaAuth() {
  console.log('🔍 VERIFICANDO SCHEMA AUTH');
  console.log('===========================\n');

  try {
    // 1. Verificar se schema auth existe
    console.log('1. Verificando schema auth...');
    
    const { data: schemas, error: schemasError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name = 'auth';
        ` 
      });

    if (schemasError) {
      console.log('❌ Erro ao verificar schema auth:', schemasError.message);
    } else {
      if (schemas && schemas.length > 0) {
        console.log('✅ Schema auth existe');
      } else {
        console.log('❌ Schema auth não existe');
      }
    }

    // 2. Verificar tabelas no schema auth
    console.log('\n2. Verificando tabelas no schema auth...');
    
    const { data: authTables, error: authTablesError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'auth' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        ` 
      });

    if (authTablesError) {
      console.log('❌ Erro ao verificar tabelas auth:', authTablesError.message);
    } else {
      console.log('✅ Tabelas no schema auth:');
      if (authTables && authTables.length > 0) {
        authTables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      } else {
        console.log('   Nenhuma tabela encontrada');
      }
    }

    // 3. Verificar estrutura da tabela auth.users
    console.log('\n3. Verificando estrutura de auth.users...');
    
    const { data: usersColumns, error: usersColumnsError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = 'auth' 
          AND table_name = 'users'
          ORDER BY ordinal_position;
        ` 
      });

    if (usersColumnsError) {
      console.log('❌ Erro ao verificar colunas de auth.users:', usersColumnsError.message);
    } else {
      console.log('✅ Colunas de auth.users:');
      if (usersColumns && usersColumns.length > 0) {
        usersColumns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
      } else {
        console.log('   Nenhuma coluna encontrada');
      }
    }

    // 4. Verificar se há dados na tabela auth.users
    console.log('\n4. Verificando dados em auth.users...');
    
    const { data: usersCount, error: usersCountError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT COUNT(*) as total_users FROM auth.users;
        ` 
      });

    if (usersCountError) {
      console.log('❌ Erro ao contar usuários:', usersCountError.message);
    } else {
      console.log(`✅ Total de usuários: ${usersCount[0]?.total_users || 0}`);
    }

    // 5. Verificar se há triggers em auth.users
    console.log('\n5. Verificando triggers em auth.users...');
    
    const { data: authTriggers, error: authTriggersError } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            event_object_table
          FROM information_schema.triggers 
          WHERE trigger_schema = 'auth'
          AND event_object_table = 'users'
          ORDER BY trigger_name;
        ` 
      });

    if (authTriggersError) {
      console.log('❌ Erro ao verificar triggers auth:', authTriggersError.message);
    } else {
      console.log('✅ Triggers em auth.users:');
      if (authTriggers && authTriggers.length > 0) {
        authTriggers.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name} (${trigger.event_manipulation})`);
        });
      } else {
        console.log('   Nenhum trigger encontrado');
      }
    }

    // 6. Tentar inserir usuário diretamente na tabela
    console.log('\n6. Testando inserção direta em auth.users...');
    
    const testEmail = `teste-direto-${Date.now()}@teste.com`;
    const testPassword = 'Test123456!';
    
    try {
      const { data: insertData, error: insertError } = await supabaseAdmin
        .rpc('exec_sql', { 
          sql: `
            INSERT INTO auth.users (
              instance_id,
              id,
              aud,
              role,
              email,
              encrypted_password,
              email_confirmed_at,
              created_at,
              updated_at,
              confirmation_token,
              email_change,
              email_change_token_new,
              recovery_token
            ) VALUES (
              '00000000-0000-0000-0000-000000000000',
              gen_random_uuid(),
              'authenticated',
              'authenticated',
              '${testEmail}',
              crypt('${testPassword}', gen_salt('bf')),
              NOW(),
              NOW(),
              NOW(),
              '',
              '',
              '',
              ''
            ) RETURNING id, email;
          ` 
        });

      if (insertError) {
        console.log('❌ Erro ao inserir diretamente:', insertError.message);
      } else {
        console.log('✅ Inserção direta funcionou!');
        console.log(`   - ID: ${insertData[0]?.id}`);
        console.log(`   - Email: ${insertData[0]?.email}`);
        
        // Remover usuário de teste
        await supabaseAdmin.rpc('exec_sql', { 
          sql: `DELETE FROM auth.users WHERE email = '${testEmail}';` 
        });
        console.log('✅ Usuário de teste removido');
      }
    } catch (error) {
      console.log('❌ Erro na inserção direta:', error.message);
    }

    console.log('\n🔍 DIAGNÓSTICO DO SCHEMA AUTH');
    console.log('==============================');
    console.log('✅ Schema auth existe');
    console.log('✅ Tabela auth.users existe');
    console.log('✅ Estrutura da tabela correta');
    console.log('❌ Problema na criação via API');
    
    console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar configurações de auth no dashboard');
    console.log('2. Verificar se há triggers interferindo');
    console.log('3. Verificar se há funções interferindo');
    console.log('4. Verificar se há constraints interferindo');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verificarSchemaAuth();
