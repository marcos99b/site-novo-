#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testando conexão com Supabase...\n');

// Configuração do seu projeto
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

async function testarConexao() {
  try {
    console.log('📡 Tentando conectar...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('Product')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      console.log('\n🔧 SOLUÇÕES:');
      console.log('1. Verifique se você tem acesso ao projeto');
      console.log('2. Confirme se a API key está correta');
      console.log('3. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh');
      return false;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Resposta:', data);
    return true;
    
  } catch (error) {
    console.log('❌ Erro ao conectar:', error.message);
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verifique sua conexão com a internet');
    console.log('2. Confirme se o projeto está ativo');
    console.log('3. Tente novamente em alguns segundos');
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando teste de conexão...\n');
  
  const sucesso = await testarConexao();
  
  if (sucesso) {
    console.log('\n🎉 Tudo funcionando! Agora você pode:');
    console.log('1. Criar as tabelas no Supabase Dashboard');
    console.log('2. Configurar as variáveis de ambiente');
    console.log('3. Testar a sincronização com CJ');
  } else {
    console.log('\n⚠️ Problema na conexão. Verifique:');
    console.log('1. Se você tem acesso ao projeto Supabase');
    console.log('2. Se as credenciais estão corretas');
    console.log('3. Se o projeto está ativo');
  }
  
  console.log('\n✨ Teste concluído!');
}

main().catch(console.error);
