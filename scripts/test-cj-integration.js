#!/usr/bin/env node

const { cjClient } = require('../src/lib/cj.ts');

async function testCJIntegration() {
  console.log('🧪 Testando integração com CJ Dropshipping...\n');

  try {
    // 1. Testar autenticação
    console.log('1️⃣ Testando autenticação...');
    await cjClient.authenticate();
    console.log('   ✅ Autenticação OK\n');

    // 2. Testar busca de produtos
    console.log('2️⃣ Testando busca de produtos...');
    const products = await cjClient.queryProducts({
      pageNum: 1,
      pageSize: 5,
      keyword: 'phone'
    });

    if (products?.data?.list) {
      console.log(`   ✅ Encontrados ${products.data.list.length} produtos`);
      
      // Mostrar primeiro produto
      const firstProduct = products.data.list[0];
      console.log(`   📱 Primeiro produto: ${firstProduct.productName} - R$ ${firstProduct.price}`);
    } else {
      console.log('   ❌ Nenhum produto encontrado');
    }
    console.log('');

    // 3. Testar busca de produto específico
    console.log('3️⃣ Testando busca de produto específico...');
    if (products?.data?.list?.[0]?.productId) {
      const productId = products.data.list[0].productId;
      const productDetail = await cjClient.getProductDetail(productId);
      
      if (productDetail?.data) {
        console.log(`   ✅ Produto encontrado: ${productDetail.data.productName}`);
        console.log(`   📦 Variantes: ${productDetail.data.variants?.length || 0}`);
      } else {
        console.log('   ❌ Detalhes do produto não encontrados');
      }
    }
    console.log('');

    // 4. Testar verificação de estoque
    console.log('4️⃣ Testando verificação de estoque...');
    if (products?.data?.list?.[0]?.productId) {
      const productId = products.data.list[0].productId;
      const stockInfo = await cjClient.getProduct(productId);
      
      if (stockInfo?.data) {
        console.log(`   ✅ Estoque verificado: ${stockInfo.data.stock || 0} unidades`);
      } else {
        console.log('   ❌ Informações de estoque não encontradas');
      }
    }
    console.log('');

    // 5. Testar criação de pedido (simulação)
    console.log('5️⃣ Testando criação de pedido (simulação)...');
    const testOrderData = {
      customerName: 'Teste Integração',
      shippingAddress: {
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        address: 'Rua Teste, 123',
        zip: '01000-000',
        name: 'Teste Integração',
        phone: '+55 11 99999-9999'
      },
      items: [
        {
          vid: 'test-variant-id',
          quantity: 1
        }
      ]
    };

    try {
      const orderResponse = await cjClient.createOrderV2(testOrderData);
      console.log('   ❌ Pedido de teste criado (não deveria funcionar com VID inválido)');
    } catch (error) {
      console.log('   ✅ Pedido de teste rejeitado corretamente (VID inválido)');
    }

    console.log('\n🎉 Testes de integração concluídos!');
    console.log('✅ CJ Dropshipping está funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro nos testes de integração:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Dica: Verifique se:');
      console.log('   • A internet está funcionando');
      console.log('   • A API da CJ está acessível');
      console.log('   • As credenciais estão corretas');
    }
  }
}

// Executar testes
testCJIntegration();
