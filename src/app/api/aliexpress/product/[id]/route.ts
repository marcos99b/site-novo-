import { NextRequest, NextResponse } from 'next/server';
import { aliexpressClient, aliexpressCache } from '@/lib/aliexpress';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Tentar buscar do cache primeiro
    const cacheKey = `product:${productId}`;
    const cached = aliexpressCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Buscar produto da AliExpress
    const product = await aliexpressClient.getProduct(productId);

    // Salvar no cache
    aliexpressCache.set(cacheKey, product);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching AliExpress product:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}
