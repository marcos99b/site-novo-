#!/usr/bin/env bash
set -euo pipefail

# Guia rápido para testar webhooks Stripe no ambiente local (porta 3000)
# 1) Instalar CLI (se necessário):
#    brew install stripe/stripe-cli/stripe
# 2) Login na sua conta Stripe (abre o browser):
#    stripe login
# 3) Iniciar o listener apontando para o endpoint do projeto:
#    stripe listen --forward-to localhost:3000/api/stripe/webhook
#    # Anote o "Signing secret" que aparece (whsec_...) e adicione ao .env.local como STRIPE_WEBHOOK_SECRET
# 4) Em outro terminal, dispare eventos de teste (exemplos):
#    stripe trigger checkout.session.completed
#    stripe trigger payment_intent.succeeded
#    stripe trigger payment_intent.payment_failed
#
# Variáveis obrigatórias no .env.local para o checkout funcionar:
#   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
#   STRIPE_SECRET_KEY=sk_test_...
#   STRIPE_WEBHOOK_SECRET=whsec_...   # pegue do stripe listen
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000
#
# Para criar uma sessão de checkout de teste via API local:
#   curl -X POST http://localhost:3000/api/stripe/create-checkout \
#     -H 'Content-Type: application/json' \
#     -d '{"items":[{"name":"Produto teste","amount_cents":1000,"quantity":1}]}'
#   # A resposta contém a URL do Stripe. Abra no navegador para testar o fluxo.

echo "Leia os passos no cabeçalho deste arquivo e execute cada comando em um terminal."
