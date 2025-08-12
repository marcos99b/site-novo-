import { NextRequest, NextResponse } from 'next/server';
import { aliexpressClient } from '@/lib/aliexpress';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, shippingAddress, buyerInfo } = body;

    // Validar dados obrigatórios
    if (!productId || !quantity || !shippingAddress || !buyerInfo) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Criar pedido na AliExpress
    const result = await aliexpressClient.createOrder({
      productId,
      quantity,
      shippingAddress,
      buyerInfo,
    });

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderStatus: result.orderStatus,
    });
  } catch (error) {
    console.error('Error creating AliExpress order:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}
