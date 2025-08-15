import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/site';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const {
      items = [],
      currency = 'EUR',
      successPath = '/checkout/success',
      cancelPath = '/checkout/cancel',
      metadata = {}
    } = await req.json();

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const SITE_URL = getSiteUrl();
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no .env.local'
      }, { status: 400 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // Normalizar itens (name, amount_cents, quantity) com enriquecimento do Supabase quando não vier preço
    const inputItems: Array<any> = Array.isArray(items) ? items : [];

    // Coletar slugs/id que precisam de preço do Supabase
    const toLookup: string[] = [];
    const normalizedKeys: string[] = [];
    for (const it of inputItems) {
      const hasPrice = Number.isFinite(Number(it?.amount_cents)) || Number.isFinite(Number(it?.amount));
      if (!hasPrice) {
        const raw = String(it?.slug || it?.id || it?.productId || '');
        if (raw) {
          const slug = /^produto-\d+$/i.test(raw) ? raw : (/^\d+$/.test(raw) ? `produto-${raw}` : raw);
          toLookup.push(slug);
        }
      }
      const key = String(it?.slug || it?.id || it?.productId || '');
      normalizedKeys.push(key);
    }

    // Buscar preços/nome do Supabase (REST) se necessário
    let priceBySlug: Record<string, { name: string; price: number }> = {};
    let priceIdBySlug: Record<string, string> = {};
    if (toLookup.length) {
      const unique = Array.from(new Set(toLookup));
      try {
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (SUPABASE_URL && SERVICE_ROLE_KEY) {
          const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
          // Tabela de produtos
          const [{ data: rows }, { data: priceRows }] = await Promise.all([
            sb.from('products').select('slug,name,price').in('slug', unique),
            sb.from('stripe_price_map').select('slug,stripe_price_id').in('slug', unique)
          ]);
          if (Array.isArray(rows)) {
            for (const r of rows) {
              if (!r?.slug) continue;
              priceBySlug[String(r.slug)] = { name: r.name || 'Produto', price: Number(r.price || 0) };
            }
          }
          if (Array.isArray(priceRows)) {
            for (const pr of priceRows) {
              if (pr?.slug && pr?.stripe_price_id) priceIdBySlug[String(pr.slug)] = String(pr.stripe_price_id);
            }
          }
        }
      } catch {}
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = inputItems.map((it: any, idx: number) => {
      const qty = Number(it?.quantity || 1);
      const curr = String((it?.currency || currency || 'EUR')).toLowerCase();
      const raw = String(it?.slug || it?.id || it?.productId || '');
      const slug = /^produto-\d+$/i.test(raw) ? raw : (/^\d+$/.test(raw) ? `produto-${raw}` : raw);
      const fromSb = slug && priceBySlug[slug] ? priceBySlug[slug] : null;
      const name = String(it?.name || fromSb?.name || 'Produto');
      const unitAmount = Number.isFinite(Number(it?.amount_cents))
        ? Number(it.amount_cents)
        : Math.round((Number(it?.amount) || (fromSb ? fromSb.price : 0)) * 100);
      // Preferir price ID mapeado na Stripe
      const mappedPriceId = (typeof it?.price_id === 'string' && it.price_id.startsWith('price_'))
        ? String(it.price_id)
        : (priceIdBySlug[slug] || '');
      if (mappedPriceId) {
        return {
          quantity: qty > 0 ? qty : 1,
          price: mappedPriceId,
        } as Stripe.Checkout.SessionCreateParams.LineItem;
      }
      return {
        quantity: qty > 0 ? qty : 1,
        price_data: {
          currency: curr,
          product_data: { name },
          unit_amount: unitAmount,
        },
      } as Stripe.Checkout.SessionCreateParams.LineItem;
    }).filter(li => (li as any).price || Number(li.price_data?.unit_amount || 0) > 0);

    if (!line_items.length) {
      return NextResponse.json({ ok: false, error: 'Nenhum item informado' }, { status: 400 });
    }

    // Criar sessão de checkout do Stripe
    // Idempotency: incluir parâmetros relevantes (itens, moeda, rotas, métodos) para evitar conflito ao mudar configuração
    const idemSeed = {
      items: line_items.map((li: any) => ({
        q: li.quantity,
        a: li.price_data?.unit_amount,
        c: li.price_data?.currency,
        n: li.price_data?.product_data?.name,
        p: li.price, // quando usar price ID
      })),
      currency,
      successPath,
      cancelPath,
      payment_method_types: ['card'],
    };
    let idemKey = crypto.createHash('sha256').update(JSON.stringify(idemSeed)).digest('hex');

    const createParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${SITE_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${cancelPath}`,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['PT'] },
      metadata: {
        ...metadata,
        country: 'PT'
      }
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(createParams, { idempotencyKey: idemKey });
    } catch (e: any) {
      // Se mudar parâmetros e reutilizar a mesma key, o Stripe retorna erro. Regenerar uma vez e tentar novamente.
      if (typeof e?.message === 'string' && e.message.includes('Keys for idempotent requests')) {
        idemKey = crypto.createHash('sha256').update(JSON.stringify({ ...idemSeed, salt: Date.now() })).digest('hex');
        session = await stripe.checkout.sessions.create(createParams, { idempotencyKey: idemKey });
      } else {
        throw e;
      }
    }

    // Registrar pedido pendente no Supabase (idempotente por stripe_session_id)
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (SUPABASE_URL && SERVICE_ROLE_KEY) {
        const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        const totalCents = line_items.reduce((sum, li) => sum + (li.price_data?.unit_amount || 0) * (li.quantity || 1), 0);
        await sb.from('orders')
          .upsert({
            stripe_session_id: session.id,
            status: 'pending',
            payment_status: 'unpaid',
            total_amount_cents: totalCents,
            currency,
          }, { onConflict: 'stripe_session_id' });
      }
    } catch (e) {
      console.warn('Não foi possível registrar pedido pendente no Supabase:', (e as any)?.message);
    }

    // Opcional: registrar um pedido pendente no Supabase (se credenciais presentes)
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      try {
        // Tentar identificar usuário pela sessão do Supabase (token via header/cookie não disponível aqui);
        // como fallback, criar pedido sem user_id (associar no retorno sucesso via client se necessário)
        const totalCents = line_items.reduce((sum, li) => sum + (li.price_data?.unit_amount || 0) * (li.quantity || 1), 0);
        await supabase.from('orders').insert({
          status: 'pending',
          payment_status: 'unpaid',
          total_amount_cents: totalCents,
          currency,
          stripe_session_id: session.id
        });
      } catch (e) {
        console.warn('Não foi possível registrar order no Supabase agora (ok para teste):', (e as any)?.message);
      }
    }

    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe create-checkout error:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Erro ao criar sessão' }, { status: 500 });
  }
}
