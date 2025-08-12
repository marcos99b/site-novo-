## Integração Stripe + CJ — Checklist vivo

Estado: vou marcando conforme avanço. Sempre que eu concluir um item, atualizo este arquivo.

### Global
- [ ] Variáveis em `.env.local` revisadas e carregadas após restart
  - [ ] NEXT_PUBLIC_SITE_URL definido
  - [ ] STRIPE_SECRET_KEY definido
  - [ ] CJ_API_BASE = https://api.cjdropshipping.com
  - [ ] CJ_API_KEY definido

### Stripe
- [x] Rota `POST /api/stripe/create-checkout` idempotente (hash do carrinho + currency)
- [x] Sucesso/Cancel URL com `getSiteUrl()` e currency EUR
- [ ] Webhook `checkout.session.completed`/`payment_intent.succeeded` atualiza `orders` (paid)
- [ ] Log estruturado de erros (status, ms, session_id)
- [ ] Teste manual: checkout completo (dev) e redirecionamento OK

### CJ Dropshipping
- [ ] Conectividade CJ (auth v2) — `getAccessToken` retorna 200
- [ ] Detalhes de produto — `getProductDetail(productId)` retorna `variantList`
- [x] API de produto expõe `colors`, `sizes`, `variant_matrix` (`/api/products/[id]`)
- [x] PDP usa `colors` (chips) e filtra tamanhos por cor (seleciona `variantId` correto)
- [ ] Sincronização inicial: popular cores/tamanhos para os 6 produtos (IDs CJ enviados)
- [ ] Validação de stock antes do checkout — `queryByVid`
- [ ] Cron de stock/preço (15–30 min)
- [ ] Cálculo de frete PT — `freightCalculate` (cache 6–12h)
- [ ] Criação de pedido CJ após pagamento (idempotente; guardar payloads)

### Observabilidade
- [ ] Logs CJ (endpoint, produto/vid, ms, status)
- [ ] Logs Stripe (rota e webhooks) com contexto
- [ ] Painel simples: últimas syncs, falhas e pedidos criados

### Ações em andamento (histórico curto)
- 2025-08-12: Idempotência adicionada em `create-checkout`; PDP e API já suportam `colors/sizes/variant_matrix`.
- 2025-08-12: Ambiente local sem DNS para CJ (ENOTFOUND). Aguardando ativação de `CJ_API_BASE`/rede para validar auth e sincronizar cores.

### Próximos passos
1) Ativar conexão CJ (envs + rede) e validar auth.
2) Sincronizar os 6 `productIds` CJ, preencher cores e confirmar chips visíveis na PDP.
3) Implementar webhook Stripe → criar pedido CJ + idempotência.
4) Ativar cron de stock/preço e `freightCalculate` para PT.


