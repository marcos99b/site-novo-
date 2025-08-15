#!/usr/bin/env node
const axios = require('axios');

// Host alternativo oficial dos devs (o "api.cjdropshipping.com" pode falhar por DNS em algumas redes)
const CJ_BASE = 'https://developers.cjdropshipping.com/api/v2';

const CJ_PRODUCTS = [
  '2508080521221628200',
  '2508050834351619900',
  '2508041417241619800',
  '2508060259111624600',
  '2508010339421629200',
  '2504290217311600400',
];

async function main() {
  const apiKey = process.env.CJ_API_KEY || process.env.CJD_API_KEY || process.env.CJ_API_TOKEN;
  if (!apiKey) {
    console.error('CJ_API_KEY ausente no ambiente (.env.local).');
    process.exit(1);
  }

  console.log('🔐 Autenticando na CJ...');
  const authResp = await axios.post(`${CJ_BASE}/authentication/getAccessToken`, { apiKey }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
  if (!(authResp.data && authResp.data.data && authResp.data.data.accessToken)) {
    console.error('Falha na autenticação CJ:', authResp.data);
    process.exit(2);
  }
  const accessToken = authResp.data.data.accessToken;
  console.log('✅ Token OK');

  for (const productId of CJ_PRODUCTS) {
    console.log(`\n📦 Produto ${productId}: detalhes e variantes`);
    const detail = await axios.post(`${CJ_BASE}/product/getProductDetail`, { productId }, { headers: { 'Content-Type': 'application/json', 'CJ-Access-Token': accessToken }, timeout: 20000 });
    const pd = detail.data?.data;
    if (!pd) { console.log('  ❌ Sem dados'); continue; }
    console.log(`  Nome: ${pd.productName}  | Variantes: ${pd.variants?.length || 0}`);
    const sample = (pd.variants || []).slice(0, 3);
    for (const v of sample) {
      const vid = v.vid;
      const stockResp = await axios.post(`${CJ_BASE}/product/stock/queryByVid`, { vid }, { headers: { 'Content-Type': 'application/json', 'CJ-Access-Token': accessToken }, timeout: 15000 });
      const stock = stockResp.data?.data?.stock || 0;
      console.log(`   • VID ${vid} | ${v.name} | price $${v.price} | stock ${stock}`);
    }
  }

  console.log('\n🎯 Testes CJ concluídos com sucesso.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(9); });


