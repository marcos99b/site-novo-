import { createClient } from '@supabase/supabase-js';
import { getTracker } from './tracking';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Verificar se as variáveis estão configuradas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente:');
  console.warn('NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.warn('Veja o arquivo ENV-EXAMPLE.md para instruções');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== TIPOS PARA O BANCO DE DADOS =====

// Tipos básicos
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    phone?: string;
  };
  last_sign_in_at?: string;
}

// CRM - Customer Relationship Management
export interface Lead {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  source: 'google' | 'email' | 'manual' | 'facebook' | 'instagram' | 'google_ads';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lead_score: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  customer_since: string;
  status: 'active' | 'inactive' | 'vip';
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  type: 'email' | 'phone' | 'chat' | 'support' | 'purchase' | 'review';
  description?: string;
  outcome?: string;
  created_at: string;
}

// E-commerce
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  cost_price?: number;
  profit_margin?: number;
  stock_quantity: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  status: 'publish' | 'draft' | 'pending';
  featured: boolean;
  category_id?: string;
  supplier_id?: string;
  supplier_product_id?: string;
  weight?: number;
  dimensions?: any;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  src: string;
  alt?: string;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_id?: string;
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address?: any;
  billing_address?: any;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Analytics & Tracking
export interface ProductView {
  id: string;
  product_id: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}

export interface UserEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_data?: any;
  page_url?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper genérico para eventos (para unificar futura integração com fbq)
export async function trackUserEventGeneric(event_type: string, event_data?: any, page_url?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('user_events').insert({
      user_id: user?.id,
      event_type,
      event_data,
      page_url: page_url || (typeof window !== 'undefined' ? window.location.pathname : undefined)
    });
  } catch (error) {
    // Silencioso para não quebrar UX
  }
}

// Content Management
export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  customer_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  name?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  position: string;
  active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
}

// Logistics
export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  name: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  location?: string;
  description?: string;
  tracking_date: string;
  created_at: string;
}

// Site Settings
export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ===== FUNÇÕES AUXILIARES =====

// Função para criar lead automaticamente
export async function createLeadFromUser(user: any) {
  try {
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!existingLead) {
      const { error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || null,
          source: 'signup',
          status: 'new'
        });

      if (error) {
        console.error('Erro ao criar lead:', error);
      } else {
        console.log('✅ Lead criado com sucesso');
      }
    }
  } catch (error) {
    console.error('Erro ao criar lead:', error);
  }
}

// Função para criar cliente automaticamente
export async function createCustomerFromUser(user: any) {
  try {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!existingCustomer) {
      const { error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || null,
          total_orders: 0,
          total_spent: 0,
          status: 'active'
        });

      if (error) {
        console.error('Erro ao criar customer:', error);
      } else {
        console.log('✅ Customer criado com sucesso');
      }
    }
  } catch (error) {
    console.error('Erro ao criar customer:', error);
  }
}

// Função para registrar visualização de produto
export async function trackProductView(productId: string, sessionId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sid = sessionId || (typeof window !== 'undefined' ? getTracker().getSessionStats().session_id : undefined);
    await supabase.from('product_views').insert({
      product_id: productId,
      user_id: user?.id,
      session_id: sid
    });
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
  }
}

// Função para registrar evento do usuário
export async function trackUserEvent(eventType: string, eventData?: any, pageUrl?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sid = (typeof window !== 'undefined' ? getTracker().getSessionStats().session_id : undefined);
    const url = pageUrl || (typeof window !== 'undefined' ? window.location.pathname : undefined);
    const insert = await supabase.from('user_events').insert({
      session_id: sid,
      user_id: user?.id,
      event_type: eventType,
      event_data: eventData,
      page_url: url
    });
    // Atualizar agregador de durações por rota quando evento for time_spent
    if (!insert.error && eventType === 'time_spent' && sid && url) {
      const seconds = Number(eventData?.duration_seconds || 0);
      if (seconds > 0) {
        try {
          await supabase.rpc('upsert_user_route_duration', {
            p_session_id: sid,
            p_user_id: user?.id || null,
            p_page_url: url,
            p_seconds: seconds
          });
        } catch {}
      }
    }
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
  }
}

// === CRM Service (restaurado) ===
export const crmService = {
  async getCustomer(email: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data || null;
  },

  async createCustomer(payload: { email: string; name?: string; phone?: string; address?: any }) {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        email: payload.email,
        name: payload.name || null,
        phone: payload.phone || null,
        ...((payload.address ? { address: payload.address } : {})),
        total_orders: 0,
        total_spent: 0,
        status: 'active'
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: { email?: string; name?: string; phone?: string; address?: any }) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
};
