const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CONFIGURAÇÃO AUTOMÁTICA SUPABASE - RELIET\n');

// URLs do projeto Supabase
const supabaseUrl = 'https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql';
const tableEditorUrl = 'https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/editor';

console.log('📋 CONFIGURAÇÃO COMPLETA PARA VENDAS DIRETAS VIA STRIPE');
console.log('=====================================================\n');

console.log('🎯 O QUE SERÁ CONFIGURADO:');
console.log('✅ Tabelas automatizadas para produtos e vendas');
console.log('✅ Integração com Stripe para checkout');
console.log('✅ Sistema de estoque automático');
console.log('✅ Gestão manual de pedidos');
console.log('✅ Dashboard completo para administração\n');

console.log('🔧 PASSO A PASSO:\n');

console.log('1️⃣ CONFIGURAÇÃO PRINCIPAL:');
console.log('   - Abrir SQL Editor do Supabase');
console.log('   - Executar: supabase-automation-setup.sql');
console.log('   - Aguardar execução completa\n');

console.log('2️⃣ INSERIR PRODUTOS:');
console.log('   - Executar: insert-sample-products.sql');
console.log('   - Verificar produtos inseridos\n');

console.log('3️⃣ CONFIGURAR STRIPE:');
console.log('   - Abrir Table Editor → site_settings');
console.log('   - Configurar chaves do Stripe');
console.log('   - Definir emails de admin\n');

console.log('4️⃣ TESTAR SISTEMA:');
console.log('   - Verificar produtos no dashboard');
console.log('   - Testar criação de pedidos');
console.log('   - Verificar controle de estoque\n');

// Verificar se os arquivos SQL existem
const setupFile = path.join(__dirname, '../supabase/supabase-automation-setup.sql');
const productsFile = path.join(__dirname, '../supabase/insert-sample-products.sql');

if (!fs.existsSync(setupFile)) {
  console.log('❌ ERRO: Arquivo supabase-automation-setup.sql não encontrado!');
  console.log('   Verifique se o arquivo existe em: supabase/supabase-automation-setup.sql');
  process.exit(1);
}

if (!fs.existsSync(productsFile)) {
  console.log('❌ ERRO: Arquivo insert-sample-products.sql não encontrado!');
  console.log('   Verifique se o arquivo existe em: supabase/insert-sample-products.sql');
  process.exit(1);
}

console.log('✅ ARQUIVOS SQL ENCONTRADOS:');
console.log('   - supabase-automation-setup.sql');
console.log('   - insert-sample-products.sql\n');

console.log('🔗 LINKS ÚTEIS:');
console.log('   SQL Editor: ' + supabaseUrl);
console.log('   Table Editor: ' + tableEditorUrl);
console.log('   Guia Completo: SUPABASE-SETUP-GUIDE.md\n');

// Função para abrir navegador
function openBrowser(url, description) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`❌ Erro ao abrir ${description}:`, error.message);
      console.log(`🔗 Acesse manualmente: ${url}`);
    } else {
      console.log(`✅ ${description} aberto com sucesso!`);
    }
  });
}

// Função para mostrar conteúdo do arquivo
function showFileContent(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`\n📄 CONTEÚDO DE ${description}:`);
    console.log('=====================================================');
    console.log(content.substring(0, 500) + '...');
    console.log('=====================================================');
    console.log(`📁 Arquivo completo: ${filePath}\n`);
  } catch (error) {
    console.log(`❌ Erro ao ler ${description}:`, error.message);
  }
}

// Menu interativo
console.log('🎮 MENU DE CONFIGURAÇÃO:');
console.log('1. Abrir SQL Editor (Configuração Principal)');
console.log('2. Abrir Table Editor (Configurar Stripe)');
console.log('3. Mostrar Setup SQL');
console.log('4. Mostrar Produtos SQL');
console.log('5. Abrir Guia Completo');
console.log('6. Sair\n');

// Simular input do usuário (em produção, usar readline)
console.log('💡 DICA: Para configurar o Supabase:');
console.log('   1. Escolha opção 1 para abrir SQL Editor');
console.log('   2. Cole o conteúdo de supabase-automation-setup.sql');
console.log('   3. Clique em RUN e aguarde');
console.log('   4. Repita com insert-sample-products.sql');
console.log('   5. Configure as chaves do Stripe\n');

// Abrir SQL Editor automaticamente
console.log('🚀 ABRINDO SQL EDITOR AUTOMATICAMENTE...\n');
openBrowser(supabaseUrl, 'SQL Editor do Supabase');

// Mostrar conteúdo dos arquivos
setTimeout(() => {
  showFileContent(setupFile, 'supabase-automation-setup.sql');
}, 2000);

setTimeout(() => {
  showFileContent(productsFile, 'insert-sample-products.sql');
}, 4000);

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Execute os scripts SQL no Supabase');
console.log('2. Configure as chaves do Stripe');
console.log('3. Teste o sistema de produtos');
console.log('4. Configure webhook do Stripe');
console.log('5. Teste checkout completo\n');

console.log('🎉 CONFIGURAÇÃO AUTOMÁTICA INICIADA!');
console.log('   Siga o guia SUPABASE-SETUP-GUIDE.md para detalhes completos.\n');
