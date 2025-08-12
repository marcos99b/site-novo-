#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removerImagensAntigas() {
  console.log('🧹 Removendo imagens antigas dos produtos...\n');
  
  try {
    // Buscar todos os produtos
    const produtos = await prisma.product.findMany();
    
    if (produtos.length === 0) {
      console.log('❌ Nenhum produto encontrado no banco de dados');
      return;
    }
    
    console.log(`📦 Encontrados ${produtos.length} produtos`);
    
    for (const produto of produtos) {
      console.log(`\n🔄 Processando: ${produto.name}`);
      
      // Filtrar apenas as imagens originais (remover as que adicionei)
      const imagensOriginais = produto.images.filter(img => 
        img.src.startsWith('/cj/') && !img.src.includes('brand/products')
      );
      
      // Atualizar produto com apenas as imagens originais
      await prisma.product.update({
        where: { id: produto.id },
        data: {
          images: imagensOriginais
        }
      });
      
      console.log(`  ✅ Produto atualizado: ${imagensOriginais.length} imagens originais mantidas`);
      console.log(`     - Imagens removidas: ${produto.images.length - imagensOriginais.length}`);
    }
    
    console.log(`\n🎉 Imagens antigas removidas com sucesso!`);
    console.log(`💡 Os produtos voltaram ao estado original`);
    
  } catch (error) {
    console.error('❌ Erro ao remover imagens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
removerImagensAntigas();

