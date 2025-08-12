import { supabase } from './supabase';

// Tipos para o E-commerce
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  status: 'publish' | 'draft' | 'pending';
  featured: boolean;
  category_id: string;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  category?: Category;
  reviews?: ProductReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  src: string;
  alt: string;
  position: number;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string | null;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

// Serviço principal do E-commerce
export const ecommerceService = {
  // Produtos
  async getProducts(options?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        images (*),
        category:categories (*),
        reviews:product_reviews (*)
      `)
      .eq('status', 'publish')
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('category.slug', options.category);
    }

    if (options?.featured) {
      query = query.eq('featured', true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getProduct(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images (*),
        category:categories (*),
        reviews:product_reviews (*)
      `)
      .eq('slug', slug)
      .eq('status', 'publish')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images (*),
        category:categories (*),
        reviews:product_reviews (*)
      `)
      .eq('id', id)
      .eq('status', 'publish')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Categorias
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getCategory(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Carrinho
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (*)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addToCart(sessionId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    // Verificar se o item já existe no carrinho
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Atualizar quantidade
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Adicionar novo item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: productId,
          quantity
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCart(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async clearCart(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
  },

  // Clientes
  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCustomer(email: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Pedidos
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrders(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*),
        customer:customers (*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrder(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*),
        customer:customers (*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  // Avaliações
  async createReview(reviewData: Partial<ProductReview>): Promise<ProductReview> {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Cupons
  async validateCoupon(code: string, totalAmount: number): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .gte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Verificar valor mínimo
    if (data.minimum_amount && totalAmount < data.minimum_amount) {
      return null;
    }

    // Verificar limite de uso
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return null;
    }

    return data;
  },

  async useCoupon(code: string): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .update({ used_count: supabase.rpc('increment') })
      .eq('code', code);

    if (error) throw error;
  },

  // Utilitários
  generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `TS${timestamp}${random}`;
  },

  calculateDiscount(coupon: Coupon, totalAmount: number): number {
    if (coupon.type === 'percentage') {
      return (totalAmount * coupon.value) / 100;
    } else {
      return coupon.value;
    }
  }
};
