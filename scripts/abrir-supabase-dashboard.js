const { exec } = require('child_process');

console.log('🚀 Abrindo Supabase Dashboard...\n');

// URL do seu projeto Supabase
const supabaseUrl = 'https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql';

console.log('📋 INSTRUÇÕES:');
console.log('1. O Supabase Dashboard será aberto automaticamente');
console.log('2. Cole o conteúdo do arquivo CRIAR-TABELAS-COMPLETAS.sql');
console.log('3. Clique em "RUN" para executar');
console.log('4. Aguarde a execução completar');
console.log('5. Verifique se as tabelas foram criadas');

console.log('\n📁 Arquivo SQL: CRIAR-TABELAS-COMPLETAS.sql');
console.log('🔗 Dashboard: ' + supabaseUrl);

// Abrir o navegador
const platform = process.platform;
let command;

if (platform === 'darwin') {
  // macOS
  command = `open "${supabaseUrl}"`;
} else if (platform === 'win32') {
  // Windows
  command = `start "${supabaseUrl}"`;
} else {
  // Linux
  command = `xdg-open "${supabaseUrl}"`;
}

exec(command, (error) => {
  if (error) {
    console.log('❌ Erro ao abrir navegador:', error.message);
    console.log('🔗 Acesse manualmente:', supabaseUrl);
  } else {
    console.log('✅ Navegador aberto com sucesso!');
  }
});

console.log('\n📋 PRÓXIMOS PASSOS APÓS EXECUTAR O SQL:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:3000/login');
console.log('3. Teste criar uma conta');
console.log('4. Verifique se o login automático funciona');
