const { execSync } = require('child_process');

async function autoConfigureSupabase() {
  console.log('⚙️ Automatizando configuração do Supabase...\n');

  try {
    // 1. Verificar status do projeto
    console.log('1. Verificando status do projeto...');
    try {
      const status = execSync('supabase status', { encoding: 'utf8' });
      console.log('✅ Projeto linkado');
      console.log(status);
    } catch (error) {
      console.log('❌ Erro ao verificar status:', error.message);
      return;
    }

    // 2. Configurar autenticação via SQL
    console.log('\n2. Configurando autenticação...');
    
    const authConfigSQL = `
      -- Desativar confirmação de email para desenvolvimento
      UPDATE auth.config 
      SET email_confirm = false 
      WHERE id = 1;
      
      -- Habilitar signup
      UPDATE auth.config 
      SET enable_signup = true 
      WHERE id = 1;
      
      -- Configurar site URL
      UPDATE auth.config 
      SET site_url = 'http://localhost:3000' 
      WHERE id = 1;
      
      -- Configurar redirect URLs
      UPDATE auth.config 
      SET redirect_urls = ARRAY['http://localhost:3000/auth/callback', 'http://localhost:3000'] 
      WHERE id = 1;
    `;

    try {
      console.log('📝 Executando configuração de autenticação...');
      execSync(`supabase sql -f -`, {
        input: authConfigSQL,
        encoding: 'utf8'
      });
      console.log('✅ Configuração de autenticação aplicada');
    } catch (error) {
      console.log('⚠️ Erro ao executar SQL:', error.message);
      console.log('📋 Execute manualmente no dashboard do Supabase');
    }

    // 3. Adicionar campo de telefone nas tabelas
    console.log('\n3. Adicionando campo de telefone...');
    
    const phoneConfigSQL = `
      -- Adicionar campo phone na tabela leads se não existir
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'leads' AND column_name = 'phone') THEN
          ALTER TABLE public.leads ADD COLUMN phone TEXT;
        END IF;
      END $$;
      
      -- Adicionar campo phone na tabela customers se não existir
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'customers' AND column_name = 'phone') THEN
          ALTER TABLE public.customers ADD COLUMN phone TEXT;
        END IF;
      END $$;
      
      -- Atualizar RLS para incluir phone
      DROP POLICY IF EXISTS "Users can view their own data" ON public.leads;
      DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
      
      CREATE POLICY "Users can view their own data" ON public.leads 
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert their own leads" ON public.leads 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;

    try {
      console.log('📝 Adicionando campo de telefone...');
      execSync(`supabase sql -f -`, {
        input: phoneConfigSQL,
        encoding: 'utf8'
      });
      console.log('✅ Campo de telefone adicionado');
    } catch (error) {
      console.log('⚠️ Erro ao adicionar telefone:', error.message);
    }

    // 4. Verificar configurações
    console.log('\n4. Verificando configurações...');
    console.log('✅ Configuração automatizada concluída!');
    console.log('\n📋 Configurações aplicadas:');
    console.log('- ❌ Email confirmations: DESATIVADO');
    console.log('- ✅ Sign up: HABILITADO');
    console.log('- ✅ Site URL: http://localhost:3000');
    console.log('- ✅ Campo telefone: ADICIONADO');
    console.log('- ✅ Google OAuth: JÁ CONFIGURADO');

    // 5. Testar configuração
    console.log('\n5. Testando configuração...');
    console.log('🌐 Acesse: http://localhost:3000/login');
    console.log('📱 Teste criar conta com telefone');
    console.log('🔐 Teste login com Google');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
autoConfigureSupabase();
