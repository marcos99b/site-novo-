#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// As 3 imagens que você enviou - baseado nas descrições
const novasImagens = [
  {
    src: "/brand/products/product-01.jpg",
    alt: "Coleção Atual - Outono 2024 - Conjunto Minimalista"
  },
  {
    src: "/brand/products/product-02.jpg", 
    alt: "Coleção Atual - Outono 2024 - Blazer Sofisticado"
  },
  {
    src: "/brand/products/product-03.jpg",
    alt: "Coleção Atual - Outono 2024 - Vestido Elegante"
  }
];

async function adicionarImagensModa() {
  console.log('🔄 Adicionando imagens de moda aos produtos...\n');
  
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
      
      // Adicionar as novas imagens às existentes
      const imagensAtuais = produto.images || [];
      const imagensCombinadas = [...imagensAtuais, ...novasImagens];
      
      // Atualizar produto com as novas imagens
      await prisma.product.update({
        where: { id: produto.id },
        data: {
          images: imagensCombinadas
        }
      });
      
      console.log(`  ✅ Produto atualizado com ${imagensCombinadas.length} imagens`);
      console.log(`     - Imagens originais: ${imagensAtuais.length}`);
      console.log(`     - Novas imagens adicionadas: ${novasImagens.length}`);
    }
    
    console.log(`\n🎉 Imagens adicionadas com sucesso!`);
    console.log(`💡 Agora você pode ver as imagens na página do produto`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar imagens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
adicionarImagensModa();


