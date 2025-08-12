// Delete Supabase auth user by email and cleanup related rows
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Prefer URL from env; fallback to the one used in verification script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vqpumetbhgqdpnskgbvr.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function findUserByEmail(email) {
  // Supabase Admin API currently requires id; list and filter
  const pageSize = 1000;
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) throw error;
    const found = data.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < pageSize) break;
    page += 1;
  }
  return null;
}

async function cleanupUserRows(userId) {
  // Best effort cleanup of related tables; service role bypasses RLS
  const tables = [
    'favorites',
    'orders',
    'payment_methods',
    'addresses',
    'customers',
    'leads',
    'user_events',
    'product_views',
    'user_route_durations',
    'profiles'
  ];
  for (const table of tables) {
    try {
      // Some tables use user_id, others session/user linkage; use best-known key
      const column = table === 'user_events' || table === 'product_views' ? 'user_id' : 'user_id';
      const { error } = await supabase.from(table).delete().eq(column, userId);
      if (error && !String(error.message || '').includes('does not exist')) {
        console.warn(`Cleanup warning on ${table}:`, error.message);
      }
    } catch (e) {
      console.warn(`Cleanup exception on ${table}:`, e.message || e);
    }
  }
}

(async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node scripts/delete-user-by-email.js <email>');
      process.exit(1);
    }

    console.log('Looking up user:', email);
    const user = await findUserByEmail(email);
    if (!user) {
      console.log('User not found. Nothing to delete.');
      process.exit(0);
    }

    console.log('Found user id:', user.id);

    // Cleanup DB rows that reference the user
    await cleanupUserRows(user.id);

    // Delete auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw delErr;

    console.log('✅ User deleted successfully:', email);
  } catch (e) {
    console.error('❌ Delete failed:', e.message || e);
    process.exit(1);
  }
})();


