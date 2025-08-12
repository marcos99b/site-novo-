#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMonitoring() {
  console.log('🧪 Testando sistema de monitoramento...\n');
  
  try {
    // Testar API de monitoramento
    console.log('📊 Testando API de monitoramento...');
    const monitoringResponse = await axios.get(`${BASE_URL}/api/monitoring`);
    console.log('✅ API de monitoramento funcionando');
    console.log('📈 Dados:', {
      errors: monitoringResponse.data.errors?.length || 0,
      stats: monitoringResponse.data.stats ? 'Disponível' : 'N/A',
      health: monitoringResponse.data.health ? 'Disponível' : 'N/A'
    });
    
    // Simular alguns erros para testar
    console.log('\n🚨 Simulando erros de teste...');
    await axios.post(`${BASE_URL}/api/monitoring`, {
      type: 'error',
      message: 'Erro de teste simulado',
      context: { test: true, timestamp: new Date().toISOString() }
    });
    
    await axios.post(`${BASE_URL}/api/monitoring`, {
      type: 'warning',
      message: 'Warning de teste simulado',
      context: { test: true, timestamp: new Date().toISOString() }
    });
    
    await axios.post(`${BASE_URL}/api/monitoring`, {
      type: 'metric',
      name: 'test_metric',
      value: 42,
      tags: { test: 'true', category: 'simulation' }
    });
    
    console.log('✅ Erros simulados enviados');
    
    // Aguardar um pouco e verificar novamente
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se os erros apareceram
    const updatedResponse = await axios.get(`${BASE_URL}/api/monitoring`);
    console.log('📊 Dados atualizados:', {
      errors: updatedResponse.data.errors?.length || 0,
      metrics: updatedResponse.data.recentMetrics?.length || 0
    });
    
    // Testar APIs que geram métricas
    console.log('\n🔄 Testando APIs que geram métricas...');
    
    // Testar API de produtos
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log('✅ API de produtos:', {
      status: productsResponse.status,
      productsCount: productsResponse.data.products?.length || 0
    });
    
    // Testar API de pedidos
    const ordersResponse = await axios.get(`${BASE_URL}/api/orders`);
    console.log('✅ API de pedidos:', {
      status: ordersResponse.status
    });
    
    // Verificar métricas finais
    console.log('\n📈 Verificando métricas finais...');
    const finalResponse = await axios.get(`${BASE_URL}/api/monitoring`);
    
    if (finalResponse.data.stats) {
      console.log('📊 Estatísticas:', {
        totalErrors: finalResponse.data.stats.totalErrors,
        errorsLastHour: finalResponse.data.stats.errorsLastHour,
        errorRate: finalResponse.data.stats.errorRate?.toFixed(2) || 0,
        uptime: Math.floor(finalResponse.data.stats.uptime / 60) + ' minutos'
      });
    }
    
    if (finalResponse.data.health) {
      console.log('🏥 Status de saúde:', {
        status: finalResponse.data.health.status,
        message: finalResponse.data.health.message
      });
    }
    
    console.log('\n🎉 Teste de monitoramento concluído!');
    console.log('💡 Acesse http://localhost:3000/monitoring para ver o dashboard em tempo real');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

// Executar teste
testMonitoring();
