const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseIntegration() {
  console.log('🧪 Testando integração com Supabase...\n');

  try {
    // 1. Testar conexão
    console.log('1. Testando conexão...');
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);

    if (settingsError) {
      console.error('❌ Erro na conexão:', settingsError.message);
      return;
    }

    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📊 Configurações encontradas: ${settings?.length || 0}\n`);

    // 2. Testar categorias
    console.log('2. Testando categorias...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('position');

    if (categoriesError) {
      console.error('❌ Erro ao buscar categorias:', categoriesError.message);
    } else {
      console.log('✅ Categorias carregadas:', categories?.length || 0);
      categories?.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
    }
    console.log('');

    // 3. Testar cupons
    console.log('3. Testando cupons...');
    const { data: coupons, error: couponsError } = await supabase
      .from('coupons')
      .select('*')
      .eq('active', true);

    if (couponsError) {
      console.error('❌ Erro ao buscar cupons:', couponsError.message);
    } else {
      console.log('✅ Cupons ativos:', coupons?.length || 0);
      coupons?.forEach(coupon => {
        console.log(`   - ${coupon.code}: ${coupon.name} (${coupon.type})`);
      });
    }
    console.log('');

    // 4. Testar configurações do site
    console.log('4. Testando configurações do site...');
    const { data: siteSettings, error: siteError } = await supabase
      .from('site_settings')
      .select('*');

    if (siteError) {
      console.error('❌ Erro ao buscar configurações:', siteError.message);
    } else {
      console.log('✅ Configurações do site:', siteSettings?.length || 0);
      siteSettings?.forEach(setting => {
        console.log(`   - ${setting.key}: ${setting.value}`);
      });
    }
    console.log('');

    // 5. Testar estrutura das tabelas
    console.log('5. Testando estrutura das tabelas...');
    const tables = ['leads', 'customers', 'products', 'orders', 'cart_items', 'favorites'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }
    console.log('');

    // 6. Testar RLS (Row Level Security)
    console.log('6. Testando Row Level Security...');
    try {
      const { data: publicProducts, error: publicError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (publicError) {
        console.log(`   ❌ Produtos públicos: ${publicError.message}`);
      } else {
        console.log(`   ✅ Produtos públicos: ${publicProducts?.length || 0} encontrados`);
      }
    } catch (err) {
      console.log(`   ❌ RLS: ${err.message}`);
    }
    console.log('');

    console.log('🎉 Teste de integração concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o SQL no Supabase Dashboard');
    console.log('2. Configure o Google OAuth');
    console.log('3. Teste o login no site');
    console.log('4. Adicione produtos reais');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testSupabaseIntegration();
