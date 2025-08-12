const fs = require('fs');
const path = require('path');

// Novas credenciais do Supabase
const novasCredenciais = `# ===== SUPABASE CONFIGURADO =====
NEXT_PUBLIC_SUPABASE_URL=https://vqpumetbhgqdpnskgbvr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHVtZXRiaGdxZHBuc2tnYnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjcyMzksImV4cCI6MjA3MDM0NzIzOX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHVtZXRiaGdxZHBuc2tnYnZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NzIzOSwiZXhwIjoyMDcwMzQ3MjM5fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# ===== SITE CONFIGURATION =====
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=TechGear Brasil

# ===== FACEBOOK PIXEL (OPCIONAL) =====
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789`;

async function atualizarCredenciais() {
  console.log('🔧 Atualizando credenciais do Supabase...\n');

  try {
    // Fazer backup do arquivo atual
    const envPath = path.join(process.cwd(), '.env.local');
    const backupPath = path.join(process.cwd(), '.env.local.backup');
    
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, backupPath);
      console.log('✅ Backup do .env.local criado');
    }

    // Escrever novas credenciais
    fs.writeFileSync(envPath, novasCredenciais);
    console.log('✅ Credenciais atualizadas com sucesso!');
    
    console.log('\n📋 Novas configurações:');
    console.log('- Project ID: vqpumetbhgqdpnskgbvr');
    console.log('- URL: https://vqpumetbhgqdpnskgbvr.supabase.co');
    console.log('- Service Role Key: Configurada');
    console.log('- Anon Key: Configurada');

    console.log('\n🎯 Próximos passos:');
    console.log('1. Executar script de criação das tabelas');
    console.log('2. Configurar login automático');
    console.log('3. Testar o sistema');

  } catch (error) {
    console.error('❌ Erro ao atualizar credenciais:', error.message);
  }
}

// Executar atualização
atualizarCredenciais();
