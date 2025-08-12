#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarImagensProduto() {
  console.log('🔍 Testando imagens do produto...\n');
  
  try {
    // Buscar o primeiro produto
    const produto = await prisma.product.findFirst({
      include: { variants: true }
    });
    
    if (!produto) {
      console.log('❌ Nenhum produto encontrado');
      return;
    }
    
    console.log(`📦 Produto: ${produto.name}`);
    console.log(`🆔 ID: ${produto.id}`);
    console.log(`📸 Total de imagens: ${produto.images.length}`);
    
    console.log('\n📋 Imagens disponíveis:');
    produto.images.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.src} - ${img.alt}`);
    });
    
    console.log('\n🔗 Testando URLs das imagens...');
    
    // Testar cada imagem
    for (const img of produto.images) {
      try {
        const response = await fetch(`http://localhost:3000${img.src}`);
        if (response.ok) {
          console.log(`  ✅ ${img.src} - OK (${response.status})`);
        } else {
          console.log(`  ❌ ${img.src} - Erro (${response.status})`);
        }
      } catch (error) {
        console.log(`  ❌ ${img.src} - Erro de conexão: ${error.message}`);
      }
    }
    
    console.log('\n💡 Para testar no navegador:');
    console.log(`   - Página do produto: http://localhost:3000/produto/${produto.id}`);
    console.log(`   - API do produto: http://localhost:3000/api/products/${produto.id}`);
    
  } catch (error) {
    console.error('❌ Erro ao testar imagens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
testarImagensProduto();

