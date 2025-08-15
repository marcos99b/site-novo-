#!/usr/bin/env node
const https = require('https');

const API_KEY = process.env.CJ_API_KEY || '';
if (!API_KEY) {
  console.error('CJ_API_KEY não definido no .env.local');
  process.exit(1);
}

const HOSTS = [
  'https://api.cjdropshipping.com/api/v2',
  'https://developers.cjdropshipping.com/api/v2',
];

function reqJson(url, body, headersExtra = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      method: 'POST',
      hostname: u.hostname,
      path: u.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'novo-site/1.0',
        ...headersExtra,
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function reqForm(url, form, headersExtra = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = new URLSearchParams(form).toString();
    const req = https.request({
      method: 'POST',
      hostname: u.hostname,
      path: u.pathname,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'novo-site/1.0',
        ...headersExtra,
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

(async () => {
  for (const base of HOSTS) {
    const url = `${base}/authentication/getAccessToken`;
    console.log(`\n== Tentando JSON em ${url}`);
    try {
      const r = await reqJson(url, { apiKey: API_KEY });
      console.log('Status:', r.status, 'Body:', r.data.slice(0, 200));
    } catch (e) { console.log('Erro JSON:', e.message); }

    console.log(`-- Tentando FORM em ${url}`);
    try {
      const r2 = await reqForm(url, { apiKey: API_KEY });
      console.log('Status:', r2.status, 'Body:', r2.data.slice(0, 200));
    } catch (e) { console.log('Erro FORM:', e.message); }
  }
})();


