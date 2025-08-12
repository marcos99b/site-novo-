#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { cjClient } = require('../src/lib/cj.ts');

const prisma = new PrismaClient();

async function syncCJProducts() {
  console.log('🔄 Iniciando sincronização de produtos da CJ Dropshipping...\n');

  try {
    // Autenticar com a CJ
    console.log('🔐 Autenticando com a CJ Dropshipping...');
    await cjClient.authenticate();
    console.log('✅ Autenticação realizada com sucesso!\n');

    // Buscar produtos da CJ
    console.log('📦 Buscando produtos da CJ...');
    const cjProducts = await cjClient.queryProducts({
      pageNum: 1,
      pageSize: 50,
      keyword: 'phone' // Buscar produtos de telefone como exemplo
    });

    if (!cjProducts?.data?.list) {
      console.log('❌ Nenhum produto encontrado na CJ');
      return;
    }

    console.log(`✅ Encontrados ${cjProducts.data.list.length} produtos na CJ\n`);

    // Sincronizar cada produto
    for (const cjProduct of cjProducts.data.list) {
      try {
        console.log(`📱 Processando produto: ${cjProduct.productName}`);

        // Verificar se o produto já existe
        const existingProduct = await prisma.product.findUnique({
          where: { cjProductId: cjProduct.productId }
        });

        if (existingProduct) {
          console.log(`   ⚠️  Produto já existe: ${existingProduct.name}`);
          continue;
        }

        // Criar produto no banco
        const product = await prisma.product.create({
          data: {
            cjProductId: cjProduct.productId,
            name: cjProduct.productName,
            description: cjProduct.productDesc || '',
            images: cjProduct.images || [],
            priceMin: parseFloat(cjProduct.price) || 0,
            priceMax: parseFloat(cjProduct.price) || 0
          }
        });

        console.log(`   ✅ Produto criado: ${product.name}`);

        // Buscar variantes do produto
        const productDetail = await cjClient.getProductDetail(cjProduct.productId);
        
        if (productDetail?.data?.variants) {
          for (const cjVariant of productDetail.data.variants) {
            try {
              await prisma.variant.create({
                data: {
                  cjVariantId: cjVariant.vid,
                  sku: cjVariant.sku || cjVariant.vid,
                  name: cjVariant.name || cjProduct.productName,
                  image: cjVariant.image || cjProduct.images?.[0] || '',
                  price: parseFloat(cjVariant.price) || 0,
                  stock: parseInt(cjVariant.stock) || 0,
                  productId: product.id
                }
              });

              console.log(`      ✅ Variante criada: ${cjVariant.name} - R$ ${cjVariant.price}`);
            } catch (variantError) {
              console.log(`      ❌ Erro ao criar variante: ${variantError.message}`);
            }
          }
        }

        console.log('');

      } catch (productError) {
        console.log(`❌ Erro ao processar produto ${cjProduct.productName}: ${productError.message}`);
      }
    }

    console.log('🎉 Sincronização concluída!');

    // Mostrar estatísticas
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.variant.count();
    
    console.log('\n📊 Estatísticas:');
    console.log(`   • Produtos no banco: ${totalProducts}`);
    console.log(`   • Variantes no banco: ${totalVariants}`);

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar sincronização
syncCJProducts();
