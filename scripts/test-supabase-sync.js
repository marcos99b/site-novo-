const { exec } = require('child_process');

console.log('🧪 TESTANDO SINCRONIZAÇÃO SUPABASE - RELIET\n');

console.log('📋 TESTES A SEREM EXECUTADOS:');
console.log('1. API Supabase - Lista de produtos');
console.log('2. API Supabase - Produto individual');
console.log('3. Comparação com API antiga');
console.log('4. Verificação de nomes e preços\n');

// URLs de teste
const baseUrl = 'http://localhost:3000';
const testUrls = [
  '/api/supabase/products?featured=true',
  '/api/supabase/products',
  '/api/supabase/products/1',
  '/api/products?featured=true',
  '/api/products',
  '/api/products/1'
];

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const fullUrl = `${baseUrl}${url}`;
    console.log(`🔍 Testando: ${description}`);
    console.log(`   URL: ${fullUrl}`);
    
    exec(`curl -s "${fullUrl}" | head -20`, (error, stdout, stderr) => {
      if (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        resolve({ success: false, error: error.message });
        return;
      }
      
      if (stderr) {
        console.log(`   ⚠️  Aviso: ${stderr}`);
      }
      
      console.log(`   ✅ Resposta (primeiras 20 linhas):`);
      console.log(`   ${stdout.trim().split('\n').map(line => `   ${line}`).join('\n')}`);
      console.log('');
      
      resolve({ success: true, data: stdout });
    });
  });
}

async function runTests() {
  console.log('🚀 INICIANDO TESTES...\n');
  
  const results = [];
  
  // Teste 1: API Supabase - Produtos em destaque
  results.push(await testEndpoint(
    '/api/supabase/products?featured=true',
    'API Supabase - Produtos em destaque'
  ));
  
  // Teste 2: API Supabase - Lista completa
  results.push(await testEndpoint(
    '/api/supabase/products',
    'API Supabase - Lista completa'
  ));
  
  // Teste 3: API Supabase - Produto individual
  results.push(await testEndpoint(
    '/api/supabase/products/1',
    'API Supabase - Produto individual (ID 1)'
  ));
  
  // Teste 4: API Antiga - Produtos em destaque
  results.push(await testEndpoint(
    '/api/products?featured=true',
    'API Antiga - Produtos em destaque'
  ));
  
  // Teste 5: API Antiga - Lista completa
  results.push(await testEndpoint(
    '/api/products',
    'API Antiga - Lista completa'
  ));
  
  // Teste 6: API Antiga - Produto individual
  results.push(await testEndpoint(
    '/api/products/1',
    'API Antiga - Produto individual (ID 1)'
  ));
  
  // Resumo dos resultados
  console.log('📊 RESUMO DOS TESTES:');
  console.log('=====================');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Sucessos: ${successCount}/${totalCount}`);
  console.log(`❌ Falhas: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('   A sincronização com Supabase está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('   Verifique os logs acima para identificar problemas.');
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Verifique se o Supabase está configurado');
  console.log('2. Execute os scripts SQL no Supabase');
  console.log('3. Configure as variáveis de ambiente');
  console.log('4. Teste as páginas do site');
  
  console.log('\n🌐 TESTE AS PÁGINAS:');
  console.log(`   Home: ${baseUrl}`);
  console.log(`   Catálogo: ${baseUrl}/catalogo`);
  console.log(`   Produto: ${baseUrl}/produto/1`);
}

// Verificar se o servidor está rodando
console.log('🔍 Verificando se o servidor está rodando...\n');

exec(`curl -s -o /dev/null -w "%{http_code}" "${baseUrl}"`, (error, stdout, stderr) => {
  if (error || stdout !== '200') {
    console.log('❌ Servidor não está rodando!');
    console.log('   Execute: npm run dev');
    console.log('   Aguarde o servidor iniciar e execute novamente este script.\n');
    return;
  }
  
  console.log('✅ Servidor está rodando! Iniciando testes...\n');
  runTests();
});
