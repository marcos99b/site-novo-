# 🚀 Configuração do Supabase para TechStore

## 📋 **Resumo**

Este guia mostra como configurar o Supabase para o e-commerce TechStore, incluindo todas as tabelas, dados de exemplo e configurações necessárias.

## 🔧 **Pré-requisitos**

1. **Conta no Supabase**: https://supabase.com
2. **Projeto criado** no Supabase
3. **Variáveis de ambiente** configuradas

## 📝 **Passo 1: Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# WooCommerce (opcional - para migração futura)
WOOCOMMERCE_URL=https://seusite.com
WOOCOMMERCE_CONSUMER_KEY=sua_chave_consumer
WOOCOMMERCE_CONSUMER_SECRET=seu_secret_consumer
```

## 🗄️ **Passo 2: Executar Migração**

Execute o script de configuração:

```bash
npm run setup-supabase
```

Este comando irá:
- ✅ Criar todas as tabelas necessárias
- ✅ Inserir categorias padrão
- ✅ Inserir produtos de exemplo
- ✅ Configurar índices e triggers
- ✅ Verificar se tudo foi criado corretamente

## 📊 **Estrutura do Banco de Dados**

### **Tabelas Principais**

| Tabela | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `products` | Produtos da loja | id, name, slug, price, stock_quantity |
| `categories` | Categorias de produtos | id, name, slug, description |
| `product_images` | Imagens dos produtos | id, product_id, src, alt |
| `customers` | Clientes cadastrados | id, email, name, phone, address |
| `orders` | Pedidos realizados | id, customer_id, order_number, total_amount |
| `order_items` | Itens dos pedidos | id, order_id, product_id, quantity |
| `cart_items` | Carrinho de compras | id, session_id, product_id, quantity |
| `product_reviews` | Avaliações de produtos | id, product_id, rating, comment |
| `coupons` | Cupons de desconto | id, code, type, value, valid_until |

### **Relacionamentos**

```sql
-- Produtos pertencem a categorias
products.category_id -> categories.id

-- Imagens pertencem a produtos
product_images.product_id -> products.id

-- Pedidos pertencem a clientes
orders.customer_id -> customers.id

-- Itens pertencem a pedidos
order_items.order_id -> orders.id
order_items.product_id -> products.id

-- Carrinho pertence a sessões
cart_items.product_id -> products.id

-- Avaliações pertencem a produtos
product_reviews.product_id -> products.id
```

## 🎯 **Funcionalidades Implementadas**

### **✅ Produtos**
- Listagem com filtros por categoria
- Produtos em destaque
- Controle de estoque
- Preços regulares e promocionais
- Múltiplas imagens por produto

### **✅ Categorias**
- Categorias hierárquicas
- Produtos organizados por categoria
- URLs amigáveis (slugs)

### **✅ Carrinho de Compras**
- Adicionar/remover produtos
- Atualizar quantidades
- Sessões persistentes
- Cálculo automático de totais

### **✅ Clientes**
- Cadastro de clientes
- Histórico de pedidos
- Endereços de entrega e cobrança

### **✅ Pedidos**
- Criação de pedidos
- Status de pedidos
- Itens detalhados
- Rastreamento por número

### **✅ Avaliações**
- Sistema de avaliações
- Moderação de comentários
- Média de avaliações por produto

### **✅ Cupons**
- Cupons de desconto
- Validação automática
- Limite de uso
- Validade temporal

## 🔍 **Verificação da Configuração**

Após executar o script, você deve ver:

```
🚀 Configurando Supabase para TechStore...

📋 Executando migração do banco de dados...
✅ Migração executada com sucesso!

🔍 Verificando tabelas criadas...
✅ Tabela products: Criada com sucesso
✅ Tabela categories: Criada com sucesso
✅ Tabela product_images: Criada com sucesso
✅ Tabela customers: Criada com sucesso
✅ Tabela orders: Criada com sucesso
✅ Tabela order_items: Criada com sucesso
✅ Tabela cart_items: Criada com sucesso
✅ Tabela product_reviews: Criada com sucesso
✅ Tabela coupons: Criada com sucesso

📊 Verificando dados inseridos...
✅ 4 produtos inseridos:
   - Carregador Magnético 3-em-1 (carregador-magnetico-3-em-1) - R$ 379.00
   - QuickCharge Pro® (quickcharge-pro) - R$ 299.00
   - Power Bank 20000mAh (power-bank-20000mah) - R$ 199.00
   - Cabo USB-C Premium (cabo-usb-c-premium) - R$ 49.00

✅ 4 categorias inseridas:
   - Carregadores (carregadores)
   - Power Banks (power-banks)
   - Cabos (cabos)
   - Acessórios (acessorios)

🎉 Configuração do Supabase concluída com sucesso!
```

## 🚀 **Testando a Configuração**

### **1. Iniciar o Servidor**
```bash
npm run dev
```

### **2. Testar as APIs**
```bash
# Listar produtos
curl http://localhost:3000/api/products

# Produtos por categoria
curl http://localhost:3000/api/products?category=carregadores

# Produtos em destaque
curl http://localhost:3000/api/products?featured=true
```

### **3. Acessar o Site**
- **Home**: http://localhost:3000
- **Catálogo**: http://localhost:3000/catalogo
- **Produto**: http://localhost:3000/produto/carregador-magnetico-3-em-1

## 🔧 **Configurações Avançadas**

### **Políticas de Segurança (RLS)**

Para habilitar Row Level Security, execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (leitura pública)
CREATE POLICY "Produtos visíveis publicamente" ON products
  FOR SELECT USING (status = 'publish');

-- Políticas para carrinho (por sessão)
CREATE POLICY "Carrinho por sessão" ON cart_items
  FOR ALL USING (session_id = current_setting('app.session_id', true));
```

### **Funções Personalizadas**

```sql
-- Função para incrementar contador
CREATE OR REPLACE FUNCTION increment()
RETURNS integer AS $$
BEGIN
  RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular total do carrinho
CREATE OR REPLACE FUNCTION calculate_cart_total(session_id_param text)
RETURNS decimal AS $$
DECLARE
  total decimal;
BEGIN
  SELECT COALESCE(SUM(ci.quantity * p.price), 0)
  INTO total
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.session_id = session_id_param;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;
```

## 📈 **Monitoramento**

### **Logs de Erro**
- Acesse o dashboard do Supabase
- Vá para "Logs" > "Database"
- Monitore erros e performance

### **Métricas**
- **Produtos**: Contagem total, produtos em estoque
- **Pedidos**: Volume de vendas, status de pedidos
- **Clientes**: Novos cadastros, clientes ativos
- **Performance**: Tempo de resposta das queries

## 🎉 **Próximos Passos**

1. **Personalizar Produtos**: Adicione seus próprios produtos
2. **Configurar Pagamentos**: Integre gateway de pagamento
3. **Email Marketing**: Configure notificações por email
4. **Analytics**: Adicione Google Analytics
5. **SEO**: Configure meta tags e sitemap

---

**🎯 Configuração concluída!**

Seu e-commerce TechStore está pronto para uso com Supabase! 🚀
