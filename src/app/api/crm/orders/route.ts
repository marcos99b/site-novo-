import { NextRequest, NextResponse } from 'next/server';

// Sistema de Pedidos ULTRA MEGA RÁPIDO integrado com CRM (100% offline)
interface Order {
  id: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  stripeSessionId?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  leadId?: string;
}

// Armazenamento em memória para demonstração (em produção seria um banco real)
let orders: Order[] = [];

export async function POST(req: NextRequest) {
  try {
    const { 
      customerEmail, 
      customerName, 
      customerPhone, 
      items, 
      totalAmount, 
      currency = 'EUR',
      stripeSessionId,
      shippingAddress,
      source = 'website',
      leadId
    } = await req.json();

    if (!customerEmail || !items || !totalAmount) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: customerEmail, items, totalAmount' 
      }, { status: 400 });
    }

    // Criar novo pedido
    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerEmail,
      customerName,
      customerPhone,
      items: items.map((item: any) => ({
        productId: item.productId || item.slug,
        productName: item.productName || item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      totalAmount,
      currency,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      stripeSessionId,
      source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Pedido criado via ${source}`,
      leadId
    };

    orders.push(newOrder);

    // Simular integração com CRM
    console.log(`🛒 NOVO PEDIDO CRIADO: ${customerEmail} - €${totalAmount} - ${items.length} itens`);

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido criado com sucesso',
      order: newOrder 
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerEmail = searchParams.get('customerEmail');

    let filteredOrders = orders;

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (customerEmail) {
      filteredOrders = filteredOrders.filter(order => order.customerEmail === customerEmail);
    }

    return NextResponse.json({ 
      orders: filteredOrders,
      total: filteredOrders.length,
      performance: 'ULTRA_MEGA_FAST_ORDERS'
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orderId, status, paymentStatus, notes } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Atualizar pedido
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes) order.notes = notes;
    order.updatedAt = new Date().toISOString();

    console.log(`📝 PEDIDO ATUALIZADO: ${orderId} - Status: ${order.status}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido atualizado com sucesso',
      order 
    });

  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
