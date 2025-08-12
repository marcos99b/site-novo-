// Biblioteca para integração com Nuvemshop
// Esta versão é otimizada para a plataforma Nuvemshop

export interface NuvemProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number;
  images: NuvemImage[];
  categories: NuvemCategory[];
  stock: number;
  available: boolean;
  featured: boolean;
  variants: NuvemVariant[];
  created_at: string;
  updated_at: string;
}

export interface NuvemImage {
  id: number;
  src: string;
  alt: string;
  position: number;
}

export interface NuvemCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent_id: number | null;
}

export interface NuvemVariant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface NuvemCustomer {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  addresses: NuvemAddress[];
  created_at: string;
  updated_at: string;
}

export interface NuvemAddress {
  id: number;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
}

export interface NuvemOrder {
  id: number;
  number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax_cost: number;
  discount_cost: number;
  customer: NuvemCustomer;
  items: NuvemOrderItem[];
  shipping_address: NuvemAddress;
  billing_address: NuvemAddress;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface NuvemOrderItem {
  id: number;
  product_id: number;
  variant_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Produtos estáticos para demonstração (depois migra para Nuvemshop)
export const staticProducts: NuvemProduct[] = [
  {
    id: 1,
    name: "Carregador Magnético 3-em-1 Premium",
    slug: "carregador-magnetico-3-em-1-premium",
    description: "Carregue iPhone, AirPods e Apple Watch simultaneamente com design magnético premium. Tecnologia avançada e acabamento de luxo para seus dispositivos Apple.",
    short_description: "Carregamento magnético 3-em-1 para dispositivos Apple",
    price: 379.00,
    compare_at_price: 549.00,
    stock: 50,
    available: true,
    featured: true,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=1200&auto=format&fit=crop",
        alt: "Carregador Magnético 3-em-1 Premium",
        position: 0
      },
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=1200&auto=format&fit=crop",
        alt: "Carregador Magnético 3-em-1 Premium - Vista Lateral",
        position: 1
      }
    ],
    categories: [
      { id: 1, name: "Carregadores", slug: "carregadores", description: "Carregadores magnéticos e wireless", parent_id: null }
    ],
    variants: [
      {
        id: 1,
        sku: "CHG-3IN1-001",
        price: 379.00,
        stock: 50,
        weight: 0.5,
        dimensions: { width: 10, height: 2, depth: 10 }
      }
    ]
  },
  {
    id: 2,
    name: "QuickCharge Pro® Ultra Rápido",
    slug: "quickcharge-pro-ultra-rapido",
    description: "O nosso carregador mais avançado. Tecnologia de carregamento ultra-rápido, design magnético premium e compatibilidade total com dispositivos Apple.",
    short_description: "Carregamento ultra rápido com tecnologia QuickCharge Pro",
    price: 299.00,
    compare_at_price: 399.00,
    stock: 30,
    available: true,
    featured: true,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1592750475338-74b7b21085c9?q=80&w=1200&auto=format&fit=crop",
        alt: "QuickCharge Pro Ultra Rápido",
        position: 0
      },
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1609599006353-c97a1f0f2b9a?q=80&w=1200&auto=format&fit=crop",
        alt: "QuickCharge Pro Ultra Rápido - Carregando",
        position: 1
      }
    ],
    categories: [
      { id: 1, name: "Carregadores", slug: "carregadores", description: "Carregadores magnéticos e wireless", parent_id: null }
    ],
    variants: [
      {
        id: 2,
        sku: "CHG-QCP-002",
        price: 299.00,
        stock: 30,
        weight: 0.3,
        dimensions: { width: 8, height: 1.5, depth: 8 }
      }
    ]
  },
  {
    id: 3,
    name: "Power Bank 20000mAh Turbo",
    slug: "power-bank-20000mah-turbo",
    description: "Power bank de alta capacidade com carregamento rápido e múltiplas saídas. Ideal para viagens e uso diário com tecnologia Turbo Charge.",
    short_description: "Power bank portátil de 20000mAh com Turbo Charge",
    price: 199.00,
    compare_at_price: 249.00,
    stock: 25,
    available: true,
    featured: false,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1583947215259-38e31be8757d?q=80&w=1200&auto=format&fit=crop",
        alt: "Power Bank 20000mAh Turbo",
        position: 0
      }
    ],
    categories: [
      { id: 2, name: "Power Banks", slug: "power-banks", description: "Baterias portáteis de alta capacidade", parent_id: null }
    ],
    variants: [
      {
        id: 3,
        sku: "PBK-20K-003",
        price: 199.00,
        stock: 25,
        weight: 0.8,
        dimensions: { width: 12, height: 3, depth: 12 }
      }
    ]
  },
  {
    id: 4,
    name: "Cabo USB-C Premium Gold",
    slug: "cabo-usb-c-premium-gold",
    description: "Cabo USB-C de alta qualidade com suporte a carregamento rápido e transferência de dados. Durabilidade garantida com conector dourado premium.",
    short_description: "Cabo USB-C premium com conector dourado",
    price: 49.00,
    compare_at_price: 69.00,
    stock: 100,
    available: true,
    featured: false,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1587202372775-98927b415cde?q=80&w=1200&auto=format&fit=crop",
        alt: "Cabo USB-C Premium Gold",
        position: 0
      }
    ],
    categories: [
      { id: 3, name: "Cabos", slug: "cabos", description: "Cabos USB-C e Lightning de alta qualidade", parent_id: null }
    ],
    variants: [
      {
        id: 4,
        sku: "CBL-USBC-004",
        price: 49.00,
        stock: 100,
        weight: 0.1,
        dimensions: { width: 1, height: 0.5, depth: 100 }
      }
    ]
  },
  {
    id: 5,
    name: "AirPods Pro 2ª Geração",
    slug: "airpods-pro-2-geracao",
    description: "AirPods Pro com cancelamento de ruído ativo, áudio espacial e resistência à água. A melhor experiência de áudio sem fio para iPhone.",
    short_description: "AirPods Pro com cancelamento de ruído ativo",
    price: 1899.00,
    compare_at_price: 2299.00,
    stock: 15,
    available: true,
    featured: true,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=1200&auto=format&fit=crop",
        alt: "AirPods Pro 2ª Geração",
        position: 0
      }
    ],
    categories: [
      { id: 4, name: "Fones de Ouvido", slug: "fones-de-ouvido", description: "Fones de ouvido sem fio e com fio", parent_id: null }
    ],
    variants: [
      {
        id: 5,
        sku: "AIRPODS-PRO-005",
        price: 1899.00,
        stock: 15,
        weight: 0.2,
        dimensions: { width: 5, height: 2, depth: 5 }
      }
    ]
  },
  {
    id: 6,
    name: "Capa iPhone 15 Pro Max Premium",
    slug: "capa-iphone-15-pro-max-premium",
    description: "Capa premium para iPhone 15 Pro Max com proteção militar e design magnético. Compatível com MagSafe e carregamento wireless.",
    short_description: "Capa premium com proteção militar para iPhone 15 Pro Max",
    price: 299.00,
    compare_at_price: 399.00,
    stock: 40,
    available: true,
    featured: false,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?q=80&w=1200&auto=format&fit=crop",
        alt: "Capa iPhone 15 Pro Max Premium",
        position: 0
      }
    ],
    categories: [
      { id: 5, name: "Capas", slug: "capas", description: "Capas e proteções para iPhone", parent_id: null }
    ],
    variants: [
      {
        id: 6,
        sku: "CASE-IP15PM-006",
        price: 299.00,
        stock: 40,
        weight: 0.3,
        dimensions: { width: 8, height: 1, depth: 16 }
      }
    ]
  },
  {
    id: 7,
    name: "Apple Watch Series 9",
    slug: "apple-watch-series-9",
    description: "Apple Watch Series 9 com monitoramento avançado de saúde, GPS integrado e design elegante. Acompanha seu estilo e sua saúde.",
    short_description: "Apple Watch Series 9 com monitoramento de saúde",
    price: 3499.00,
    compare_at_price: 3999.00,
    stock: 8,
    available: true,
    featured: true,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 7,
        src: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=1200&auto=format&fit=crop",
        alt: "Apple Watch Series 9",
        position: 0
      }
    ],
    categories: [
      { id: 6, name: "Smartwatches", slug: "smartwatches", description: "Relógios inteligentes e acessórios", parent_id: null }
    ],
    variants: [
      {
        id: 7,
        sku: "AW-S9-007",
        price: 3499.00,
        stock: 8,
        weight: 0.4,
        dimensions: { width: 4, height: 1, depth: 4 }
      }
    ]
  },
  {
    id: 8,
    name: "iPad Pro 12.9\" M2",
    slug: "ipad-pro-12-9-m2",
    description: "iPad Pro 12.9\" com chip M2, tela Liquid Retina XDR e suporte ao Apple Pencil. O tablet mais poderoso do mundo.",
    short_description: "iPad Pro 12.9\" com chip M2 e tela Liquid Retina XDR",
    price: 8999.00,
    compare_at_price: 9999.00,
    stock: 5,
    available: true,
    featured: true,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
    images: [
      {
        id: 8,
        src: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
        alt: "iPad Pro 12.9\" M2",
        position: 0
      }
    ],
    categories: [
      { id: 7, name: "Tablets", slug: "tablets", description: "Tablets e acessórios", parent_id: null }
    ],
    variants: [
      {
        id: 8,
        sku: "IPAD-PRO-12-008",
        price: 8999.00,
        stock: 5,
        weight: 1.5,
        dimensions: { width: 28, height: 1, depth: 22 }
      }
    ]
  }
];

export class NuvemshopClient {
  private storeId: string;
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.storeId = process.env.NUVEMSHOP_STORE_ID || '';
    this.accessToken = process.env.NUVEMSHOP_ACCESS_TOKEN || '';
    this.baseUrl = `https://api.nuvemshop.com.br/v1/${this.storeId}`;
  }

  // Método para buscar produtos do Nuvemshop
  async getProducts(): Promise<NuvemProduct[]> {
    try {
      // Por enquanto retorna produtos estáticos
      // Quando migrar para Nuvemshop, descomente o código abaixo:
      
      /*
      const response = await fetch(`${this.baseUrl}/products`, {
        headers: {
          'Authentication': `bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nuvemshop API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      */
      
      return staticProducts;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return staticProducts; // Fallback para produtos estáticos
    }
  }

  // Método para buscar um produto específico
  async getProduct(id: number): Promise<NuvemProduct | null> {
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  // Método para buscar produtos por categoria
  async getProductsByCategory(categorySlug: string): Promise<NuvemProduct[]> {
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

  // Método para buscar produtos por texto
  async searchProducts(query: string): Promise<NuvemProduct[]> {
    try {
      const products = await this.getProducts();
      const searchTerm = query.toLowerCase();
      
      return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.short_description.toLowerCase().includes(searchTerm) ||
        p.categories.some(cat => cat.name.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  // Método para buscar produtos em destaque
  async getFeaturedProducts(): Promise<NuvemProduct[]> {
    try {
      const products = await this.getProducts();
      return products.filter(p => p.featured);
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return [];
    }
  }

  // Método para buscar categorias
  async getCategories(): Promise<NuvemCategory[]> {
    try {
      const products = await this.getProducts();
      const categories = new Map<number, NuvemCategory>();
      
      products.forEach(product => {
        product.categories.forEach(category => {
          categories.set(category.id, category);
        });
      });
      
      return Array.from(categories.values());
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  // Método para criar pedido
  async createOrder(orderData: Partial<NuvemOrder>): Promise<NuvemOrder | null> {
    try {
      // Implementar criação de pedido no Nuvemshop
      console.log('Criando pedido no Nuvemshop:', orderData);
      return null;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return null;
    }
  }

  // Método para buscar cliente
  async getCustomer(email: string): Promise<NuvemCustomer | null> {
    try {
      // Implementar busca de cliente no Nuvemshop
      console.log('Buscando cliente no Nuvemshop:', email);
      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  // Método para criar cliente
  async createCustomer(customerData: Partial<NuvemCustomer>): Promise<NuvemCustomer | null> {
    try {
      // Implementar criação de cliente no Nuvemshop
      console.log('Criando cliente no Nuvemshop:', customerData);
      return null;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }
  }
}

export const nuvemClient = new NuvemshopClient();
