#!/usr/bin/env node

const { gatewayApproval } = require('../src/server/gateway-approval.ts');

const PORT = process.env.GATEWAY_PORT || 3001;
const HOST = process.env.GATEWAY_HOST || 'localhost';

async function startGateway() {
  try {
    console.log('🚀 Iniciando Gateway de Aprovação...');
    
    await gatewayApproval.listen({ 
      port: PORT, 
      host: HOST 
    });
    
    console.log(`✅ Gateway de Aprovação rodando em http://${HOST}:${PORT}`);
    console.log('📋 Endpoints disponíveis:');
    console.log(`   - Health Check: http://${HOST}:${PORT}/health`);
    console.log(`   - Aprovação Automática: http://${HOST}:${PORT}/api/gateway/approve-order`);
    console.log(`   - Aprovação Manual: http://${HOST}:${PORT}/api/gateway/manual-approve`);
    console.log(`   - Pedidos Pendentes: http://${HOST}:${PORT}/api/gateway/pending-orders`);
    console.log(`   - Estatísticas: http://${HOST}:${PORT}/api/gateway/stats`);
    
    console.log('\n🔧 Configurações:');
    console.log(`   - Porta: ${PORT}`);
    console.log(`   - Host: ${HOST}`);
    console.log(`   - Rate Limit: 200 requests/minuto`);
    console.log(`   - Max Order Value: ${process.env.MAX_ORDER_VALUE || 1000}`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar gateway:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando Gateway de Aprovação...');
  await gatewayApproval.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando Gateway de Aprovação...');
  await gatewayApproval.close();
  process.exit(0);
});

startGateway();
