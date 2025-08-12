import { NextRequest, NextResponse } from 'next/server';
import { aliexpressClient } from '@/lib/aliexpress';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, countryCode, zipCode } = body;

    // Validar dados obrigatórios
    if (!productId || !quantity || !countryCode || !zipCode) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Calcular frete na AliExpress
    const shippingMethods = await aliexpressClient.calculateShipping({
      productId,
      quantity,
      countryCode,
      zipCode,
    });

    return NextResponse.json({
      success: true,
      shippingMethods,
    });
  } catch (error) {
    console.error('Error calculating AliExpress shipping:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular frete' },
      { status: 500 }
    );
  }
}
