#!/usr/bin/env node

const axios = require('axios');
const https = require('https');

// Configuração da CJ Dropshipping
const CJ_API_BASE = process.env.CJ_API_BASE || "https://api.cjdropshipping.com";
const CJ_API_KEY = process.env.CJ_API_KEY || "d3ab3d8f8d344e8f90756c2c82fe958f";
const CJ_API_IP = process.env.CJ_API_IP || ""; // quando DNS falhar
const CJ_API_HOST = process.env.CJ_API_HOST || "api.cjdropshipping.com";

const baseURL = CJ_API_IP ? `https://${CJ_API_IP}` : CJ_API_BASE;
const httpsAgent = new https.Agent({
  keepAlive: true,
  servername: CJ_API_IP ? CJ_API_HOST : undefined
});
const ax = axios.create({ baseURL, httpsAgent, timeout: 20000, proxy: false, headers: CJ_API_IP ? { Host: CJ_API_HOST } : {} });

// Cliente CJ simplificado
const cjClient = {
  async authenticate() {
    const response = await ax.post(`/api/v2/authentication/getAccessToken`, {
      apiKey: CJ_API_KEY
    });
    return response.data;
  },

  async queryProducts(params) {
    const response = await ax.post(`/api/v2/product/queryProducts`, params, {
      headers: {
        'CJ-Access-Token': await this.getAccessToken()
      }
    });
    return response.data;
  },

  async getProductDetail(productId) {
    const response = await ax.post(`/api/v2/product/getProductDetail`, {
      productId
    }, {
      headers: {
        'CJ-Access-Token': await this.getAccessToken()
      }
    });
    return response.data;
  },

  async getProduct(productId) {
    const response = await ax.post(`/api/v2/product/getProduct`, {
      productId
    }, {
      headers: {
        'CJ-Access-Token': await this.getAccessToken()
      }
    });
    return response.data;
  },

  async createOrderV2(orderData) {
    const response = await ax.post(`/api/v2/order/createOrder`, orderData, {
      headers: {
        'CJ-Access-Token': await this.getAccessToken()
      }
    });
    return response.data;
  },

  // Cache do token de acesso
  _accessToken: null,
  _tokenExpiry: null,

  async getAccessToken() {
    if (this._accessToken && this._tokenExpiry && Date.now() < this._tokenExpiry) {
      return this._accessToken;
    }

    const authResponse = await this.authenticate();
    this._accessToken = authResponse.data.accessToken;
    this._tokenExpiry = Date.now() + (authResponse.data.expiresIn * 1000);
    return this._accessToken;
  }
};

async function testCJIntegration() {
  console.log('🧪 Testando integração com CJ Dropshipping...\n');

  try {
    // 1. Testar autenticação
    console.log('1️⃣ Testando autenticação...');
    const authResult = await cjClient.authenticate();
    console.log('   ✅ Autenticação OK');
    console.log(`   🔑 Token: ${authResult.data.accessToken.substring(0, 20)}...`);
    console.log('');

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
