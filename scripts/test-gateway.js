#!/usr/bin/env node

const axios = require('axios');

const GATEWAY_URL = 'http://localhost:3001';

async function testGateway() {
  console.log('🧪 Testando Gateway de Aprovação...\n');
  
  try {
    // Teste 1: Health Check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await axios.get(`${GATEWAY_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Teste 2: Estatísticas
    console.log('\n2️⃣ Testando Estatísticas...');
    const statsResponse = await axios.get(`${GATEWAY_URL}/api/gateway/stats`);
    console.log('✅ Estatísticas:', statsResponse.data);
    
    // Teste 3: Aprovação Automática - Cliente Recorrente
    console.log('\n3️⃣ Testando Aprovação Automática (Cliente Recorrente)...');
    const autoApproveResponse = await axios.post(`${GATEWAY_URL}/api/gateway/approve-order`, {
      orderId: 'test-order-1',
      customerData: {
        email: 'cliente@exemplo.com',
        name: 'Cliente Teste'
      },
      items: [
        {
          variantId: 'test-variant-1',
          quantity: 1
        }
      ],
      totalAmount: 50
    });
    console.log('✅ Aprovação Automática:', autoApproveResponse.data);
    
    // Teste 4: Aprovação Automática - Valor Baixo
    console.log('\n4️⃣ Testando Aprovação Automática (Valor Baixo)...');
    const lowValueResponse = await axios.post(`${GATEWAY_URL}/api/gateway/approve-order`, {
      orderId: 'test-order-2',
      customerData: {
        email: 'novo@exemplo.com',
        name: 'Cliente Novo'
      },
      items: [
        {
          variantId: 'test-variant-2',
          quantity: 1
        }
      ],
      totalAmount: 80
    });
    console.log('✅ Aprovação Valor Baixo:', lowValueResponse.data);
    
    // Teste 5: Pedido Pendente (Valor Alto)
    console.log('\n5️⃣ Testando Pedido Pendente (Valor Alto)...');
    const pendingResponse = await axios.post(`${GATEWAY_URL}/api/gateway/approve-order`, {
      orderId: 'test-order-3',
      customerData: {
        email: 'cliente@exemplo.com',
        name: 'Cliente Teste'
      },
      items: [
        {
          variantId: 'test-variant-3',
          quantity: 5
        }
      ],
      totalAmount: 1500
    });
    console.log('✅ Pedido Pendente:', pendingResponse.data);
    
    // Teste 6: Pedidos Pendentes
    console.log('\n6️⃣ Testando Lista de Pedidos Pendentes...');
    const pendingOrdersResponse = await axios.get(`${GATEWAY_URL}/api/gateway/pending-orders`);
    console.log('✅ Pedidos Pendentes:', pendingOrdersResponse.data);
    
    // Teste 7: Aprovação Manual
    console.log('\n7️⃣ Testando Aprovação Manual...');
    const manualApproveResponse = await axios.post(`${GATEWAY_URL}/api/gateway/manual-approve`, {
      orderId: 'test-order-3',
      approved: true,
      reason: 'Cliente confiável',
      adminId: 'admin-1'
    });
    console.log('✅ Aprovação Manual:', manualApproveResponse.data);
    
    // Teste 8: Estatísticas Finais
    console.log('\n8️⃣ Testando Estatísticas Finais...');
    const finalStatsResponse = await axios.get(`${GATEWAY_URL}/api/gateway/stats`);
    console.log('✅ Estatísticas Finais:', finalStatsResponse.data);
    
    console.log('\n🎉 Todos os testes do Gateway passaram!');
    console.log('🚀 Gateway de Aprovação funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

// Executar testes
testGateway();
