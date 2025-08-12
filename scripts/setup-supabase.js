#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabase() {
  console.log('🚀 Configurando Supabase para TechStore...\n');

  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250108_create_ecommerce_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Executando migração do banco de dados...');
    
    // Executar a migração
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      return;
    }

    console.log('✅ Migração executada com sucesso!');

    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const tables = ['products', 'categories', 'product_images', 'customers', 'orders', 'order_items', 'cart_items', 'product_reviews', 'coupons'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: Erro - ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: Criada com sucesso`);
      }
    }

    // Verificar dados inseridos
    console.log('\n📊 Verificando dados inseridos...');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, slug, price');
    
    if (productsError) {
      console.log('❌ Erro ao verificar produtos:', productsError.message);
    } else {
      console.log(`✅ ${products.length} produtos inseridos:`);
      products.forEach(product => {
        console.log(`   - ${product.name} (${product.slug}) - R$ ${product.price}`);
      });
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name, slug');
    
    if (categoriesError) {
      console.log('❌ Erro ao verificar categorias:', categoriesError.message);
    } else {
      console.log(`✅ ${categories.length} categorias inseridas:`);
      categories.forEach(category => {
        console.log(`   - ${category.name} (${category.slug})`);
      });
    }

    console.log('\n🎉 Configuração do Supabase concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente no .env.local');
    console.log('2. Teste a API: npm run dev');
    console.log('3. Acesse: http://localhost:3000');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupSupabase();
}

module.exports = { setupSupabase };
