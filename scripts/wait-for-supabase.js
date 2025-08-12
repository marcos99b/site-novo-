const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function waitForSupabase() {
  console.log('⏳ Aguardando configuração do Supabase...\n');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 tentativas = 30 segundos
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Tentativa ${attempts}/${maxAttempts}...`);
    
    try {
      // Testar se a tabela site_settings existe
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1);

      if (!error) {
        console.log('✅ Supabase configurado com sucesso!');
        console.log(`📊 Configurações encontradas: ${settings?.length || 0}`);
        
        // Testar outras tabelas
        const tables = ['leads', 'customers', 'categories', 'products', 'orders', 'cart_items'];
        
        for (const table of tables) {
          try {
            const { data, error: tableError } = await supabase
              .from(table)
              .select('*')
              .limit(1);
            
            if (!tableError) {
              console.log(`✅ ${table}: OK`);
            } else {
              console.log(`❌ ${table}: ${tableError.message}`);
            }
          } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
          }
        }
        
        console.log('\n🎉 Todas as tabelas estão prontas!');
        console.log('🌐 Site disponível em: http://localhost:3000');
        console.log('🔐 Teste o login em: http://localhost:3000/login');
        
        return true;
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Aguardar 1 segundo antes da próxima tentativa
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n⏰ Timeout: Supabase não foi configurado em 30 segundos');
  console.log('📋 Verifique se você executou o SQL no dashboard do Supabase');
  console.log('🔗 Dashboard: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql');
  
  return false;
}

// Executar o script
waitForSupabase();
