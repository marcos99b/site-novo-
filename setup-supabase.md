# Configuração do Supabase - Beyond Chargers Brasil

## 🚀 Passo a Passo para Configurar o Supabase

### 1. Acessar o Dashboard do Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Acesse o projeto: **ljfxpzcdrctqmfydofdh**

### 2. Configurar as Tabelas

1. No dashboard, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole todo o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **Run** para executar o SQL

### 3. Obter as Credenciais

1. Vá para **Settings** > **API**
2. Copie as seguintes informações:

#### Project URL
```
https://ljfxpzcdrctqmfydofdh.supabase.co
```

#### anon/public key
```
[COPIAR A CHAVE ANON AQUI]
```

#### Database Password
```
8J8gt8V6F-Y6$W6
```

### 4. Configurar Variáveis de Ambiente

Adicione estas variáveis ao seu arquivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ljfxpzcdrctqmfydofdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_CHAVE_ANON_AQUI]

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:8J8gt8V6F-Y6$W6@db.ljfxpzcdrctqmfydofdh.supabase.co:5432/postgres?sslmode=require
```

### 5. Testar a Conexão

Após configurar, execute:

```bash
npx prisma db push
```

### 6. Verificar as Tabelas

No Supabase Dashboard, vá para **Table Editor** e verifique se as seguintes tabelas foram criadas:

- ✅ Product
- ✅ Variant  
- ✅ Customer
- ✅ Order
- ✅ OrderItem
- ✅ Lead
- ✅ Contact

## 🔧 Configurações Adicionais

### Habilitar Row Level Security (Opcional)

Se quiser habilitar RLS para segurança adicional:

1. Vá para **Authentication** > **Policies**
2. Habilite RLS para cada tabela conforme necessário

### Configurar Storage (Opcional)

Para upload de imagens:

1. Vá para **Storage**
2. Crie um bucket chamado `product-images`
3. Configure as políticas de acesso

## 🚨 Troubleshooting

### Erro de Conexão
Se houver erro de conexão:
1. Verifique se o projeto está ativo
2. Confirme se a senha está correta
3. Teste a conectividade: `ping db.ljfxpzcdrctqmfydofdh.supabase.co`

### Erro de Permissão
Se houver erro de permissão:
1. Verifique se você tem acesso ao projeto
2. Confirme se as credenciais estão corretas
3. Tente regenerar a API key

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs no Supabase Dashboard
2. Teste as APIs individualmente
3. Consulte a documentação do Supabase
