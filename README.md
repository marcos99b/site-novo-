# Beyond Chargers Brasil - E-commerce com CJ Dropshipping

Sistema de e-commerce integrado com CJ Dropshipping e CRM no Supabase.

## 🚀 Funcionalidades

- **Integração direta com CJ Dropshipping API**
- **CRM completo no Supabase**
- **Sincronização automática de produtos e estoque**
- **Gestão de leads e clientes**
- **Sistema de pedidos integrado**

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- Conta no CJ Dropshipping
- Projeto Supabase

## ⚙️ Configuração

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# CJ Dropshipping API
CJ_API_BASE=https://developer-api.cjdropshipping.com
CJ_API_KEY=your_cj_api_key_here

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Beyond Chargers Brasil
NEXT_PUBLIC_DEFAULT_PRODUCT_ID=2408300610371613200
```

### 3. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Obtenha as credenciais de conexão
3. Execute o comando para criar as tabelas:

```bash
npx prisma db push
```

### 4. Configurar CJ Dropshipping

1. Acesse o [CJ Dropshipping Developer Portal](https://developers.cjdropshipping.com)
2. Crie uma aplicação e obtenha sua API Key
3. Adicione a API Key no arquivo `.env.local`

## 🛠️ Comandos úteis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Iniciar em produção
pnpm run start
```

### Sincronização com CJ

```bash
# Sincronizar produtos
node scripts/sync-cj.js products

# Sincronizar estoque
node scripts/sync-cj.js stock

# Sincronizar tudo
node scripts/sync-cj.js all
```

### Banco de dados

```bash
# Aplicar migrações
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

## 📡 APIs disponíveis

### CJ Dropshipping

- `POST /api/cj/sync` - Sincronizar produtos
- `POST /api/cj/stock` - Sincronizar estoque
- `GET /api/cj/stock?productId=...` - Buscar estoque de um produto

### CRM

- `GET /api/crm/leads` - Listar leads
- `POST /api/crm/leads` - Criar lead
- `GET /api/crm/customers?email=...` - Buscar cliente
- `POST /api/crm/customers` - Criar cliente
- `PUT /api/crm/customers` - Atualizar cliente

### Produtos

- `GET /api/products` - Listar produtos
- `POST /api/products` - Sincronizar produtos (legado)

## 🏗️ Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── cj/           # APIs CJ Dropshipping
│   │   ├── crm/          # APIs CRM
│   │   └── products/     # APIs de produtos
│   ├── catalogo/         # Página do catálogo
│   ├── pedidos/          # Página de pedidos
│   └── produto/          # Página de produto
├── lib/
│   ├── cj.ts            # Cliente CJ Dropshipping
│   ├── supabase.ts      # Cliente Supabase
│   └── db.ts            # Cliente Prisma
└── styles/
    └── globals.css      # Estilos globais
```

## 🔧 Configuração do CRM

O sistema inclui um CRM completo com:

- **Customers**: Gestão de clientes
- **Leads**: Gestão de leads/prospects
- **Contacts**: Histórico de contatos
- **Orders**: Pedidos vinculados a clientes

### Modelos do banco

```prisma
model Customer {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  phone       String?
  address     Json?
  orders      Order[]
  leads       Lead[]
}

model Lead {
  id          String   @id @default(cuid())
  email       String
  name        String?
  phone       String?
  source      String   @default("website")
  status      String   @default("new")
  notes       String?
  customer    Customer? @relation(fields: [customerId], references: [id])
}

model Contact {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  type        String   // email, phone, chat, support
  subject     String?
  message     String
  status      String   @default("open")
}
```

## 🚀 Deploy

### Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outros provedores

Certifique-se de configurar as variáveis de ambiente necessárias no seu provedor de hospedagem.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do servidor
2. Teste as APIs individualmente
3. Verifique a conectividade com CJ e Supabase

## 📄 Licença

Este projeto é privado e proprietário da Beyond Chargers Brasil.
# Force Vercel Deploy Thu Aug 14 21:32:22 -03 2025
