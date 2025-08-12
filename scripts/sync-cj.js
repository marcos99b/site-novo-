#!/usr/bin/env node

const axios = require('axios');

const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function syncProducts(keywords = ['magnetic charger', 'wireless charger']) {
  console.log('🔄 Iniciando sincronização com CJ Dropshipping...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/cj/sync`, {
      keywords,
      pageSize: 50,
      maxPages: 3
    });

    if (response.data.success) {
      console.log(`✅ Sincronização concluída!`);
      console.log(`📦 ${response.data.totalImported} produtos importados`);
      console.log(`📊 Resultados:`, response.data.results.length);
    } else {
      console.error('❌ Erro na sincronização:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error.message);
  }
}

async function syncStock() {
  console.log('🔄 Sincronizando estoque...');
  
  try {
    // Primeiro, buscar produtos para obter variant IDs
    const productsResponse = await axios.get(`${API_BASE}/api/products`);
    const products = productsResponse.data.products;
    
    if (!products || products.length === 0) {
      console.log('⚠️ Nenhum produto encontrado para sincronizar estoque');
      return;
    }

    // Coletar todos os variant IDs
    const variantIds = [];
    products.forEach(product => {
      if (product.variants) {
        product.variants.forEach(variant => {
          if (variant.cjVariantId) {
            variantIds.push(variant.cjVariantId);
          }
        });
      }
    });

    if (variantIds.length === 0) {
      console.log('⚠️ Nenhuma variante encontrada para sincronizar estoque');
      return;
    }

    // Sincronizar estoque em lotes de 50
    const batchSize = 50;
    for (let i = 0; i < variantIds.length; i += batchSize) {
      const batch = variantIds.slice(i, i + batchSize);
      
      const response = await axios.post(`${API_BASE}/api/cj/stock`, {
        variantIds: batch
      });

      if (response.data.success) {
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${response.data.updated} variantes atualizadas`);
      } else {
        console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, response.data.error);
      }

      // Aguardar um pouco entre os lotes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Sincronização de estoque concluída!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar estoque:', error.message);
  }
}

// Função principal
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'products':
      await syncProducts();
      break;
    case 'stock':
      await syncStock();
      break;
    case 'all':
      await syncProducts();
      await syncStock();
      break;
    default:
      console.log(`
🛠️ Script de Sincronização CJ Dropshipping

Uso: node scripts/sync-cj.js [comando]

Comandos:
  products  - Sincronizar produtos
  stock     - Sincronizar estoque
  all       - Sincronizar produtos e estoque

Exemplo:
  node scripts/sync-cj.js all
      `);
  }
}

main().catch(console.error);
