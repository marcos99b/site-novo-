#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCJSampleProducts() {
  console.log('🔄 Adicionando produtos de exemplo da CJ Dropshipping...\n');

  try {
    // Produtos de exemplo com IDs da CJ
    const sampleProducts = [
      {
        cjProductId: '2408300610371613200',
        name: 'Carregador Magnético Wireless',
        description: 'Carregador magnético sem fio para iPhone e Android',
        images: [
          'https://example.com/carregador1.jpg',
          'https://example.com/carregador2.jpg'
        ],
        priceMin: 29.90,
        priceMax: 39.90,
        variants: [
          {
            cjVariantId: '2408300610371613201',
            sku: 'MAG-001-BLACK',
            name: 'Carregador Magnético Preto',
            image: 'https://example.com/carregador-black.jpg',
            price: 29.90,
            stock: 50
          },
          {
            cjVariantId: '2408300610371613202',
            sku: 'MAG-001-WHITE',
            name: 'Carregador Magnético Branco',
            image: 'https://example.com/carregador-white.jpg',
            price: 32.90,
            stock: 30
          }
        ]
      },
      {
        cjProductId: '2408300610371613203',
        name: 'Cabo USB-C Rápido',
        description: 'Cabo USB-C de carregamento rápido 100W',
        images: [
          'https://example.com/cabo1.jpg',
          'https://example.com/cabo2.jpg'
        ],
        priceMin: 15.90,
        priceMax: 19.90,
        variants: [
          {
            cjVariantId: '2408300610371613204',
            sku: 'USB-C-001-1M',
            name: 'Cabo USB-C 1 Metro',
            image: 'https://example.com/cabo-1m.jpg',
            price: 15.90,
            stock: 100
          },
          {
            cjVariantId: '2408300610371613205',
            sku: 'USB-C-001-2M',
            name: 'Cabo USB-C 2 Metros',
            image: 'https://example.com/cabo-2m.jpg',
            price: 19.90,
            stock: 75
          }
        ]
      },
      {
        cjProductId: '2408300610371613206',
        name: 'Fone de Ouvido Bluetooth',
        description: 'Fone de ouvido sem fio com cancelamento de ruído',
        images: [
          'https://example.com/fone1.jpg',
          'https://example.com/fone2.jpg'
        ],
        priceMin: 89.90,
        priceMax: 129.90,
        variants: [
          {
            cjVariantId: '2408300610371613207',
            sku: 'FONE-001-BASIC',
            name: 'Fone Bluetooth Básico',
            image: 'https://example.com/fone-basic.jpg',
            price: 89.90,
            stock: 25
          },
          {
            cjVariantId: '2408300610371613208',
            sku: 'FONE-001-PRO',
            name: 'Fone Bluetooth Pro',
            image: 'https://example.com/fone-pro.jpg',
            price: 129.90,
            stock: 15
          }
        ]
      }
    ];

    let totalProducts = 0;
    let totalVariants = 0;

    for (const productData of sampleProducts) {
      try {
        // Verificar se o produto já existe
        const existingProduct = await prisma.product.findUnique({
          where: { cjProductId: productData.cjProductId }
        });

        if (existingProduct) {
          console.log(`⚠️  Produto já existe: ${existingProduct.name}`);
          continue;
        }

        // Criar produto
        const product = await prisma.product.create({
          data: {
            cjProductId: productData.cjProductId,
            name: productData.name,
            description: productData.description,
            images: productData.images,
            priceMin: productData.priceMin,
            priceMax: productData.priceMax
          }
        });

        console.log(`✅ Produto criado: ${product.name}`);

        // Criar variantes
        for (const variantData of productData.variants) {
          try {
            await prisma.variant.create({
              data: {
                cjVariantId: variantData.cjVariantId,
                sku: variantData.sku,
                name: variantData.name,
                image: variantData.image,
                price: variantData.price,
                stock: variantData.stock,
                productId: product.id
              }
            });

            console.log(`   ✅ Variante criada: ${variantData.name} - R$ ${variantData.price} (Estoque: ${variantData.stock})`);
            totalVariants++;
          } catch (variantError) {
            console.log(`   ❌ Erro ao criar variante: ${variantError.message}`);
          }
        }

        totalProducts++;

      } catch (productError) {
        console.log(`❌ Erro ao criar produto ${productData.name}: ${productError.message}`);
      }
    }

    console.log('\n🎉 Produtos de exemplo adicionados!');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Produtos criados: ${totalProducts}`);
    console.log(`   • Variantes criadas: ${totalVariants}`);

    // Mostrar estatísticas finais
    const finalProducts = await prisma.product.count();
    const finalVariants = await prisma.variant.count();
    
    console.log(`\n📈 Total no banco:`);
    console.log(`   • Produtos: ${finalProducts}`);
    console.log(`   • Variantes: ${finalVariants}`);

  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
addCJSampleProducts();
