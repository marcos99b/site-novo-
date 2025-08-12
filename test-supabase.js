const { createClient } = require('@supabase/supabase-js');

// Configuração temporária para teste
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwenNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTE2ODUsImV4cCI6MjA3MDI2NzY4NX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Placeholder

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Testar conexão básica
    console.log('📡 Testando conexão básica...');
    const { data, error } = await supabase.from('Product').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log('📊 Dados recebidos:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    return false;
  }
}

async function createTestData() {
  console.log('📝 Criando dados de teste...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Criar um produto de teste
    const { data: product, error: productError } = await supabase
      .from('Product')
      .insert({
        id: 'test-product-' + Date.now(),
        cjProductId: 'test-cj-' + Date.now(),
        name: 'Produto de Teste',
        description: 'Descrição do produto de teste',
        images: ['https://via.placeholder.com/300'],
        priceMin: 29.99,
        priceMax: 39.99
      })
      .select()
      .single();
    
    if (productError) {
      console.error('❌ Erro ao criar produto:', productError.message);
      return false;
    }
    
    console.log('✅ Produto de teste criado:', product);
    
    // Criar um lead de teste
    const { data: lead, error: leadError } = await supabase
      .from('Lead')
      .insert({
        id: 'test-lead-' + Date.now(),
        email: 'teste@exemplo.com',
        name: 'Cliente Teste',
        source: 'website',
        status: 'new'
      })
      .select()
      .single();
    
    if (leadError) {
      console.error('❌ Erro ao criar lead:', leadError.message);
      return false;
    }
    
    console.log('✅ Lead de teste criado:', lead);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando testes do Supabase...\n');
  
  const connectionTest = await testSupabaseConnection();
  
  if (connectionTest) {
    console.log('\n📊 Testando criação de dados...');
    await createTestData();
  }
  
  console.log('\n✨ Testes concluídos!');
}

main().catch(console.error);
