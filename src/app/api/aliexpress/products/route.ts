import { NextRequest, NextResponse } from 'next/server';
import { aliexpressClient, aliexpressCache } from '@/lib/aliexpress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const keywords = searchParams.get('keywords') || 'tech accessories';
    const categoryId = searchParams.get('categoryId') || '';
    const pageNo = parseInt(searchParams.get('pageNo') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sort = searchParams.get('sort') || 'SALE_PRICE_ASC';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');

    // Gerar chave do cache
    const cacheKey = `products:${keywords}:${categoryId}:${pageNo}:${pageSize}:${sort}:${minPrice}:${maxPrice}`;
    
    // Tentar buscar do cache primeiro
    const cached = aliexpressCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Buscar produtos da AliExpress
    const result = await aliexpressClient.searchProducts({
      keywords,
      categoryId,
      pageNo,
      pageSize,
      sort,
      minPrice,
      maxPrice,
      targetCurrency: 'BRL',
      targetLanguage: 'PT',
    });

    // Salvar no cache
    aliexpressCache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching AliExpress products:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, categoryId, pageSize = 20 } = body;

    // Buscar produtos em destaque
    const result = await aliexpressClient.getFeaturedProducts();

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos em destaque' },
      { status: 500 }
    );
  }
}
