#!/usr/bin/env node

const { cjClient } = require('../src/lib/cj.ts');
const { logger } = require('../src/lib/logger.ts');

const PRODUCT_ID = '2408300610371613200';

async function testCJProduct() {
  console.log('🔍 Testando integração com produto CJ...\n');
  
  try {
    // Testar autenticação
    console.log('📡 Autenticando com CJ...');
    await cjClient.authenticate();
    console.log('✅ Autenticação bem-sucedida\n');
    
    // Buscar produto específico
    console.log(`🔍 Buscando produto: ${PRODUCT_ID}`);
    const product = await cjClient.getProduct(PRODUCT_ID);
    console.log('✅ Produto encontrado:', {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock
    });
    
    // Buscar detalhes do produto
    console.log('\n📋 Buscando detalhes do produto...');
    const details = await cjClient.getProductDetail(PRODUCT_ID);
    console.log('✅ Detalhes do produto:', {
      description: details.description?.substring(0, 100) + '...',
      images: details.images?.length || 0,
      variants: details.variants?.length || 0
    });
    
    // Buscar variantes
    if (details.variants && details.variants.length > 0) {
      console.log('\n🎨 Variantes encontradas:');
      details.variants.forEach((variant, index) => {
        console.log(`  ${index + 1}. ${variant.name} - R$ ${variant.price} (Estoque: ${variant.stock})`);
      });
    }
    
    // Testar busca por keywords
    console.log('\n🔍 Testando busca por keywords...');
    const searchResults = await cjClient.queryProducts({
      keyword: 'magnetic charger',
      pageNum: 1,
      pageSize: 5
    });
    
    console.log(`✅ Encontrados ${searchResults.data?.list?.length || 0} produtos`);
    
    return {
      success: true,
      product,
      details,
      searchResults: searchResults.data?.list?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Erro na integração:', error.message);
    logger.error('CJ integration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testOrderCreation() {
  console.log('\n🛒 Testando criação de pedido...\n');
  
  try {
    // Dados de teste para pedido
    const orderData = {
      orderItems: [
        {
          variantId: PRODUCT_ID,
          quantity: 1
        }
      ],
      customerInfo: {
        email: 'teste@exemplo.com',
        name: 'Cliente Teste',
        phone: '+5511999999999'
      },
      shippingInfo: {
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        address: 'Rua Teste, 123',
        zipCode: '01234-567'
      }
    };
    
    console.log('📝 Criando pedido de teste...');
    const order = await cjClient.createOrderV2(orderData);
    
    console.log('✅ Pedido criado:', {
      orderId: order.orderId,
      status: order.status,
      total: order.totalAmount
    });
    
    return {
      success: true,
      order
    };
    
  } catch (error) {
    console.error('❌ Erro na criação do pedido:', error.message);
    logger.error('Order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Iniciando testes da integração CJ...\n');
  
  // Testar produto
  const productTest = await testCJProduct();
  
  if (productTest.success) {
    // Testar criação de pedido
    const orderTest = await testOrderCreation();
    
    console.log('\n📊 Resumo dos testes:');
    console.log(`✅ Produto: ${productTest.success ? 'OK' : 'ERRO'}`);
    console.log(`✅ Pedido: ${orderTest.success ? 'OK' : 'ERRO'}`);
    
    if (productTest.success && orderTest.success) {
      console.log('\n🎉 Todos os testes passaram!');
      console.log('🔧 Integração CJ funcionando perfeitamente.');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    }
  } else {
    console.log('\n❌ Teste do produto falhou. Verifique a configuração da API.');
  }
  
  console.log('\n✨ Testes concluídos!');
}

main().catch(console.error);
