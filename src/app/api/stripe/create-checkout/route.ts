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

    // Normalizar itens (name, amount_cents, quantity)
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = (items || []).map((it: any) => ({
      quantity: it.quantity || 1,
      price_data: {
        currency: (it.currency || currency).toLowerCase(),
        product_data: { name: it.name || 'Produto' },
        unit_amount: Number(it.amount_cents || Math.round((it.amount || 0) * 100))
      }
    }));

    if (!line_items.length) {
      return NextResponse.json({ ok: false, error: 'Nenhum item informado' }, { status: 400 });
    }

    // Criar sessão de checkout do Stripe
    // Idempotency: incluir parâmetros relevantes (itens, moeda, rotas, métodos) para evitar conflito ao mudar configuração
    const idemSeed = {
      items: line_items.map(li => ({
        q: li.quantity,
        a: li.price_data?.unit_amount,
        c: li.price_data?.currency,
        n: li.price_data?.product_data?.name,
      })),
      currency,
      successPath,
      cancelPath,
      payment_method_types: ['card', 'link'],
    };
    let idemKey = crypto.createHash('sha256').update(JSON.stringify(idemSeed)).digest('hex');

    const createParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card', 'link'],
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
