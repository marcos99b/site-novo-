// Biblioteca para integração com WooCommerce
// Esta versão simplifica muito o gerenciamento de produtos

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: WooImage[];
  categories: WooCategory[];
  stock_quantity?: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  status: 'publish' | 'draft' | 'pending';
}

export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
}

// Produtos estáticos para demonstração (depois migra para WooCommerce)
export const staticProducts: WooProduct[] = [
  {
    id: 1,
    name: "Carregador Magnético 3-em-1",
    slug: "carregador-magnetico-3-em-1",
    description: "Carregue iPhone, AirPods e Apple Watch simultaneamente com design dobrável e acabamento premium.",
    short_description: "Carregamento magnético 3-em-1 para dispositivos Apple",
    price: "379.00",
    regular_price: "549.00",
    sale_price: "379.00",
    stock_quantity: 50,
    stock_status: "instock",
    status: "publish",
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=1200&auto=format&fit=crop",
        name: "Carregador 3-em-1",
        alt: "Carregador Magnético 3-em-1"
      }
    ],
    categories: [
      { id: 1, name: "Carregadores", slug: "carregadores" }
    ]
  },
  {
    id: 2,
    name: "QuickCharge Pro®",
    slug: "quickcharge-pro",
    description: "O nosso carregador mais rápido. Dobre, leve, conecte e carregue tudo em 1 hora.",
    short_description: "Carregamento ultra rápido com tecnologia QuickCharge Pro",
    price: "299.00",
    regular_price: "399.00",
    sale_price: "299.00",
    stock_quantity: 30,
    stock_status: "instock",
    status: "publish",
    images: [
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=1200&auto=format&fit=crop",
        name: "QuickCharge Pro",
        alt: "QuickCharge Pro"
      }
    ],
    categories: [
      { id: 1, name: "Carregadores", slug: "carregadores" }
    ]
  },
  {
    id: 3,
    name: "Power Bank 20000mAh",
    slug: "power-bank-20000mah",
    description: "Power bank de alta capacidade com carregamento rápido e múltiplas saídas.",
    short_description: "Power bank portátil de 20000mAh",
    price: "199.00",
    regular_price: "249.00",
    sale_price: "199.00",
    stock_quantity: 25,
    stock_status: "instock",
    status: "publish",
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1583947215259-38e31be8757d?q=80&w=1200&auto=format&fit=crop",
        name: "Power Bank",
        alt: "Power Bank 20000mAh"
      }
    ],
    categories: [
      { id: 2, name: "Power Banks", slug: "power-banks" }
    ]
  },
  {
    id: 4,
    name: "Cabo USB-C Premium",
    slug: "cabo-usb-c-premium",
    description: "Cabo USB-C de alta qualidade com suporte a carregamento rápido e transferência de dados.",
    short_description: "Cabo USB-C premium com carregamento rápido",
    price: "49.00",
    regular_price: "69.00",
    sale_price: "49.00",
    stock_quantity: 100,
    stock_status: "instock",
    status: "publish",
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1587202372775-98927b415cde?q=80&w=1200&auto=format&fit=crop",
        name: "Cabo USB-C",
        alt: "Cabo USB-C Premium"
      }
    ],
    categories: [
      { id: 3, name: "Cabos", slug: "cabos" }
    ]
  }
];

export class WooCommerceClient {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    this.baseUrl = process.env.WOOCOMMERCE_URL || '';
    this.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    this.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
  }

  // Método para buscar produtos do WooCommerce
  async getProducts(): Promise<WooProduct[]> {
    try {
      // Por enquanto retorna produtos estáticos
      // Quando migrar para WooCommerce, descomente o código abaixo:
      
      /*
      const response = await fetch(
        `${this.baseUrl}/wp-json/wc/v3/products?consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`
      );
      
      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }
      
      return await response.json();
      */
      
      return staticProducts;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return staticProducts; // Fallback para produtos estáticos
    }
  }

  // Método para buscar um produto específico
  async getProduct(id: number): Promise<WooProduct | null> {
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  // Método para buscar produtos por categoria
  async getProductsByCategory(categorySlug: string): Promise<WooProduct[]> {
    try {
      const products = await this.getProducts();
      return products.filter(p => 
        p.categories.some(cat => cat.slug === categorySlug)
      );
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }
  }
}

export const wooClient = new WooCommerceClient();
