import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSiteUrl } from '@/lib/site';
import crypto from 'crypto';

// Dados estáticos ULTRA MEGA RÁPIDOS para preços (100% offline)
const ULTRA_FAST_PRICES = {
  "produto-1": { name: "Casaco de Lã Clássico", price: 89.9 },
  "produto-2": { name: "Conjunto Algodão & Linho", price: 79.9 },
  "produto-5": { name: "Colete Tricot Decote V", price: 44.9 },
  "produto-6": { name: "Colete com Fivela", price: 45.9 },
  "produto-7": { name: "Pantufas de Couro Premium", price: 129.9 },
  "produto-8": { name: "Bolsa Tote Designer de Inverno", price: 199.9 }
};

export async function POST(req: NextRequest) {
  try {
    const {
      items = [],
      currency = 'EUR',
      successPath = '/checkout/success',
      cancelPath = '/checkout/cancel',
      metadata = {},
      customerEmail,
      customerName,
      customerPhone,
      leadId
    } = await req.json();

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const SITE_URL = getSiteUrl();

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({
        ok: false,
        error: 'Stripe não configurado. Defina STRIPE_SECRET_KEY e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no .env.local'
      }, { status: 400 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // Normalizar itens usando dados estáticos ULTRA MEGA RÁPIDOS
    const base_line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it: any) => {
      const qty = Number(it?.quantity || 1);
      const curr = String((it?.currency || currency || 'EUR')).toLowerCase();
      const slug = String(it?.slug || it?.id || it?.productId || '');
      
      // Buscar preço dos dados estáticos ULTRA MEGA RÁPIDOS
      const productData = ULTRA_FAST_PRICES[slug as keyof typeof ULTRA_FAST_PRICES];
      const name = String(it?.name || productData?.name || 'Produto');
      const unitAmount = Math.round((Number(it?.amount) || (productData?.price || 0)) * 100);

      return {
        quantity: qty > 0 ? qty : 1,
        price_data: {
          currency: curr,
          product_data: { name },
          unit_amount: unitAmount,
        },
      } as Stripe.Checkout.SessionCreateParams.LineItem;
    }).filter((li: Stripe.Checkout.SessionCreateParams.LineItem) => Number(li.price_data?.unit_amount || 0) > 0);

    if (!base_line_items.length) {
      return NextResponse.json({ ok: false, error: 'Nenhum item informado' }, { status: 400 });
    }

    // Calcular total para CRM
    const totalAmount = base_line_items.reduce((sum: number, li: Stripe.Checkout.SessionCreateParams.LineItem) => {
      return sum + (Number(li.price_data?.unit_amount || 0) * (li.quantity || 1)) / 100;
    }, 0);

    // Criar sessão de checkout do Stripe
    const idemSeed = {
      items: base_line_items.map((li: Stripe.Checkout.SessionCreateParams.LineItem) => ({
        q: li.quantity,
        a: li.price_data?.unit_amount,
        c: li.price_data?.currency,
        n: li.price_data?.product_data?.name,
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
      line_items: base_line_items,
      success_url: `${SITE_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${cancelPath}`,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['PT'] },
      customer_email: customerEmail,
      
      // 🎨 CUSTOMIZAÇÃO VISUAL DO CHECKOUT
      custom_text: {
        submit: {
          message: '✨ Sua compra será processada com segurança pela Stripe'
        },
        shipping_address: {
          message: '🚚 Envio premium para Portugal em 5-9 dias úteis'
        }
      },
      
      // 🎨 CORES E ESTILO PERSONALIZADOS
      custom_fields: [
        {
          key: 'customer_note',
          label: {
            type: 'custom',
            custom: '💭 Observações especiais'
          },
          type: 'text',
          optional: true
        },
        {
          key: 'brand_preference',
          label: {
            type: 'custom',
            custom: '🌟 Como conheceu a RELIET?'
          },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Instagram', value: 'instagram' },
              { label: 'Facebook', value: 'facebook' },
              { label: 'Google', value: 'google' },
              { label: 'Indicação de amiga', value: 'friend' },
              { label: 'Outro', value: 'other' }
            ]
          },
          optional: true
        }
      ],
      

      
      // 🎨 CONFIGURAÇÕES ADICIONAIS
      allow_promotion_codes: true,
      

      
      // 🎨 CONFIGURAÇÕES DE PAGAMENTO
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      },
      
      metadata: {
        ...metadata,
        country: 'PT',
        leadId: leadId || '',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        totalAmount: totalAmount.toString(),
        source: 'website'
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

    // INTEGRAÇÃO COM CRM: Criar pedido pendente
    try {
      const orderData = {
        customerEmail: customerEmail || 'guest@example.com',
        customerName,
        customerPhone,
        items: items.map((item: any) => ({
          productId: item.slug || item.id,
          productName: item.name || ULTRA_FAST_PRICES[item.slug as keyof typeof ULTRA_FAST_PRICES]?.name || 'Produto',
          quantity: item.quantity || 1,
          price: ULTRA_FAST_PRICES[item.slug as keyof typeof ULTRA_FAST_PRICES]?.price || 0,
          total: (ULTRA_FAST_PRICES[item.slug as keyof typeof ULTRA_FAST_PRICES]?.price || 0) * (item.quantity || 1)
        })),
        totalAmount,
        currency,
        stripeSessionId: session.id,
        source: 'website',
        leadId
      };

      // Criar pedido no CRM
      await fetch(`${SITE_URL}/api/crm/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      console.log(`🔄 PEDIDO CRIADO NO CRM: ${session.id} - €${totalAmount}`);
    } catch (crmError) {
      console.warn('Erro ao criar pedido no CRM:', crmError);
      // Não falhar o checkout se o CRM falhar
    }

    return NextResponse.json({ 
      ok: true, 
      url: session.url, 
      sessionId: session.id,
      performance: 'ULTRA_MEGA_FAST_STATIC_OFFLINE',
      crmIntegration: 'active',
      orderCreated: true
    });
    
  } catch (error: any) {
    console.error('Stripe create-checkout error:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Erro ao criar sessão' }, { status: 500 });
  }
}
