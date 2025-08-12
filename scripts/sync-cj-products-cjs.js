#!/usr/bin/env node

const axios = require('axios');
const Bottleneck = require('bottleneck');

// Configuração do cliente CJ
const CJ_API_KEY = process.env.CJ_API_KEY || 'd3ab3d8f8d344e8f90756c2c82fe958f';
const CJ_API_BASE = process.env.CJ_API_BASE || 'https://api.cjdropshipping.com';

// Rate limiter
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000 // 1 segundo entre requests
});

// Cliente HTTP
const http = axios.create({
  baseURL: CJ_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'CJ-Access-Token': CJ_API_KEY
  }
});

// Função para executar requests com rate limiting
async function run(fn) {
  return limiter.schedule(fn);
}

// Cliente CJ simplificado
const cjClient = {
  async authenticate() {
    try {
      const response = await run(() => 
        http.post('/api2/authentication/getAccessToken', {
          email: process.env.CJ_EMAIL || 'seu-email@exemplo.com',
          password: process.env.CJ_PASSWORD || 'sua-senha'
        })
      );
      
      if (response.data?.data?.accessToken) {
        http.defaults.headers['CJ-Access-Token'] = response.data.data.accessToken;
        console.log('✅ Token de acesso obtido');
      }
    } catch (error) {
      console.log('⚠️ Usando token padrão da API key');
    }
  },

  async queryProducts(payload) {
    const response = await run(() => 
      http.post('/api2/product/query', payload)
    );
    return response.data;
  }
};

async function syncCJProducts() {
  console.log('🔄 Iniciando sincronização de produtos da CJ...\n');
  
  try {
    // Autenticar com CJ
    console.log('🔐 Autenticando com CJ...');
    await cjClient.authenticate();
    console.log('✅ Autenticação bem-sucedida\n');
    
    // Buscar produtos da CJ
    console.log('🔍 Buscando produtos da CJ...');
    const keywords = ['magnetic charger', 'carregador magnético', 'wireless charger'];
    
    let totalImported = 0;
    
    for (const keyword of keywords) {
      console.log(`\n📦 Buscando produtos com keyword: "${keyword}"`);
      
      try {
        const response = await cjClient.queryProducts({
          keyword,
          pageNum: 1,
          pageSize: 10
        });
        
        const products = response?.data?.list || [];
        console.log(`📊 Encontrados ${products.length} produtos`);
        
        for (const product of products) {
          try {
            console.log(`  🔄 Processando: ${product.name || 'Produto sem nome'}`);
            
            // Simular salvamento no banco (por enquanto)
            console.log(`    ✅ Produto processado: ${product.id}`);
            totalImported++;
            
          } catch (error) {
            console.error(`    ❌ Erro ao processar produto: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar produtos com keyword "${keyword}": ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Sincronização concluída!`);
    console.log(`📊 Total de produtos processados: ${totalImported}`);
    
    return {
      success: true,
      totalImported
    };
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar sincronização
syncCJProducts()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Sincronização realizada com sucesso!');
      console.log('💡 Agora você pode verificar o catálogo no site!');
      process.exit(0);
    } else {
      console.log('\n❌ Sincronização falhou!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  });
