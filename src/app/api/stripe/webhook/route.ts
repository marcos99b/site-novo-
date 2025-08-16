import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSiteUrl } from '@/lib/site';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'Webhook secret não configurado' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Erro na assinatura do webhook:', err.message);
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
    }

    const SITE_URL = getSiteUrl();

    // Processar eventos do Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid') {
          console.log(`💰 PAGAMENTO CONFIRMADO: ${session.id}`);
          
          // Atualizar pedido no CRM
          try {
            const orderUpdate = {
              orderId: session.metadata?.orderId || `order_${Date.now()}`,
              status: 'paid',
              paymentStatus: 'paid',
              notes: `Pagamento confirmado via Stripe - Session: ${session.id}`
            };

            await fetch(`${SITE_URL}/api/crm/orders`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderUpdate)
            });

            console.log(`✅ PEDIDO ATUALIZADO NO CRM: ${session.id}`);
          } catch (crmError) {
            console.warn('Erro ao atualizar pedido no CRM:', crmError);
          }
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💳 PAGAMENTO SUCEDIDO: ${paymentIntent.id}`);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ PAGAMENTO FALHOU: ${failedPayment.id}`);
        
        // Atualizar pedido no CRM
        try {
          const orderUpdate = {
            orderId: failedPayment.metadata?.orderId || `order_${Date.now()}`,
            status: 'cancelled',
            paymentStatus: 'failed',
            notes: `Pagamento falhou via Stripe - Payment Intent: ${failedPayment.id}`
          };

          await fetch(`${SITE_URL}/api/crm/orders`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderUpdate)
          });

          console.log(`❌ PEDIDO ATUALIZADO NO CRM: ${failedPayment.id}`);
        } catch (crmError) {
          console.warn('Erro ao atualizar pedido no CRM:', crmError);
        }
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`📅 ASSINATURA CRIADA: ${subscription.id}`);
        break;

      default:
        console.log(`📡 EVENTO NÃO TRATADO: ${event.type}`);
    }

    return NextResponse.json({ 
      received: true,
      event: event.type,
      crmIntegration: 'active'
    });

  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
