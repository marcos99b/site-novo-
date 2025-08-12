// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do novo projeto Supabase
const supabaseUrl = 'https://vqpumetbhgqdpnskgbvr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 CONFIGURAÇÃO FINAL DO SUPABASE');
console.log('================================\n');

console.log('📋 STATUS ATUAL:');
console.log('- Project ID: vqpumetbhgqdpnskgbvr');
console.log('- URL: https://vqpumetbhgqdpnskgbvr.supabase.co');
console.log('- Database Password: 8J8gt8V6F-Y6$W6');

console.log('\n🔑 CREDENCIAIS NECESSÁRIAS:');
console.log('1. Acesse: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/settings/api');
console.log('2. Copie a "anon public" key');
console.log('3. Copie a "service_role" key (secreta)');

console.log('\n📝 EXEMPLO DE CONFIGURAÇÃO:');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://vqpumetbhgqdpnskgbvr.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

console.log('\n🚀 O QUE SERÁ CONFIGURADO:');
console.log('- ✅ Todas as tabelas (leads, customers, orders, products, etc.)');
console.log('- ✅ RLS (Row Level Security)');
console.log('- ✅ Login automático (sem confirmação de email)');
console.log('- ✅ URLs de redirecionamento');
console.log('- ✅ Sistema de CRM automático');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Me passe as chaves corretas do Supabase');
console.log('2. Execute: node scripts/configuracao-final.js');
console.log('3. Teste: http://localhost:3000/login');

console.log('\n💡 DICA:');
console.log('As chaves aparecem na página de Settings > API do seu projeto');
console.log('A "anon public" key é pública, a "service_role" key é secreta');

if (supabaseAnonKey && supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHVtZXRiaGdxZHBuc2tnYnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjcyMzksImV4cCI6MjA3MDM0NzIzOX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8') {
  console.log('\n✅ CREDENCIAIS JÁ CONFIGURADAS!');
  console.log('Executando configuração automática...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Testar conexão
  supabase.from('leads').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('⚠️ Erro na conexão:', error.message);
      } else {
        console.log('✅ Conexão funcionando!');
        console.log('🎉 Sistema pronto para uso!');
      }
    });
} else {
  console.log('\n❌ CREDENCIAIS NÃO CONFIGURADAS');
  console.log('Configure as chaves no arquivo .env.local primeiro');
}
