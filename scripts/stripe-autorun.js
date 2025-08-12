#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('STRIPE_SECRET_KEY ausente.');
    process.exit(1);
  }
  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  const names = [
    "Solid color slimming long sleeve pocket woolen women's coat",
    "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest",
    'New loose slimming temperament casual cotton linen top',
    'Fashion all-match comfort and casual woolen turn-down collar coat',
    "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest #2",
    'Metal buckle slit knitted vest slim fit vest foreign trade TUP cardigan'
  ];
  const prices = [4099, 4599, 4299, 4899, 4699, 3999];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const amount = prices[i];
    // Tentar encontrar produto existente
    const search = await stripe.products.search({ query: `name:'${name.replace(/'/g, "\\'")}'`, limit: 1 });
    let product = search.data[0];
    if (!product) {
      product = await stripe.products.create({ name });
      console.log('Criado produto:', product.id, name);
    } else {
      console.log('Produto existente:', product.id, name);
    }

    // Criar preço padrão em EUR se não existir
    const activePrices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
    let price = activePrices.data.find((p) => p.currency === 'eur' && p.unit_amount === amount);
    if (!price) {
      price = await stripe.prices.create({ product: product.id, currency: 'eur', unit_amount: amount });
      console.log('Criado preço EUR:', price.id, amount);
    } else {
      console.log('Preço existente:', price.id, amount);
    }
  }

  console.log('✅ Stripe autorun concluído.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });


