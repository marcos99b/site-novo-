require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 INSERINDO PRODUTOS DE TESTE NO SUPABASE - RELIET\n');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltando');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Configurado' : '❌ Faltando');
  console.log('\n🔧 Configure as variáveis no arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Produtos de teste baseados no catálogo atual
const testProducts = [
  {
    name: "Solid color slimming long sleeve pocket woolen women's coat",
    slug: "casaco-la-classico",
    description: "Casaco elegante em lã natural com design atemporal. Perfeito para o inverno português, oferece conforto e sofisticação em qualquer ocasião.",
    short_description: "Casaco elegante em lã natural para o inverno",
    price: 89.90,
    original_price: 129.90,
    compare_at_price: 89.90,
    stock: 25,
    status: "publish",
    featured: true,
    category: "Casacos"
  },
  {
    name: "Lightly Mature Cotton And Linen Suit Women",
    slug: "conjunto-algodao-linho",
    description: "Conjunto sofisticado em algodão e linho natural. Ideal para o dia a dia, oferece conforto e elegância com tecido premium que não marca.",
    short_description: "Conjunto sofisticado em algodão e linho natural",
    price: 79.90,
    original_price: 99.90,
    compare_at_price: 79.90,
    stock: 30,
    status: "publish",
    featured: true,
    category: "Conjuntos"
  },
  {
    name: "New loose slimming temperament casual cotton linen top",
    slug: "colete-tricot-decote-v",
    description: "Colete elegante em tricot com decote em V. Perfeito para layering, oferece versatilidade do dia ao jantar com caimento que valoriza a silhueta.",
    short_description: "Colete elegante em tricot com decote em V",
    price: 69.90,
    original_price: 89.90,
    compare_at_price: 69.90,
    stock: 35,
    status: "publish",
    featured: true,
    category: "Coletes"
  },
  {
    name: "Fashion all-match comfort and casual woolen turn-down collar coat",
    slug: "colete-com-fivela",
    description: "Colete sofisticado com fivela metálica. Design moderno e elegante, perfeito para criar looks sofisticados e atemporais.",
    short_description: "Colete sofisticado com fivela metálica",
    price: 74.90,
    original_price: 94.90,
    compare_at_price: 74.90,
    stock: 28,
    status: "publish",
    featured: true,
    category: "Coletes"
  },
  {
    name: "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest",
    slug: "blazer-tricot-premium",
    description: "Blazer premium em tricot de alta qualidade. Caimento impecável que realça a elegância natural da silhueta feminina.",
    short_description: "Blazer premium em tricot de alta qualidade",
    price: 94.90,
    original_price: 119.90,
    compare_at_price: 94.90,
    stock: 22,
    status: "publish",
    featured: true,
    category: "Blazers"
  },
  {
    name: "Metal buckle slit knitted vest slim fit vest foreign trade TUP cardigan",
    slug: "colete-tricot-decote-v-premium",
    description: "Versão premium do colete tricot com decote em V. Tecido nobre de alta qualidade que proporciona conforto excepcional sem marcar.",
    short_description: "Versão premium do colete tricot com decote em V",
    price: 84.90,
    original_price: 104.90,
    compare_at_price: 84.90,
    stock: 18,
    status: "publish",
    featured: true,
    category: "Coletes"
  }
];

// Variantes para cada produto
const productVariants = {
  "casaco-la-classico": [
    { name: "Preto - M", sku: "CL-P-M", price: 89.90, stock: 8, attributes: { color: "preto", size: "M" } },
    { name: "Preto - L", sku: "CL-P-L", price: 89.90, stock: 9, attributes: { color: "preto", size: "L" } },
    { name: "Bege - M", sku: "CL-B-M", price: 89.90, stock: 4, attributes: { color: "bege", size: "M" } },
    { name: "Bege - L", sku: "CL-B-L", price: 89.90, stock: 4, attributes: { color: "bege", size: "L" } }
  ],
  "conjunto-algodao-linho": [
    { name: "Branco - S", sku: "CAL-B-S", price: 79.90, stock: 10, attributes: { color: "branco", size: "S" } },
    { name: "Branco - M", sku: "CAL-B-M", price: 79.90, stock: 12, attributes: { color: "branco", size: "M" } },
    { name: "Branco - L", sku: "CAL-B-L", price: 79.90, stock: 8, attributes: { color: "branco", size: "L" } }
  ],
  "colete-tricot-decote-v": [
    { name: "Cinza - M", sku: "CTD-C-M", price: 69.90, stock: 12, attributes: { color: "cinza", size: "M" } },
    { name: "Cinza - L", sku: "CTD-C-L", price: 69.90, stock: 10, attributes: { color: "cinza", size: "L" } },
    { name: "Preto - M", sku: "CTD-P-M", price: 69.90, stock: 8, attributes: { color: "preto", size: "M" } },
    { name: "Preto - L", sku: "CTD-P-L", price: 69.90, stock: 5, attributes: { color: "preto", size: "L" } }
  ],
  "colete-com-fivela": [
    { name: "Preto - M", sku: "CF-P-M", price: 74.90, stock: 9, attributes: { color: "preto", size: "M" } },
    { name: "Preto - L", sku: "CF-P-L", price: 74.90, stock: 8, attributes: { color: "preto", size: "L" } },
    { name: "Bege - M", sku: "CF-B-M", price: 74.90, stock: 6, attributes: { color: "bege", size: "M" } },
    { name: "Bege - L", sku: "CF-B-L", price: 74.90, stock: 5, attributes: { color: "bege", size: "L" } }
  ],
  "blazer-tricot-premium": [
    { name: "Preto - S", sku: "BTP-P-S", price: 94.90, stock: 6, attributes: { color: "preto", size: "S" } },
    { name: "Preto - M", sku: "BTP-P-M", price: 94.90, stock: 8, attributes: { color: "preto", size: "M" } },
    { name: "Preto - L", sku: "BTP-P-L", price: 94.90, stock: 5, attributes: { color: "preto", size: "L" } },
    { name: "Bege - M", sku: "BTP-B-M", price: 94.90, stock: 3, attributes: { color: "bege", size: "M" } }
  ],
  "colete-tricot-decote-v-premium": [
    { name: "Preto - M", sku: "CTDP-P-M", price: 84.90, stock: 6, attributes: { color: "preto", size: "M" } },
    { name: "Preto - L", sku: "CTDP-P-L", price: 84.90, stock: 5, attributes: { color: "preto", size: "L" } },
    { name: "Cinza - M", sku: "CTDP-C-M", price: 84.90, stock: 4, attributes: { color: "cinza", size: "M" } },
    { name: "Cinza - L", sku: "CTDP-C-L", price: 84.90, stock: 3, attributes: { color: "cinza", size: "L" } }
  ]
};

// Imagens para cada produto (baseado no manifest atual)
const productImages = {
  "casaco-la-classico": [
    { src: "/produtos/produto-1/1.jpg", alt: "Casaco de Lã Clássico - Vista Frontal", position: 0, is_primary: true },
    { src: "/produtos/produto-1/2.jpg", alt: "Casaco de Lã Clássico - Vista Lateral", position: 1, is_primary: false },
    { src: "/produtos/produto-1/3.jpg", alt: "Casaco de Lã Clássico - Detalhe", position: 2, is_primary: false },
    { src: "/produtos/produto-1/4.jpg", alt: "Casaco de Lã Clássico - Detalhe", position: 3, is_primary: false }
  ],
  "conjunto-algodao-linho": [
    { src: "/produtos/produto-2/1.jpg", alt: "Conjunto Algodão & Linho - Vista Frontal", position: 0, is_primary: true },
    { src: "/produtos/produto-2/2.jpg", alt: "Conjunto Algodão & Linho - Vista Lateral", position: 1, is_primary: false },
    { src: "/produtos/produto-2/3.jpg", alt: "Conjunto Algodão & Linho - Detalhe", position: 2, is_primary: false },
    { src: "/produtos/produto-2/4.jpg", alt: "Conjunto Algodão & Linho - Detalhe", position: 3, is_primary: false },
    { src: "/produtos/produto-2/5.jpg", alt: "Conjunto Algodão & Linho - Detalhe", position: 4, is_primary: false },
    { src: "/produtos/produto-2/6.jpg", alt: "Conjunto Algodão & Linho - Detalhe", position: 5, is_primary: false }
  ],
  "colete-tricot-decote-v": [
    { src: "/produtos/produto-3/1_262b7683-9325-4138-b494-dfcd1b58c692.jpg", alt: "Colete Tricot Decote V - Vista Frontal", position: 0, is_primary: true },
    { src: "/produtos/produto-3/2_02a8383f-6ee5-4ef7-84e1-5ddd40f91bbc.jpg", alt: "Colete Tricot Decote V - Vista Lateral", position: 1, is_primary: false },
    { src: "/produtos/produto-3/3_a64e8d83-57d2-4ed4-9a4e-110f700e9803.jpg", alt: "Colete Tricot Decote V - Detalhe", position: 2, is_primary: false }
  ],
  "colete-com-fivela": [
    { src: "/produtos/produto-4/1_3581f772-d674-4f66-aa87-237dc2678474.jpg", alt: "Colete com Fivela - Vista Frontal", position: 0, is_primary: true },
    { src: "/produtos/produto-4/2_f28c894d-956d-4e06-9b7e-53289b9f9f40.jpg", alt: "Colete com Fivela - Vista Lateral", position: 1, is_primary: false },
    { src: "/produtos/produto-4/3_881c4b24-6135-4947-a072-8c762a4e80e7.jpg", alt: "Colete com Fivela - Detalhe", position: 2, is_primary: false }
  ],
  "blazer-tricot-premium": [
    { src: "/produtos/produto-5/1.jpg", alt: "Blazer Tricot Premium - Vista Frontal", position: 0, is_primary: true },
    { src: "/produtos/produto-5/2.jpg", alt: "Blazer Tricot Premium - Vista Lateral", position: 1, is_primary: false },
    { src: "/produtos/produto-5/3.jpg", alt: "Blazer Tricot Premium - Detalhe", position: 2, is_primary: false },
    { src: "/produtos/produto-5/4.jpg", alt: "Blazer Tricot Premium - Detalhe", position: 3, is_primary: false },
    { src: "/produtos/produto-5/5.jpg", alt: "Blazer Tricot Premium - Detalhe", position: 4, is_primary: false },
    { src: "/produtos/produto-5/6.jpg", alt: "Blazer Tricot Premium - Detalhe", position: 5, is_primary: false }
  ],
  "colete-tricot-decote-v-premium": [
    { src: "/produtos/produto-6/1.jpg", alt: "Colete Tricot Decote V Premium - Vista Frontal", position: 0, is_primary: true },
    { src: "/produtos/produto-6/2.jpg", alt: "Colete Tricot Decote V Premium - Vista Lateral", position: 1, is_primary: false }
  ]
};

async function insertProducts() {
  console.log('📦 Inserindo produtos no Supabase...\n');
  
  for (const product of testProducts) {
    try {
      console.log(`🔄 Inserindo: ${product.name}`);
      
      // Inserir produto
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (productError) {
        console.log(`   ❌ Erro ao inserir produto: ${productError.message}`);
        continue;
      }
      
      console.log(`   ✅ Produto inserido com ID: ${productData.id}`);
      
      // Inserir imagens
      const images = productImages[product.slug] || [];
      if (images.length > 0) {
        const imageData = images.map(img => ({
          product_id: productData.id,
          ...img
        }));
        
        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageData);
        
        if (imageError) {
          console.log(`   ⚠️  Erro ao inserir imagens: ${imageError.message}`);
        } else {
          console.log(`   ✅ ${images.length} imagens inseridas`);
        }
      }
      
      // Inserir variantes
      const variants = productVariants[product.slug] || [];
      if (variants.length > 0) {
        const variantData = variants.map(variant => ({
          product_id: productData.id,
          ...variant
        }));
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData);
        
        if (variantError) {
          console.log(`   ⚠️  Erro ao inserir variantes: ${variantError.message}`);
        } else {
          console.log(`   ✅ ${variants.length} variantes inseridas`);
        }
      }
      
      console.log(`   🎉 Produto ${product.slug} completo!\n`);
      
    } catch (error) {
      console.log(`   ❌ Erro geral: ${error.message}\n`);
    }
  }
}

async function verifyProducts() {
  console.log('🔍 Verificando produtos inseridos...\n');
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(src, alt, position, is_primary),
        product_variants(id, name, sku, price, stock, attributes)
      `)
      .eq('status', 'publish');
    
    if (error) {
      console.log(`❌ Erro ao buscar produtos: ${error.message}`);
      return;
    }
    
    console.log(`✅ ${products.length} produtos encontrados:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 Preço: ${product.price}€`);
      console.log(`   📸 Imagens: ${product.product_images?.length || 0}`);
      console.log(`   🏷️  Variantes: ${product.product_variants?.length || 0}`);
      console.log(`   📦 Estoque: ${product.stock}`);
      console.log('');
    });
    
  } catch (error) {
    console.log(`❌ Erro ao verificar produtos: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 INICIANDO INSERÇÃO DE PRODUTOS DE TESTE\n');
  
  // Verificar se as tabelas existem
  try {
    const { data: tables, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ ERRO: Tabela products não existe!');
      console.log('   Execute primeiro o script supabase-automation-setup.sql no Supabase');
      process.exit(1);
    }
    
    console.log('✅ Tabelas verificadas - Supabase configurado!\n');
    
  } catch (error) {
    console.log('❌ ERRO: Não foi possível conectar ao Supabase');
    console.log('   Verifique as variáveis de ambiente');
    process.exit(1);
  }
  
  // Inserir produtos
  await insertProducts();
  
  // Verificar resultado
  await verifyProducts();
  
  console.log('🎉 INSERÇÃO CONCLUÍDA!');
  console.log('\n🌐 Teste agora:');
  console.log('   Home: http://localhost:3000');
  console.log('   Catálogo: http://localhost:3000/catalogo');
  console.log('   Produto: http://localhost:3000/produto/1');
}

main().catch(console.error);
