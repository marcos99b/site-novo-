# 🚀 GUIA COMPLETO - SUPABASE PARA VENDAS DIRETAS RELIET

## 📋 **VISÃO GERAL**
Este guia configura o Supabase para funcionar como backend completo para vendas diretas via Stripe, eliminando a necessidade da API da CJ e permitindo gestão manual de pedidos.

## 🎯 **O QUE SERÁ CONFIGURADO**
- ✅ **Tabelas automatizadas** para produtos e vendas
- ✅ **Integração com Stripe** para checkout
- ✅ **Sistema de estoque automático**
- ✅ **Gestão manual de pedidos**
- ✅ **Dashboard completo** para administração

## 🔧 **PASSO A PASSO**

### **1. ACESSAR O SUPABASE**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse o projeto da Reliet
4. Vá para **SQL Editor**

### **2. EXECUTAR CONFIGURAÇÃO PRINCIPAL**
1. Copie todo o conteúdo de `supabase/supabase-automation-setup.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **RUN** para executar
4. Aguarde a execução completa

### **3. INSERIR PRODUTOS DE EXEMPLO**
1. Copie todo o conteúdo de `supabase/insert-sample-products.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **RUN** para executar
4. Verifique se os produtos foram inseridos

### **4. CONFIGURAR CHAVES DO STRIPE**
1. Vá para **Table Editor** → **site_settings**
2. Atualize as seguintes chaves:
   ```sql
   -- Chave pública do Stripe
   UPDATE site_settings 
   SET value = 'pk_test_sua_chave_aqui' 
   WHERE key = 'stripe_publishable_key';
   
   -- Secret do webhook do Stripe
   UPDATE site_settings 
   SET value = 'whsec_seu_secret_aqui' 
   WHERE key = 'stripe_webhook_secret';
   ```

### **5. CONFIGURAR EMAILS DE ADMIN**
1. Vá para **Table Editor** → **site_settings**
2. Atualize a chave `admin_emails`:
   ```sql
   UPDATE site_settings 
   SET value = 'seu-email@exemplo.com,outro-email@exemplo.com' 
   WHERE key = 'admin_emails';
   ```

## 🗄️ **ESTRUTURA DAS TABELAS**

### **Tabela `products`**
- ✅ **Produtos principais** com informações básicas
- ✅ **Estoque automático** via triggers
- ✅ **Categorias** organizadas
- ✅ **Status** de publicação

### **Tabela `product_images`**
- ✅ **Múltiplas imagens** por produto
- ✅ **Posicionamento** automático
- ✅ **Imagem principal** marcada

### **Tabela `product_variants`**
- ✅ **Variantes** (cor, tamanho)
- ✅ **Estoque individual** por variante
- ✅ **SKUs únicos** para controle

### **Tabela `orders`**
- ✅ **Pedidos** com integração Stripe
- ✅ **Números automáticos** (ORD-2025-000001)
- ✅ **Status** de acompanhamento
- ✅ **Endereços** de entrega

### **Tabela `order_items`**
- ✅ **Itens** de cada pedido
- ✅ **Atualização automática** de estoque
- ✅ **Preços** congelados

## 🔄 **AUTOMAÇÕES IMPLEMENTADAS**

### **1. Números de Pedido**
- ✅ **Formato**: `ORD-2025-000001`
- ✅ **Sequência automática** via trigger
- ✅ **Único** por pedido

### **2. Controle de Estoque**
- ✅ **Atualização automática** após venda
- ✅ **Estoque por variante** e produto
- ✅ **Prevenção** de vendas sem estoque

### **3. Timestamps**
- ✅ **created_at** automático
- ✅ **updated_at** automático
- ✅ **shipped_at** para tracking

## 🛡️ **SEGURANÇA E POLÍTICAS**

### **Row Level Security (RLS)**
- ✅ **Produtos**: Todos podem ver, apenas admin edita
- ✅ **Pedidos**: Usuário vê apenas seus pedidos
- ✅ **Carrinho**: Usuário gerencia apenas seu carrinho
- ✅ **Configurações**: Apenas admin acessa

### **Políticas de Acesso**
- ✅ **Usuários autenticados** podem fazer pedidos
- ✅ **Administradores** têm acesso total
- ✅ **Clientes** veem apenas seus dados

## 📊 **FUNÇÕES ÚTEIS**

### **1. Estatísticas de Vendas**
```sql
SELECT * FROM get_sales_stats();
-- Retorna: total_orders, total_revenue, avg_order_value, top_product
```

### **2. Atualizar Status de Pedido**
```sql
SELECT update_order_status('uuid-do-pedido', 'completed', 'TRK123456');
-- Atualiza status e número de tracking
```

### **3. Ver Produtos por Categoria**
```sql
SELECT * FROM products WHERE category = 'Coletes' AND status = 'publish';
```

## 🔗 **INTEGRAÇÃO COM STRIPE**

### **1. Webhook Configuration**
- ✅ **Endpoint**: `/api/stripe/webhook`
- ✅ **Eventos**: `payment_intent.succeeded`, `payment_intent.payment_failed`
- ✅ **Segurança**: Verificação de assinatura

### **2. Checkout Flow**
- ✅ **Criar sessão** Stripe
- ✅ **Redirecionar** para checkout
- ✅ **Processar** retorno
- ✅ **Atualizar** pedido

### **3. Gestão de Pagamentos**
- ✅ **Status automático** via webhook
- ✅ **Fallback** para verificação manual
- ✅ **Logs** de transações

## 📱 **DASHBOARD DE ADMINISTRAÇÃO**

### **1. Gerenciar Produtos**
- ✅ **Adicionar/editar** produtos
- ✅ **Upload** de imagens
- ✅ **Controle** de estoque
- ✅ **Variantes** e preços

### **2. Gerenciar Pedidos**
- ✅ **Lista** de todos os pedidos
- ✅ **Atualizar** status
- ✅ **Adicionar** tracking
- ✅ **Histórico** completo

### **3. Relatórios**
- ✅ **Vendas** por período
- ✅ **Produtos** mais vendidos
- ✅ **Receita** total
- ✅ **Estoque** baixo

## 🚨 **TROUBLESHOOTING**

### **Problema: Produtos não aparecem**
```sql
-- Verificar se RLS está configurado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';
```

### **Problema: Pedidos não são criados**
```sql
-- Verificar se as políticas estão ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'orders';
```

### **Problema: Estoque não atualiza**
```sql
-- Verificar se os triggers estão ativos
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%stock%';
```

## 📈 **PRÓXIMOS PASSOS**

### **1. Testar Sistema**
- ✅ **Criar** produto de teste
- ✅ **Simular** pedido
- ✅ **Verificar** estoque
- ✅ **Testar** webhook

### **2. Configurar Produção**
- ✅ **Chaves** Stripe live
- ✅ **Webhook** em produção
- ✅ **SSL** e segurança
- ✅ **Backup** automático

### **3. Treinamento da Equipe**
- ✅ **Dashboard** Supabase
- ✅ **Gestão** de pedidos
- ✅ **Controle** de estoque
- ✅ **Relatórios** e análises

## 🎉 **RESULTADO FINAL**

Após seguir este guia, você terá:
- ✅ **Sistema completo** de e-commerce
- ✅ **Integração automática** com Stripe
- ✅ **Controle total** sobre produtos e vendas
- ✅ **Dashboard profissional** para gestão
- ✅ **Automação** de processos críticos
- ✅ **Segurança** e escalabilidade

## 📞 **SUPORTE**

Para dúvidas ou problemas:
1. **Verifique** os logs do Supabase
2. **Teste** as funções SQL
3. **Consulte** a documentação oficial
4. **Entre em contato** com o suporte

---

**🎯 RELIET - MODA FEMININA PREMIUM PARA PORTUGAL**  
**🚀 SUPABASE + STRIPE = VENDAS AUTOMATIZADAS**
