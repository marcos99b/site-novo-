#!/usr/bin/env node

const axios = require('axios');

// Configuração da CJ Dropshipping - ENDPOINT CORRETO
const CJ_API_KEY = "d3ab3d8f8d344e8f90756c2c82fe958f";

// Endpoints corretos baseados na documentação oficial da CJ
const endpoints = [
  {
    name: "API Principal (Correto)",
    url: "https://cjdropshipping.com/api",
    test: "/v2/authentication/getAccessToken"
  },
  {
    name: "API Alternativa 1",
    url: "https://cjdropshipping.com/api",
    test: "/v1/authentication/getAccessToken"
  },
  {
    name: "API Alternativa 2",
    url: "https://cjdropshipping.com",
    test: "/api/v2/authentication/getAccessToken"
  },
  {
    name: "API Alternativa 3",
    url: "https://cjdropshipping.com",
    test: "/api/v1/authentication/getAccessToken"
  }
];

async function testCorrectEndpoint() {
  console.log('🔍 Testando endpoint CORRETO da CJ Dropshipping...\n');
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
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`   ✅ CONECTIVIDADE OK!`);
      console.log(`   ⏱️  Tempo de resposta: ${responseTime}ms`);
      console.log(`   📊 Status: ${response.status}`);
      
      if (response.data) {
        console.log(`   📋 Resposta:`, JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 200 && response.data.data && response.data.data.accessToken) {
          console.log(`   🔑 Token obtido: ${response.data.data.accessToken.substring(0, 20)}...`);
          workingEndpoint = endpoint;
          console.log(`   🎉 ESTE ENDPOINT FUNCIONA PERFEITAMENTE!`);
        } else if (response.data.code) {
          console.log(`   📊 Código da API: ${response.data.code}`);
          console.log(`   💬 Mensagem: ${response.data.message}`);
        }
      }
      
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.log(`   ❌ DNS não encontrado`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Conexão recusada`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   ❌ Timeout (15s)`);
      } else if (error.response) {
        console.log(`   ❌ Erro HTTP: ${error.response.status}`);
        if (error.response.data) {
          console.log(`   📋 Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      } else {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    console.log('');
  }

  // Resumo final
  console.log('📊 RESUMO DOS ENDPOINTS:');
  
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
    console.log('   • API da CJ pode ter mudado de endpoint');
    console.log('   • Suas credenciais podem estar inválidas');
    console.log('   • A CJ pode ter restrições de IP');
    console.log('   • Documentação da API pode estar desatualizada');
    console.log('');
    console.log('🔄 Próximos passos:');
    console.log('1. Verificar documentação oficial da CJ');
    console.log('2. Contactar suporte da CJ');
    console.log('3. Verificar se as credenciais estão ativas');
  }

  console.log('');
  console.log('🔧 PRÓXIMOS PASSOS:');
  console.log('1. Se encontrou endpoint funcional:');
  console.log('   • Atualizar configuração no sistema');
  console.log('   • Testar integração completa');
  console.log('2. Se não encontrou:');
  console.log('   • Verificar documentação oficial da CJ');
  console.log('   • Contactar suporte da CJ');
  console.log('   • Verificar status das credenciais');
}

// Executar teste
testCorrectEndpoint();
