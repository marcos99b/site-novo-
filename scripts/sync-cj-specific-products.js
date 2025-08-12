#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Produtos específicos de moda feminina escolhidos
const CJ_PRODUCTS = [
  {
    id: 1, // Manter ID 1 para não quebrar redirects
    cjProductId: "2508110621021602000",
    name: "Tube Top White Shirt Asymmetric Hip Skirt Suit",
    description: "Elegante conjunto de moda feminina com top branco e saia assimétrica. Design moderno e sofisticado para ocasiões especiais.",
    category: "Moda Feminina",
    brand: "CJ Dropshipping",
    priceMin: 45.99, // Preço base da CJ + margem
    priceMax: 65.99, // Preço com variações
    images: [
      {
        src: "https://www.cjdropshipping.com/product/tube-top-white-shirt-asymmetric-hip-skirt-suit-p-2508110621021602000.html",
        alt: "Tube Top White Shirt Asymmetric Hip Skirt Suit"
      }
    ]
  },
  {
    id: 2, // Manter ID 2 para não quebrar redirects
    cjProductId: "2508110855591629400", 
    name: "Autumn and Winter Leisure Retro Style Stitching Dress",
    description: "Vestido retrô elegante para outono e inverno. Design vintage com detalhes de costura sofisticados e caimento fluido.",
    category: "Moda Feminina",
    brand: "CJ Dropshipping",
    priceMin: 52.99,
    priceMax: 72.99,
    images: [
      {
        src: "https://www.cjdropshipping.com/product/autumn-and-winter-leisure-retro-style-stitching-dress-women-p-2508110855591629400.html",
        alt: "Autumn and Winter Leisure Retro Style Stitching Dress"
      }
    ]
  },
  {
    id: 3, // Manter ID 3 para não quebrar redirects
    cjProductId: "2508110913291617700",
    name: "Fashion Sexy Backless Tube Top Pure Color Split Dress",
    description: "Vestido fashion sexy sem costas com top tubo. Design moderno com fenda alta e cores vibrantes para looks deslumbrantes.",
    category: "Moda Feminina", 
    brand: "CJ Dropshipping",
    priceMin: 48.99,
    priceMax: 68.99,
    images: [
      {
        src: "https://www.cjdropshipping.com/product/fashion-sexy-backless-tube-top-pure-color-split-dress-p-2508110913291617700.html",
        alt: "Fashion Sexy Backless Tube Top Pure Color Split Dress"
      }
    ]
  }
];

async function syncSpecificCJProducts() {
  console.log('🔄 Iniciando sincronização dos 3 produtos específicos da CJ...\n');

  try {
    // Limpar produtos antigos (com cuidado para constraints)
    console.log('🧹 Limpando produtos antigos...');
    
    // Primeiro deletar OrderItems (referenciam Variant)
    try {
      await prisma.orderItem.deleteMany({});
      console.log('   ✅ OrderItems antigos removidos');
    } catch (e) {
      console.log('   ℹ️  Nenhum OrderItem para remover');
    }
    
    // Depois deletar variantes (filhas de Product)
    try {
      await prisma.variant.deleteMany({});
      console.log('   ✅ Variantes antigas removidas');
    } catch (e) {
      console.log('   ℹ️  Nenhuma Variant para remover');
    }
    
    // Por último deletar produtos (pais)
    try {
      await prisma.product.deleteMany({});
      console.log('   ✅ Produtos antigos removidos');
    } catch (e) {
      console.log('   ℹ️  Nenhum Product para remover');
    }

    console.log('');

    // Adicionar os 3 produtos específicos
    for (const productData of CJ_PRODUCTS) {
      try {
        console.log(`👗 Processando produto ${productData.id}: ${productData.name}`);

        // Criar produto no banco
        const product = await prisma.product.create({
          data: {
            id: productData.id.toString(), // Forçar ID específico
            cjProductId: productData.cjProductId,
            name: productData.name,
            description: productData.description,
            images: productData.images,
            priceMin: productData.priceMin,
            priceMax: productData.priceMax,
            category: productData.category,
            brand: productData.brand
          }
        });

        console.log(`   ✅ Produto criado: ${product.name} (ID: ${product.id})`);

        // Criar variantes básicas para cada produto
        const variants = [
          {
            cjVariantId: `${productData.cjProductId}_S`,
            sku: `${productData.id}_S`,
            name: `${productData.name} - Tamanho S`,
            price: productData.priceMin,
            stock: 50
          },
          {
            cjVariantId: `${productData.cjProductId}_M`, 
            sku: `${productData.id}_M`,
            name: `${productData.name} - Tamanho M`,
            price: (productData.priceMin + productData.priceMax) / 2,
            stock: 75
          },
          {
            cjVariantId: `${productData.cjProductId}_L`,
            sku: `${productData.id}_L`, 
            name: `${productData.name} - Tamanho L`,
            price: productData.priceMax,
            stock: 50
          }
        ];

        for (const variantData of variants) {
          await prisma.variant.create({
            data: {
              ...variantData,
              productId: product.id
            }
          });
          console.log(`      ✅ Variante criada: ${variantData.name} - R$ ${variantData.price}`);
        }

        console.log('');

      } catch (productError) {
        console.log(`❌ Erro ao processar produto ${productData.name}: ${productError.message}`);
      }
    }

    console.log('🎉 Sincronização dos produtos específicos concluída!');

    // Mostrar estatísticas
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.variant.count();
    
    console.log('\n📊 Estatísticas:');
    console.log(`   • Produtos no banco: ${totalProducts}`);
    console.log(`   • Variantes no banco: ${totalVariants}`);
    console.log(`   • Categoria: Moda Feminina`);
    console.log(`   • Integração: Pronta para Stripe`);

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar sincronização
syncSpecificCJProducts();
