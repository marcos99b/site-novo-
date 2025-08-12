## Guia operacional do site Reliet

Este documento resume como rodar o projeto, onde ficam credenciais (Supabase/Stripe), scripts de terminal, rotas do site e o que foi implementado.

### 1) Rodando localmente

```bash
# Instalar dependências
pnpm i  # ou: npm i

# Iniciar o dev server (porta 3000)
pnpm dev  # ou: npm run dev

# Se a 3000 estiver ocupada
npx next dev -p 3001
```

### 2) Credenciais (.env.local)

Arquivo: `.env.local` na raiz. Principais chaves:
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

Comandos úteis:
```bash
cat .env.local
grep -E "SUPABASE|STRIPE|NEXT_PUBLIC_" .env.local
bash scripts/stripe-set-key-visible.sh     # define STRIPE_SECRET_KEY e roda autorun
bash scripts/find-stripe-key.sh            # tenta localizar a chave da Stripe
```

Scripts para Supabase:
```bash
node scripts/create-list-tables-rpc.js     # cria RPC list_tables
node scripts/list-all-tables.js            # lista tabelas por schema
node scripts/check-supabase-tracking.js    # verifica user_events/product_views/leads
```

### 3) Supabase (tabelas e acompanhamento)

Principais tabelas (schema public): user_events, user_sessions, analytics_summary, products, product_images, product_views, orders, order_items, payments, leads, customers, cart_items, favorites, categories, site_settings, addresses, order_tracking, banners, product_reviews, coupons.

Consultas rápidas:
```sql
-- Funil (carrinho/checkout)
select * from user_events
where event_type in ('cart_opened','add_to_cart','checkout_started','checkout_cancelled')
order by timestamp desc limit 200;

-- Views de produto (24h)
select product_id, count(*) as views
from product_views
where created_at > now() - interval '24 hours'
group by product_id order by views desc;
```

### 4) Stripe

APIs internas: POST /api/stripe/create-checkout, POST /api/stripe/webhook.

Automação/CLI:
```bash
node scripts/stripe-autorun.js             # cria/atualiza produtos e preços (usa STRIPE_SECRET_KEY)
bash scripts/stripe-create-products.sh     # versão via CLI, não interativa
```

### 5) Rotas do site

- `/` Home (destaques de `/api/products?featured=true`)
- `/catalogo` Catálogo completo com filtros
- `/produto/[id]` Página de produto: galeria com thumbnails, copy refinada, seleção de tamanho, escassez 3D
- `/checkout/success` e `/checkout/cancel` Retornos do checkout (eventos gravados no Supabase)
- `/pedidos`, `/enderecos`, `/pagamentos`, `/perfil` Áreas de conta
- `/ajuda`, `/trocas-devolucoes`, `/garantia`, `/contato` Institucionais
- `/monitoring` Painel de monitoramento (dev)

Topo: ícones padronizados (busca removida a pedido, carrinho com SVG nítido, login).

### 6) APIs internas

- `GET /api/products`
  - Junta Prisma + `public/produtos/manifest.json` (prioriza imagens locais)
  - Curadoria automática de nomes (PT sofisticado) e deduplicação
  - Remove menções a “CJ” das descrições
- `GET /api/products?featured=true` destaques
- `GET /api/products?search=...` busca server-side
- `POST /api/stripe/create-checkout` cria sessão de checkout
- `POST /api/stripe/webhook` recebe eventos
- `GET /api/monitoring` dados do painel

### 7) Imagens de produto

- Mapeadas em `public/produtos/manifest.json` (ingestão via script a partir de `~/Downloads/Imagens produtos`)
- Frontend usa manifest; fallback `/placeholder.jpg`

### 8) Implementações recentes

- Loader elegante na página de produto
- `/checkout/cancel` com card claro
- Depoimentos por produto → “Experiências das clientes” (dinâmico, com avatares das próprias imagens)
- “Detalhes da peça” com espaçamento e lista de cuidados
- Logo: mantém “RELIET”, tagline trocada para “ELEGANCE MADE MODERN”
- Ícone do carrinho redesenhado e carrinho padronizado para tema claro
- Busca removida
- Curadoria de nomes e deduplicação; remoção de “CJ” nas descrições

### 9) Diagnósticos rápidos

```bash
node scripts/check-supabase-tracking.js
node scripts/list-all-tables.js
cat .env.local
npx next dev -p 3001
```

### 10) Onde editar

- Páginas: `src/app/...`
- Componentes: `src/components/...`
- Estilos globais: `src/styles/globals.css`
- APIs: `src/app/api/...`
- Scripts: `scripts/*`


