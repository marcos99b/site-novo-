import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { cjClient } from '@/lib/cj';
import { getSiteUrl } from '@/lib/site';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: 'Variáveis do Stripe/Supabase faltando' }, { status: 400 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ ok: false, error: 'assinatura ausente' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent as string | null;
        const amountTotal = session.amount_total || 0;
        const currency = (session.currency || 'eur').toUpperCase();

        // Atualizar o pedido
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'paid',
            payment_intent_id: paymentIntentId || undefined
          })
          .eq('stripe_session_id', session.id);

        // Registrar payment
        await supabase
          .from('payments')
          .insert({
            order_id: (await supabase.from('orders').select('id').eq('stripe_session_id', session.id).single()).data?.id,
            provider: 'stripe',
            amount_cents: amountTotal,
            currency,
            status: 'paid',
            raw_event: event as any
          });

        // Se vier produto do CJ no metadata, criar pedido automaticamente
        try {
          const productId = session.metadata?.productId as string | undefined;
          const quantity = Number(session.metadata?.quantity || 1);
          if (productId) {
            // Buscar detalhes do produto para obter VID
            const detail = await cjClient.getProductDetail(productId);
            const variants: any[] = detail?.data?.variantList || detail?.data?.variants || [];

            // Heurística: preferir MW11 + Silver Gray; senão primeira variante
            const preferred = variants.find((v: any) => {
              const name = (v.name || v.variantName || '').toString().toLowerCase();
              return name.includes('mw11') && (name.includes('silver') || name.includes('gray') || name.includes('grey'));
            }) || variants[0];

            const vid = preferred?.vid || preferred?.id || preferred?.variantId;
            if (vid) {
              const addr = session.shipping_details?.address;
              const name = session.customer_details?.name || 'Cliente';
              const email = session.customer_details?.email || 'cliente@example.com';
              const phone = session.customer_details?.phone || '+351 912345678';

              const shippingAddress = {
                country: (addr?.country || 'PT'),
                state: addr?.state || 'Lisboa',
                city: addr?.city || 'Lisboa',
                address: [addr?.line1, addr?.line2].filter(Boolean).join(', '),
                zip: addr?.postal_code || '1000-001',
                name,
                phone
              };

              await cjClient.createOrderV2({
                customerName: email,
                shippingAddress,
                items: [
                  { vid, quantity }
                ]
              });
            }
          }
        } catch (e) {
          // Não quebrar webhook por erro do CJ
          console.warn('Falha ao criar pedido no CJ via webhook:', (e as any)?.message);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await supabase
          .from('orders')
          .update({ status: 'payment_failed', payment_status: 'failed' })
          .eq('payment_intent_id', pi.id);
        break;
      }
      default: {
        // ignorar outros
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
