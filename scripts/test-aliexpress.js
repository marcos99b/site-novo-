#!/usr/bin/env node

const axios = require('axios');

// Configuração da AliExpress API (simulada para teste)
const ALIEXPRESS_API_BASE = process.env.ALIEXPRESS_API_BASE || 'https://api.aliexpress.com/v2';
const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY || 'test_key';
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'test_secret';

async function testAliExpressIntegration() {
  console.log('🚀 Testando integração AliExpress...\n');
  console.log(`📋 Configurações:`);
  console.log(`   • API Base: ${ALIEXPRESS_API_BASE}`);
  console.log(`   • App Key: ${ALIEXPRESS_APP_KEY.substring(0, 10)}...`);
  console.log('');

  try {
    // 1. Testar conectividade
    console.log('1️⃣ Testando conectividade...');
    const healthResponse = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });

    if (healthResponse.status === 200) {
      console.log('   ✅ Servidor local funcionando!');
    } else {
      console.log('   ❌ Servidor local não respondeu corretamente');
    }
    console.log('');

    // 2. Testar API de produtos (simulada)
    console.log('2️⃣ Testando API de produtos...');
    const productsResponse = await axios.get('http://localhost:3000/api/aliexpress/products?keywords=tech&pageSize=5', {
      timeout: 10000
    });

    if (productsResponse.status === 200) {
      console.log('   ✅ API de produtos funcionando!');
      console.log(`   📊 Produtos encontrados: ${productsResponse.data.products?.length || 0}`);
    } else {
      console.log('   ❌ API de produtos falhou');
    }
    console.log('');

    // 3. Testar API de produto específico
    console.log('3️⃣ Testando API de produto específico...');
    const productResponse = await axios.get('http://localhost:3000/api/aliexpress/product/123456', {
      timeout: 10000
    });

    if (productResponse.status === 200) {
      console.log('   ✅ API de produto específico funcionando!');
    } else {
      console.log('   ❌ API de produto específico falhou');
    }
    console.log('');

    // 4. Testar cálculo de frete
    console.log('4️⃣ Testando cálculo de frete...');
    const shippingResponse = await axios.post('http://localhost:3000/api/aliexpress/shipping', {
      productId: '123456',
      quantity: 1,
      countryCode: 'BR',
      zipCode: '01000-000'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (shippingResponse.status === 200) {
      console.log('   ✅ API de frete funcionando!');
    } else {
      console.log('   ❌ API de frete falhou');
    }
    console.log('');

    // 5. Testar criação de pedido
    console.log('5️⃣ Testando criação de pedido...');
    const orderResponse = await axios.post('http://localhost:3000/api/aliexpress/orders', {
      productId: '123456',
      quantity: 1,
      shippingAddress: {
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        address: 'Rua Exemplo, 123',
        zipCode: '01000-000',
        recipientName: 'João Silva',
        recipientPhone: '+55 11 99999-9999'
      },
      buyerInfo: {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+55 11 99999-9999'
      }
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (orderResponse.status === 200) {
      console.log('   ✅ API de pedidos funcionando!');
    } else {
      console.log('   ❌ API de pedidos falhou');
    }
    console.log('');

    console.log('🎉 Testes concluídos!');
    console.log('📝 Nota: Como a API AliExpress ainda não está configurada,');
    console.log('   os testes estão simulados. Configure as credenciais');
    console.log('   reais para testar a integração completa.');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando:');
      console.log('   pnpm dev');
    }
  }
}

// Executar testes
testAliExpressIntegration();
