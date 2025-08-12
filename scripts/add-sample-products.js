#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    cjProductId: '2408300610371613200',
    name: 'Carregador Magnético 15W para iPhone',
    description: 'Carregador magnético rápido de 15W compatível com iPhone 12/13/14/15. Design elegante com cabo USB-C incluído.',
    images: [
      'https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587825140400-7e26100a2a89?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop'
    ],
    priceMin: 89.90,
    priceMax: 99.90,
    variants: [
      {
        cjVariantId: 'v1-2408300610371613200',
        sku: 'MAG-15W-WHITE',
        name: 'Branco',
        image: 'https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=800&auto=format&fit=crop',
        price: 89.90,
        stock: 25
      },
      {
        cjVariantId: 'v2-2408300610371613200',
        sku: 'MAG-15W-BLACK',
        name: 'Preto',
        image: 'https://images.unsplash.com/photo-1587825140400-7e26100a2a89?q=80&w=800&auto=format&fit=crop',
        price: 94.90,
        stock: 18
      }
    ]
  },
  {
    cjProductId: '2408300610371613201',
    name: 'Base Magnética 3-em-1 Universal',
    description: 'Carregador magnético 3-em-1 para iPhone, Apple Watch e AirPods. Design compacto e portátil.',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560841656-1fec1fb6256e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop'
    ],
    priceMin: 129.90,
    priceMax: 149.90,
    variants: [
      {
        cjVariantId: 'v1-2408300610371613201',
        sku: 'MAG-3IN1-GRAY',
        name: 'Cinza',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=800&auto=format&fit=crop',
        price: 129.90,
        stock: 12
      },
      {
        cjVariantId: 'v2-2408300610371613201',
        sku: 'MAG-3IN1-BLUE',
        name: 'Azul',
        image: 'https://images.unsplash.com/photo-1560841656-1fec1fb6256e?q=80&w=800&auto=format&fit=crop',
        price: 139.90,
        stock: 8
      }
    ]
  },
  {
    cjProductId: '2408300610371613202',
    name: 'Carregador Sem Fio 10W',
    description: 'Carregador sem fio de 10W com design minimalista. Compatível com todos os smartphones com carregamento sem fio.',
    images: [
      'https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587825140400-7e26100a2a89?q=80&w=800&auto=format&fit=crop'
    ],
    priceMin: 59.90,
    priceMax: 69.90,
    variants: [
      {
        cjVariantId: 'v1-2408300610371613202',
        sku: 'WIRELESS-10W-WHITE',
        name: 'Branco',
        image: 'https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=800&auto=format&fit=crop',
        price: 59.90,
        stock: 35
      },
      {
        cjVariantId: 'v2-2408300610371613202',
        sku: 'WIRELESS-10W-BLACK',
        name: 'Preto',
        image: 'https://images.unsplash.com/photo-1587825140400-7e26100a2a89?q=80&w=800&auto=format&fit=crop',
        price: 64.90,
        stock: 28
      }
    ]
  },
  {
    cjProductId: '2408300610371613203',
    name: 'Carregador Magnético para Carro',
    description: 'Suporte magnético para carro com carregamento rápido. Fixação no painel ou ar condicionado.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop'
    ],
    priceMin: 79.90,
    priceMax: 89.90,
    variants: [
      {
        cjVariantId: 'v1-2408300610371613203',
        sku: 'CAR-MAG-SILVER',
        name: 'Prata',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        price: 79.90,
        stock: 15
      },
      {
        cjVariantId: 'v2-2408300610371613203',
        sku: 'CAR-MAG-BLACK',
        name: 'Preto',
        image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop',
        price: 84.90,
        stock: 12
      }
    ]
  }
];

async function addSampleProducts() {
  console.log('🔄 Adicionando produtos de exemplo...\n');
  
  try {
    let totalAdded = 0;
    
    for (const productData of sampleProducts) {
      console.log(`📦 Processando: ${productData.name}`);
      
      // Criar produto
      const product = await prisma.product.upsert({
        where: { cjProductId: productData.cjProductId },
        create: {
          cjProductId: productData.cjProductId,
          name: productData.name,
          description: productData.description,
          images: productData.images,
          priceMin: productData.priceMin,
          priceMax: productData.priceMax,
        },
        update: {
          name: productData.name,
          description: productData.description,
          images: productData.images,
          priceMin: productData.priceMin,
          priceMax: productData.priceMax,
        },
      });
      
      console.log(`  ✅ Produto criado: ${product.id}`);
      
      // Criar variantes
      for (const variantData of productData.variants) {
        await prisma.variant.upsert({
          where: { cjVariantId: variantData.cjVariantId },
          create: {
            cjVariantId: variantData.cjVariantId,
            sku: variantData.sku,
            name: variantData.name,
            image: variantData.image,
            price: variantData.price,
            stock: variantData.stock,
            productId: product.id,
          },
          update: {
            sku: variantData.sku,
            name: variantData.name,
            image: variantData.image,
            price: variantData.price,
            stock: variantData.stock,
            productId: product.id,
          },
        });
        
        console.log(`    🎨 Variante criada: ${variantData.name} - R$ ${variantData.price}`);
      }
      
      totalAdded++;
    }
    
    // Verificar total
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.variant.count();
    
    console.log(`\n🎉 Produtos adicionados com sucesso!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Produtos adicionados: ${totalAdded}`);
    console.log(`   - Total de produtos: ${totalProducts}`);
    console.log(`   - Total de variantes: ${totalVariants}`);
    
    console.log(`\n💡 Agora você pode verificar o catálogo em: http://localhost:3000/catalogo`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
addSampleProducts();
