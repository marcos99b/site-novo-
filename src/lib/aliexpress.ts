import axios, { AxiosInstance } from 'axios';
import Bottleneck from 'bottleneck';
import crypto from 'crypto';

// Configuração AliExpress API
const ALIEXPRESS_APP_KEY = process.env.ALIEXPRESS_APP_KEY || '';
const ALIEXPRESS_APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || '';
const ALIEXPRESS_ACCESS_TOKEN = process.env.ALIEXPRESS_ACCESS_TOKEN || '';
const ALIEXPRESS_API_BASE = process.env.ALIEXPRESS_API_BASE || 'https://api.aliexpress.com/v2';

// Rate limiter para evitar bloqueios
const limiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 1000, // 1 segundo entre requests
});

// Tipos TypeScript
export interface AliExpressProduct {
  productId: string;
  productTitle: string;
  productMainImage: string;
  productImages: string[];
  targetSalePrice: string;
  targetOriginalPrice: string;
  discount: string;
  evaluationRating: string;
  commissionRate: string;
  commission: string;
  volume: string;
  packageType: string;
  lotNum: string;
  validTime: string;
  collectDate: string;
  productUrl: string;
  promotionLink: string;
  appDetailsUrl: string;
  categoryId: string;
  categoryName: string;
  commissionType: string;
  hotProduct: string;
  shopId: string;
  shopName: string;
  shopUrl: string;
  platformType: string;
  shipToDays: string;
  shipFromDays: string;
  shipFrom: string;
  shipTo: string;
  firstLevelCategoryId: string;
  firstLevelCategoryName: string;
  secondLevelCategoryId: string;
  secondLevelCategoryName: string;
  thirdLevelCategoryId: string;
  thirdLevelCategoryName: string;
  videoUrl: string;
  videoCoverUrl: string;
  promotionVideoUrl: string;
  promotionVideoCoverUrl: string;
  promotionVideoId: string;
  promotionVideoType: string;
  promotionVideoStatus: string;
  promotionVideoCreateTime: string;
  promotionVideoUpdateTime: string;
  promotionVideoDuration: string;
  promotionVideoSize: string;
  promotionVideoFormat: string;
  promotionVideoResolution: string;
  promotionVideoBitrate: string;
  promotionVideoFrameRate: string;
  promotionVideoCodec: string;
  promotionVideoAudioCodec: string;
  promotionVideoAudioBitrate: string;
  promotionVideoAudioSampleRate: string;
  promotionVideoAudioChannels: string;
  promotionVideoAudioLanguage: string;
  promotionVideoSubtitleLanguage: string;
  promotionVideoSubtitleFormat: string;
  promotionVideoSubtitleEncoding: string;
  promotionVideoSubtitleUrl: string;
  promotionVideoSubtitleContent: string;
  promotionVideoSubtitleSize: string;
  promotionVideoSubtitleDuration: string;
  promotionVideoSubtitleStartTime: string;
  promotionVideoSubtitleEndTime: string;
  promotionVideoSubtitlePosition: string;
  promotionVideoSubtitleColor: string;
  promotionVideoSubtitleFontSize: string;
  promotionVideoSubtitleFontFamily: string;
  promotionVideoSubtitleFontWeight: string;
  promotionVideoSubtitleFontStyle: string;
  promotionVideoSubtitleTextDecoration: string;
  promotionVideoSubtitleTextAlign: string;
  promotionVideoSubtitleLineHeight: string;
  promotionVideoSubtitleLetterSpacing: string;
  promotionVideoSubtitleWordSpacing: string;
  promotionVideoSubtitleTextIndent: string;
  promotionVideoSubtitleMargin: string;
  promotionVideoSubtitlePadding: string;
  promotionVideoSubtitleBorder: string;
  promotionVideoSubtitleBorderRadius: string;
  promotionVideoSubtitleBoxShadow: string;
  promotionVideoSubtitleBackground: string;
  promotionVideoSubtitleOpacity: string;
  promotionVideoSubtitleZIndex: string;
  promotionVideoSubtitleTransform: string;
  promotionVideoSubtitleTransition: string;
  promotionVideoSubtitleAnimation: string;
  promotionVideoSubtitleCursor: string;
  promotionVideoSubtitlePointerEvents: string;
  promotionVideoSubtitleUserSelect: string;
  promotionVideoSubtitleOverflow: string;
  promotionVideoSubtitleTextOverflow: string;
  promotionVideoSubtitleWhiteSpace: string;
  promotionVideoSubtitleWordBreak: string;
  promotionVideoSubtitleWordWrap: string;
  promotionVideoSubtitleHyphens: string;
  promotionVideoSubtitleDirection: string;
  promotionVideoSubtitleUnicodeBidi: string;
  promotionVideoSubtitleWritingMode: string;
  promotionVideoSubtitleTextOrientation: string;
  promotionVideoSubtitleTextTransform: string;
  promotionVideoSubtitleTextShadow: string;
  promotionVideoSubtitleFilter: string;
  promotionVideoSubtitleBackdropFilter: string;
  promotionVideoSubtitleMixBlendMode: string;
  promotionVideoSubtitleIsolation: string;
  promotionVideoSubtitleContain: string;
  promotionVideoSubtitleContainIntrinsicSize: string;
  promotionVideoSubtitleContainIntrinsicBlockSize: string;
  promotionVideoSubtitleContainIntrinsicInlineSize: string;
  promotionVideoSubtitleContainIntrinsicWidth: string;
  promotionVideoSubtitleContainIntrinsicHeight: string;
  promotionVideoSubtitleContainIntrinsicMinWidth: string;
  promotionVideoSubtitleContainIntrinsicMaxWidth: string;
  promotionVideoSubtitleContainIntrinsicMinHeight: string;
  promotionVideoSubtitleContainIntrinsicMaxHeight: string;
  promotionVideoSubtitleContainIntrinsicLogicalWidth: string;
  promotionVideoSubtitleContainIntrinsicLogicalHeight: string;
  promotionVideoSubtitleContainIntrinsicLogicalMinWidth: string;
  promotionVideoSubtitleContainIntrinsicLogicalMaxWidth: string;
  promotionVideoSubtitleContainIntrinsicLogicalMinHeight: string;
  promotionVideoSubtitleContainIntrinsicLogicalMaxHeight: string;
  promotionVideoSubtitleContainIntrinsicSizeStyle: string;
  promotionVideoSubtitleContainIntrinsicBlockSizeStyle: string;
  promotionVideoSubtitleContainIntrinsicInlineSizeStyle: string;
  promotionVideoSubtitleContainIntrinsicWidthStyle: string;
  promotionVideoSubtitleContainIntrinsicHeightStyle: string;
  promotionVideoSubtitleContainIntrinsicMinWidthStyle: string;
  promotionVideoSubtitleContainIntrinsicMaxWidthStyle: string;
  promotionVideoSubtitleContainIntrinsicMinHeightStyle: string;
  promotionVideoSubtitleContainIntrinsicMaxHeightStyle: string;
  promotionVideoSubtitleContainIntrinsicLogicalWidthStyle: string;
  promotionVideoSubtitleContainIntrinsicLogicalHeightStyle: string;
  promotionVideoSubtitleContainIntrinsicLogicalMinWidthStyle: string;
  promotionVideoSubtitleContainIntrinsicLogicalMaxWidthStyle: string;
  promotionVideoSubtitleContainIntrinsicLogicalMinHeightStyle: string;
  promotionVideoSubtitleContainIntrinsicLogicalMaxHeightStyle: string;
}

export interface AliExpressOrder {
  orderId: string;
  orderStatus: string;
  orderAmount: string;
  orderCurrency: string;
  orderTime: string;
  paymentTime: string;
  deliveryTime: string;
  completionTime: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: {
    country: string;
    state: string;
    city: string;
    address: string;
    zipCode: string;
    recipientName: string;
    recipientPhone: string;
  };
  items: Array<{
    productId: string;
    productTitle: string;
    productImage: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  trackingNumber: string;
  trackingUrl: string;
}

export interface AliExpressShipping {
  shippingMethod: string;
  shippingCost: string;
  shippingTime: string;
  trackingNumber: string;
  trackingUrl: string;
}

// Cliente HTTP
const http: AxiosInstance = axios.create({
  baseURL: ALIEXPRESS_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para gerar assinatura
function generateSignature(params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');

  const signString = ALIEXPRESS_APP_SECRET + sortedParams + ALIEXPRESS_APP_SECRET;
  return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
}

// Função para fazer request com rate limiting
async function makeRequest(method: string, params: Record<string, any>): Promise<any> {
  const timestamp = Date.now().toString();
  
  const requestParams: Record<string, any> = {
    method,
    app_key: ALIEXPRESS_APP_KEY,
    timestamp,
    format: 'json',
    v: '2.0',
    sign_method: 'md5',
    access_token: ALIEXPRESS_ACCESS_TOKEN,
    ...params,
  };

  const signature = generateSignature(requestParams);
  (requestParams as any).sign = signature;

  return limiter.schedule(async () => {
    try {
      const response = await http.post('', requestParams);
      return response.data;
    } catch (error) {
      console.error('AliExpress API Error:', error);
      throw error;
    }
  });
}

// Cliente AliExpress
export const aliexpressClient = {
  // Buscar produtos
  async searchProducts(params: {
    keywords?: string;
    categoryId?: string;
    pageNo?: number;
    pageSize?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    targetCurrency?: string;
    targetLanguage?: string;
  }): Promise<{ products: AliExpressProduct[]; totalCount: number }> {
    const response = await makeRequest('aliexpress.product.get', {
      keywords: params.keywords || 'tech accessories',
      category_id: params.categoryId || '',
      page_no: params.pageNo || 1,
      page_size: params.pageSize || 20,
      sort: params.sort || 'SALE_PRICE_ASC',
      min_price: params.minPrice || 0,
      max_price: params.maxPrice || 999999,
      target_currency: params.targetCurrency || 'BRL',
      target_language: params.targetLanguage || 'PT',
    });

    return {
      products: response.result?.products || [],
      totalCount: response.result?.total_count || 0,
    };
  },

  // Buscar produto específico
  async getProduct(productId: string): Promise<AliExpressProduct> {
    const response = await makeRequest('aliexpress.product.details.get', {
      product_id: productId,
      target_currency: 'BRL',
      target_language: 'PT',
    });

    return response.result;
  },

  // Criar pedido
  async createOrder(orderData: {
    productId: string;
    quantity: number;
    shippingAddress: {
      country: string;
      state: string;
      city: string;
      address: string;
      zipCode: string;
      recipientName: string;
      recipientPhone: string;
    };
    buyerInfo: {
      name: string;
      email: string;
      phone: string;
    };
  }): Promise<{ orderId: string; orderStatus: string }> {
    const response = await makeRequest('aliexpress.order.create', {
      product_id: orderData.productId,
      quantity: orderData.quantity,
      shipping_address: JSON.stringify(orderData.shippingAddress),
      buyer_info: JSON.stringify(orderData.buyerInfo),
    });

    return {
      orderId: response.result?.order_id,
      orderStatus: response.result?.order_status,
    };
  },

  // Calcular frete
  async calculateShipping(params: {
    productId: string;
    quantity: number;
    countryCode: string;
    zipCode: string;
  }): Promise<AliExpressShipping[]> {
    const response = await makeRequest('aliexpress.logistics.get', {
      product_id: params.productId,
      quantity: params.quantity,
      country_code: params.countryCode,
      zip_code: params.zipCode,
    });

    return response.result?.shipping_methods || [];
  },

  // Rastrear pedido
  async trackOrder(orderId: string): Promise<AliExpressOrder> {
    const response = await makeRequest('aliexpress.order.tracking.get', {
      order_id: orderId,
    });

    return response.result;
  },

  // Buscar categorias
  async getCategories(): Promise<Array<{ categoryId: string; categoryName: string }>> {
    const response = await makeRequest('aliexpress.category.get', {});
    return response.result?.categories || [];
  },

  // Buscar produtos em destaque
  async getFeaturedProducts(): Promise<AliExpressProduct[]> {
    const response = await makeRequest('aliexpress.product.get', {
      keywords: 'tech accessories',
      sort: 'SALE_PRICE_ASC',
      page_size: 12,
      target_currency: 'BRL',
      target_language: 'PT',
    });

    return response.result?.products || [];
  },

  // Buscar produtos relacionados
  async getRelatedProducts(productId: string): Promise<AliExpressProduct[]> {
    const product = await this.getProduct(productId);
    const categoryId = product.categoryId;

    const response = await makeRequest('aliexpress.product.get', {
      category_id: categoryId,
      page_size: 8,
      target_currency: 'BRL',
      target_language: 'PT',
    });

    return response.result?.products || [];
  },

  // Validar credenciais
  async validateCredentials(): Promise<boolean> {
    try {
      await makeRequest('aliexpress.category.get', {});
      return true;
    } catch (error) {
      console.error('AliExpress credentials validation failed:', error);
      return false;
    }
  },
};

// Cache para produtos
const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export const aliexpressCache = {
  // Buscar do cache
  get(key: string): any | null {
    const cached = productCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  },

  // Salvar no cache
  set(key: string, data: any): void {
    productCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  // Limpar cache
  clear(): void {
    productCache.clear();
  },

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of productCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        productCache.delete(key);
      }
    }
  },
};

// Limpar cache expirado a cada 5 minutos
setInterval(() => {
  aliexpressCache.cleanup();
}, 5 * 60 * 1000);

export default aliexpressClient;
