#!/usr/bin/env bash
set -euo pipefail

# Requer stripe CLI autenticado (stripe login) e STRIPE_SECRET_KEY exportada
# Cria 6 produtos com preços em EUR com base nos nomes sincronizados

names=(
  "Solid color slimming long sleeve pocket woolen women's coat"
  "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest"
  "New loose slimming temperament casual cotton linen top"
  "Fashion all-match comfort and casual woolen turn-down collar coat"
  "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest #2"
  "Metal buckle slit knitted vest slim fit vest foreign trade TUP cardigan"
)

prices=(4099 4599 4299 4899 4699 3999) # em EUR cents

rm -f stripe_products_map.csv
touch stripe_products_map.csv

for i in "${!names[@]}"; do
  name="${names[$i]}"
  amount="${prices[$i]}"
  pid=$(stripe products create --name "$name" --default_price_data unit_amount=$amount currency=eur --expand default_price --query "id" --format yaml | sed -n 's/^id: \(.*\)$/\1/p')
  echo "Criado produto Stripe: $name -> $pid"
  echo "$((i+1)),$pid" >> stripe_products_map.csv
done

echo "Concluído. Mapping salvo em stripe_products_map.csv"




