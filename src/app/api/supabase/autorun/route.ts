import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

let alreadyRan = false;

export async function POST(req: NextRequest) {
  try {
    if (alreadyRan) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'already applied in this process' });
    }

    const dbUrl = process.env.SUPABASE_DB_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!dbUrl) {
      // Tentar via PG HTTP API usando service role
      if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ ok: false, error: 'SUPABASE_DB_URL ausente e NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não definidos' }, { status: 400 });
      }
    }

    const sqlPath = path.join(process.cwd(), 'supabase_autorun.sql');
    const sql = await fs.readFile(sqlPath, 'utf-8');

    // Caminho 1: tentar via DB URL (tcp)
    if (dbUrl) {
      try {
        const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        await client.connect();
        try {
          await client.query('begin');
          await client.query(sql);
          await client.query('commit');
        } catch (err) {
          await client.query('rollback');
          throw err;
        } finally {
          await client.end();
        }
      } catch (e) {
        // Caminho 2: fallback para PG HTTP API
        if (!supabaseUrl || !serviceRoleKey) throw e;
        const resp = await fetch(`${supabaseUrl}/pg/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
          },
          body: JSON.stringify({ query: sql })
        });
        if (!resp.ok) {
          const txt = await resp.text();
          return NextResponse.json({ ok: false, error: `PG HTTP API failed: ${resp.status} ${txt}` }, { status: 500 });
        }
      }
    } else {
      // Sem DB URL: usar diretamente PG HTTP API
      const resp = await fetch(`${supabaseUrl}/pg/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey!,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query: sql })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        return NextResponse.json({ ok: false, error: `PG HTTP API failed: ${resp.status} ${txt}` }, { status: 500 });
      }
    }

    alreadyRan = true;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro ao aplicar SQL' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'Use POST para aplicar o SQL' });
}


