#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  { path: '/', name: 'Home' },
  { path: '/catalogo', name: 'Catálogo' },
  { path: '/pedidos', name: 'Pedidos' },
  { path: '/monitoring', name: 'Monitoramento' },
  { path: '/api/products', name: 'API Produtos' },
  { path: '/api/orders', name: 'API Pedidos' },
  { path: '/api/monitoring', name: 'API Monitoramento' },
  { path: '/api/crm/leads', name: 'API CRM Leads' }
];

async function testEndpoint(endpoint) {
  try {
    const start = Date.now();
    const response = await axios.get(`${BASE_URL}${endpoint.path}`, {
      timeout: 10000,
      validateStatus: () => true // Aceitar qualquer status para verificar
    });
    const duration = Date.now() - start;
    
    return {
      name: endpoint.name,
      path: endpoint.path,
      status: response.status,
      duration,
      success: response.status < 400,
      error: null
    };
  } catch (error) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      status: 0,
      duration: 0,
      success: false,
      error: error.message
    };
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testando todos os endpoints...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`🔍 Testando ${endpoint.name}...`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const statusIcon = result.success ? '✅' : '❌';
    const statusText = result.success ? 'OK' : `ERRO ${result.status}`;
    console.log(`   ${statusIcon} ${result.name}: ${statusText} (${result.duration}ms)`);
    
    if (result.error) {
      console.log(`   ⚠️  Erro: ${result.error}`);
    }
    
    // Pequena pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Resumo dos Testes:');
  console.log('=====================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Sucessos: ${successful.length}/${results.length}`);
  console.log(`❌ Falhas: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n🚨 Endpoints com problemas:');
    failed.forEach(result => {
      console.log(`   ❌ ${result.name} (${result.path}): ${result.error || `Status ${result.status}`}`);
    });
  }
  
  if (successful.length === results.length) {
    console.log('\n🎉 Todos os endpoints estão funcionando!');
  } else {
    console.log('\n⚠️  Alguns endpoints precisam de atenção.');
  }
  
  return results;
}

// Executar testes
testAllEndpoints()
  .then(() => {
    console.log('\n✨ Testes concluídos!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  });
