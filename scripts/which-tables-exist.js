#!/usr/bin/env node
// Verifica quais tabelas existem no schema public via Supabase JS

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Variáveis do Supabase ausentes. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const sb = createClient(url, key);

const candidateTables = [
  'leads',
  'customers',
  'orders',
  'order_items',
  'products',
  'product_images',
  'product_views',
  'user_events',
  'user_sessions',
  'analytics_summary',
  'cart_items',
  'favorites',
  'categories',
  'site_settings',
  'addresses',
  'order_tracking',
  'banners',
  'product_reviews',
  'coupons',
  'payments'
];

(async () => {
  const existing = [];
  const missing = [];
  for (const table of candidateTables) {
    try {
      const { error } = await sb.from(table).select('*', { count: 'exact', head: true }).limit(1);
      if (error && !String(error.message).includes('Results contain 0 rows')) {
        // If table doesn't exist, PostgREST returns 404: relation does not exist
        if (error.details && /does not exist/i.test(error.details)) {
          missing.push(table);
        } else {
          // Treat other errors as existing (e.g., RLS), since service role should bypass
          existing.push(table + ' (?)');
        }
      } else {
        existing.push(table);
      }
    } catch (e) {
      missing.push(table);
    }
  }
  console.log('\nTabelas existentes no schema public:');
  existing.sort().forEach(t => console.log('- ' + t));
  console.log('\nCandidatas ausentes:');
  missing.sort().forEach(t => console.log('- ' + t));
})();



