# Configuração de Variáveis de Ambiente

Copie este arquivo para `.env.local` e configure as variáveis necessárias:

```bash
# ===== SUPABASE (OBRIGATÓRIO) =====
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# ===== GOOGLE OAUTH (OPCIONAL) =====
# Para login com Google, configure no Supabase Dashboard:
# 1. Vá para Authentication > Providers
# 2. Ative Google
# 3. Configure Client ID e Client Secret
# 4. Adicione URL de redirecionamento: https://seu-dominio.com/auth/callback

# ===== SITE CONFIGURATION =====
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=TechGear Brasil

# ===== FACEBOOK PIXEL (OPCIONAL) =====
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=seu_pixel_id

# ===== REDIS (OPCIONAL) =====
REDIS_URL=redis://localhost:6379
```

## 🔧 Como Configurar:

### 1. **Supabase Setup:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie a URL e anon key
5. Configure as variáveis no `.env.local`

### 2. **Google OAuth Setup:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou use existente
3. Ative Google+ API
4. Crie credenciais OAuth 2.0
5. Configure no Supabase Dashboard

### 3. **Banco de Dados:**
Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Tabela de leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT CHECK (source IN ('google', 'email', 'manual')) DEFAULT 'email',
  status TEXT CHECK (status IN ('active', 'inactive', 'converted')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  items JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas para leads
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. **Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 🔒 **Notas de Segurança:**
- ⚠️ **NUNCA** commite o arquivo `.env.local`
- 🔐 Mantenha suas credenciais seguras
- 🌐 Use HTTPS em produção
- 📧 Configure email de confirmação no Supabase

## 🚀 **Próximos Passos:**
1. Configure o Supabase
2. Configure o Google OAuth
3. Execute os comandos SQL
4. Teste o login
5. Configure o domínio em produção
