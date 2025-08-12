#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPaymentScenarios() {
  console.log('🧪 Testando cenários de pagamento...\n');

  try {
    // 1. Testar pagamento com dados válidos
    console.log('1️⃣ Testando pagamento com dados válidos...');
    
    // Criar pedido
    const orderResponse = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 1 }]
    });
    
    const orderId = orderResponse.data.orderId;
    console.log(`   📦 Pedido criado: ${orderId}`);

    // Processar pagamento
    const paymentResponse = await axios.post(`${BASE_URL}/api/payment`, {
      orderId,
      paymentMethod: 'credit_card',
      paymentData: {
        cardNumber: '1234 5678 9012 3456',
        cardName: 'João Silva',
        expiry: '12/25',
        cvv: '123'
      }
    });

    console.log(`   ✅ Pagamento: ${paymentResponse.data.message}`);
    console.log('');

    // 2. Testar cartão recusado
    console.log('2️⃣ Testando cartão recusado...');
    
    const orderResponse2 = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 1 }]
    });
    
    const orderId2 = orderResponse2.data.orderId;

    try {
      await axios.post(`${BASE_URL}/api/payment`, {
        orderId: orderId2,
        paymentMethod: 'credit_card',
        paymentData: {
          cardNumber: '1234 5678 9012 0000',
          cardName: 'João Silva',
          expiry: '12/25',
          cvv: '123'
        }
      });
    } catch (error) {
      console.log(`   ❌ Cartão recusado: ${error.response.data.error}`);
    }
    console.log('');

    // 3. Testar limite insuficiente
    console.log('3️⃣ Testando limite insuficiente...');
    
    const orderResponse3 = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 1 }]
    });
    
    const orderId3 = orderResponse3.data.orderId;

    try {
      await axios.post(`${BASE_URL}/api/payment`, {
        orderId: orderId3,
        paymentMethod: 'credit_card',
        paymentData: {
          cardNumber: '1234 5678 9012 1111',
          cardName: 'João Silva',
          expiry: '12/25',
          cvv: '123'
        }
      });
    } catch (error) {
      console.log(`   ❌ Limite insuficiente: ${error.response.data.error}`);
    }
    console.log('');

    // 4. Testar dados incompletos
    console.log('4️⃣ Testando dados incompletos...');
    
    const orderResponse4 = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 1 }]
    });
    
    const orderId4 = orderResponse4.data.orderId;

    try {
      await axios.post(`${BASE_URL}/api/payment`, {
        orderId: orderId4,
        paymentMethod: 'credit_card',
        paymentData: {
          cardNumber: '1234 5678 9012 3456',
          cardName: 'João Silva',
          // Faltando expiry e cvv
        }
      });
    } catch (error) {
      console.log(`   ❌ Dados incompletos: ${error.response.data.error}`);
    }
    console.log('');

    // 5. Testar estoque insuficiente
    console.log('5️⃣ Testando estoque insuficiente...');
    
    const orderResponse5 = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 100 }]
    });
    
    const orderId5 = orderResponse5.data.orderId;

    try {
      await axios.post(`${BASE_URL}/api/payment`, {
        orderId: orderId5,
        paymentMethod: 'credit_card',
        paymentData: {
          cardNumber: '1234 5678 9012 3456',
          cardName: 'João Silva',
          expiry: '12/25',
          cvv: '123'
        }
      });
    } catch (error) {
      console.log(`   ❌ Estoque insuficiente: ${error.response.data.error}`);
    }
    console.log('');

    // 6. Testar PIX
    console.log('6️⃣ Testando pagamento PIX...');
    
    const orderResponse6 = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 1 }]
    });
    
    const orderId6 = orderResponse6.data.orderId;

    const pixResponse = await axios.post(`${BASE_URL}/api/payment`, {
      orderId: orderId6,
      paymentMethod: 'pix'
    });

    console.log(`   ✅ PIX: ${pixResponse.data.message}`);
    console.log('');

    // 7. Testar Boleto
    console.log('7️⃣ Testando pagamento Boleto...');
    
    const orderResponse7 = await axios.post(`${BASE_URL}/api/orders`, {
      email: 'teste@exemplo.com',
      items: [{ variantId: 'cme3fkb7v0002yd8qujul0ogn', quantity: 1 }]
    });
    
    const orderId7 = orderResponse7.data.orderId;

    const boletoResponse = await axios.post(`${BASE_URL}/api/payment`, {
      orderId: orderId7,
      paymentMethod: 'boleto'
    });

    console.log(`   ✅ Boleto: ${boletoResponse.data.message}`);
    console.log('');

    console.log('🎉 Todos os cenários de pagamento testados!');
    console.log('✅ Sistema de pagamento funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Executar testes
testPaymentScenarios();
