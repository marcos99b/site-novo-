#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      method: 'POST',
      hostname: u.hostname,
      path: u.pathname,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null; // e.g. $func$

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    // Handle end of line comment
    if (inLineComment) {
      current += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }

    // Handle block comment
    if (inBlockComment) {
      current += ch;
      if (ch === '*' && next === '/') { current += next; i++; inBlockComment = false; }
      continue;
    }

    // Start comments
    if (!inSingle && !inDouble && !dollarTag) {
      if (ch === '-' && next === '-') { current += ch; current += next; i++; inLineComment = true; continue; }
      if (ch === '/' && next === '*') { current += ch; current += next; i++; inBlockComment = true; continue; }
    }

    // String quotes
    if (!inDouble && !dollarTag && ch === "'" && !inSingle) { inSingle = true; current += ch; continue; }
    if (inSingle) {
      current += ch;
      if (ch === "'" && sql[i - 1] !== '\\') inSingle = false;
      continue;
    }
    if (!inSingle && !dollarTag && ch === '"' && !inDouble) { inDouble = true; current += ch; continue; }
    if (inDouble) {
      current += ch;
      if (ch === '"' && sql[i - 1] !== '\\') inDouble = false;
      continue;
    }

    // Dollar-quoted strings $$ or $tag$
    if (!inSingle && !inDouble) {
      if (!dollarTag) {
        // Detect start of $tag$
        if (ch === '$') {
          let j = i + 1;
          while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++;
          if (sql[j] === '$') {
            dollarTag = sql.slice(i, j + 1); // include both $
            current += dollarTag;
            i = j;
            continue;
          }
        }
      } else {
        // Inside dollar quoted; check for closing tag
        if (ch === '$') {
          const possible = sql.slice(i, i + dollarTag.length);
          if (possible === dollarTag) {
            current += dollarTag;
            i += dollarTag.length - 1;
            dollarTag = null;
            continue;
          }
        }
        current += ch;
        continue;
      }
    }

    // Statement termination
    if (!inSingle && !inDouble && !dollarTag && ch === ';') {
      const stmt = current.trim();
      if (stmt) statements.push(stmt + ';');
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function runStatements(rpcUrl, headers, statements) {
  for (const [idx, stmt] of statements.entries()) {
    const resp = await postJson(rpcUrl, headers, { sql: stmt });
    if (resp.status !== 200) {
      throw new Error(`HTTP ${resp.status}: ${resp.body}`);
    }
    try {
      const body = JSON.parse(resp.body);
      if (body && body.status === 'error') {
        const msg = String(body.message || '').toLowerCase();
        const ignorable = ['already exists', 'duplicate', 'already defined'];
        if (!ignorable.some(s => msg.includes(s))) {
          throw new Error(`SQL error at statement ${idx + 1}: ${body.message}`);
        }
      }
    } catch (_) {
      // not JSON or unexpected; continue
    }
  }
}

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase_autorun.sql'), 'utf8');
  const statements = splitSqlStatements(sql);
  const rpcUrl = `${baseUrl.replace(/\/$/, '')}/rest/v1/rpc/exec_sql`;
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'return=representation' };

  console.log(`Executando ${statements.length} statements via RPC exec_sql ...`);
  await runStatements(rpcUrl, headers, statements);
  console.log('✅ Autorun concluído com sucesso.');
}

main().catch((e) => {
  console.error('Erro:', e.message);
  process.exit(2);
});


