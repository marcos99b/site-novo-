#!/usr/bin/env node

const axios = require('axios');

// Configuração da CJ Dropshipping
const CJ_API_KEY = "d3ab3d8f8d344e8f90756c2c82fe958f";

// Diferentes endpoints para testar
const endpoints = [
  {
    name: "API Principal",
    url: "https://api.cjdropshipping.com",
    test: "/api/v2/authentication/getAccessToken"
  },
  {
    name: "API Alternativa 1",
    url: "https://developer-api.cjdropshipping.com",
    test: "/api/v2/authentication/getAccessToken"
  },
  {
    name: "API Alternativa 2",
    url: "https://api.cjdropshipping.com",
    test: "/api/v1/authentication/getAccessToken"
  },
  {
    name: "API Alternativa 3",
    url: "https://api.cjdropshipping.com",
    test: "/authentication/getAccessToken"
  }
];

async function testConnectivity() {
  console.log('🌐 Testando conectividade com CJ Dropshipping...\n');
  console.log(`📋 API Key: ${CJ_API_KEY.substring(0, 10)}...${CJ_API_KEY.substring(CJ_API_KEY.length - 4)}`);
  console.log('');

  let workingEndpoint = null;

  for (const endpoint of endpoints) {
    console.log(`🔍 Testando ${endpoint.name}...`);
    console.log(`   📡 URL: ${endpoint.url}${endpoint.test}`);
    
    try {
      const startTime = Date.now();
      const response = await axios.post(`${endpoint.url}${endpoint.test}`, {
        apiKey: CJ_API_KEY
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`   ✅ CONECTIVIDADE OK!`);
      console.log(`   ⏱️  Tempo de resposta: ${responseTime}ms`);
      console.log(`   📊 Status: ${response.status}`);
      
      if (response.data && response.data.code) {
        console.log(`   📋 Código da API: ${response.data.code}`);
        console.log(`   💬 Mensagem: ${response.data.message}`);
        
        if (response.data.code === 200 && response.data.data && response.data.data.accessToken) {
          console.log(`   🔑 Token obtido: ${response.data.data.accessToken.substring(0, 20)}...`);
          workingEndpoint = endpoint;
          console.log(`   🎉 ESTE ENDPOINT FUNCIONA PERFEITAMENTE!`);
        } else {
          console.log(`   ⚠️  Resposta recebida mas não é um token válido`);
        }
      } else {
        console.log(`   ⚠️  Resposta recebida mas formato inesperado`);
      }
      
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.log(`   ❌ DNS não encontrado`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Conexão recusada`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   ❌ Timeout (10s)`);
      } else if (error.response) {
        console.log(`   ❌ Erro HTTP: ${error.response.status}`);
        if (error.response.data) {
          console.log(`   📋 Resposta: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    console.log('');
  }

  // Resumo final
  console.log('📊 RESUMO DA CONECTIVIDADE:');
  
  if (workingEndpoint) {
    console.log(`✅ ENDPOINT FUNCIONAL ENCONTRADO: ${workingEndpoint.name}`);
    console.log(`🔗 URL: ${workingEndpoint.url}${workingEndpoint.test}`);
    console.log('');
    console.log('🎉 SUAS CREDENCIAIS ESTÃO FUNCIONANDO!');
    console.log('💰 A comissão será processada corretamente.');
    console.log('');
    console.log('💡 Para usar este endpoint:');
    console.log(`   • Configure: CJ_API_BASE = "${workingEndpoint.url}"`);
    console.log(`   • Execute: npm run test-cj-creds`);
  } else {
    console.log('❌ NENHUM ENDPOINT FUNCIONAL ENCONTRADO');
    console.log('');
    console.log('💡 Possíveis causas:');
    console.log('   • API da CJ temporariamente indisponível');
    console.log('   • Problemas de conectividade de rede');
    console.log('   • Firewall bloqueando conexões');
    console.log('   • Endpoints da CJ podem ter mudado');
    console.log('');
    console.log('🔄 Tente novamente em alguns minutos');
  }

  console.log('');
  console.log('🔧 PRÓXIMOS PASSOS:');
  console.log('1. Se encontrou endpoint funcional:');
  console.log('   • Configure o endpoint no sistema');
  console.log('   • Execute: npm run test-cj-creds');
  console.log('2. Se não encontrou:');
  console.log('   • Aguarde alguns minutos');
  console.log('   • Verifique sua conexão com a internet');
  console.log('   • Tente novamente: npm run test-cj-connectivity');
}

// Executar teste
testConnectivity();
