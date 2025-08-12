"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface PaymentForm {
  id?: string;
  type: 'card' | 'paypal' | 'mbway';
  brand?: string;
  last4?: string;
  holder_name?: string;
  expiry_month?: number;
  expiry_year?: number;
  billing_address_id?: string | null;
  is_default: boolean;
}

export default function PagamentosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stateLoading, setStateLoading] = useState(true);
  const [methods, setMethods] = useState<PaymentForm[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [form, setForm] = useState<PaymentForm>({
    type: 'card',
    brand: '',
    last4: '',
    holder_name: '',
    expiry_month: undefined,
    expiry_year: undefined,
    billing_address_id: null,
    is_default: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMethods();
      loadAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      const redirect = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [loading, user, router]);

  async function loadMethods() {
    try {
      setStateLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMethods(data as any);
    } catch (e: any) {
      toast.error('Erro ao carregar métodos de pagamento');
    } finally {
      setStateLoading(false);
    }
  }

  async function loadAddresses() {
    try {
      const { data } = await supabase
        .from('addresses')
        .select('id, name, street, number, city, state')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setAddresses(data || []);
    } catch {}
  }

  async function saveMethod() {
    try {
      setStateLoading(true);
      const payload = { ...form, user_id: user?.id } as any;
      if (payload.type !== 'card') {
        delete payload.brand;
        delete payload.last4;
        delete payload.holder_name;
        delete payload.expiry_month;
        delete payload.expiry_year;
      }
      if (editingId) {
        const { error } = await supabase.from('payment_methods').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Método atualizado!');
      } else {
        const { error } = await supabase.from('payment_methods').insert(payload);
        if (error) throw error;
        toast.success('Método adicionado!');
      }
      setEditingId(null);
      setForm({ type: 'card', brand: '', last4: '', holder_name: '', expiry_month: undefined, expiry_year: undefined, billing_address_id: null, is_default: true });
      loadMethods();
    } catch (e: any) {
      toast.error('Erro ao salvar método');
    } finally {
      setStateLoading(false);
    }
  }

  async function editMethod(m: any) {
    setEditingId(m.id);
    setForm({
      id: m.id,
      type: m.type,
      brand: m.brand || '',
      last4: m.last4 || '',
      holder_name: m.holder_name || '',
      expiry_month: m.expiry_month || undefined,
      expiry_year: m.expiry_year || undefined,
      billing_address_id: m.billing_address_id || null,
      is_default: m.is_default,
    });
  }

  async function deleteMethod(id: string) {
    try {
      setStateLoading(true);
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
      toast.success('Método removido!');
      loadMethods();
    } catch (e: any) {
      toast.error('Erro ao remover método');
    } finally {
      setStateLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/30 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Redirecionando para login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-elegant bg-white p-6">
          <h2 className="text-xl font-semibold text-[#111827] mb-4">{editingId ? 'Editar método' : 'Novo método de pagamento'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]">
                <option value="card">Cartão</option>
                <option value="paypal">PayPal</option>
                <option value="mbway">MB Way</option>
              </select>
            </div>

            {form.type === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bandeira</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" placeholder="Visa, Mastercard" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Últimos 4 dígitos</label>
                  <input value={form.last4} onChange={e => setForm({ ...form, last4: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" placeholder="1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome no cartão</label>
                  <input value={form.holder_name} onChange={e => setForm({ ...form, holder_name: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={form.expiry_month || ''} onChange={e => setForm({ ...form, expiry_month: Number(e.target.value) })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" placeholder="MM" />
                    <input type="number" value={form.expiry_year || ''} onChange={e => setForm({ ...form, expiry_year: Number(e.target.value) })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" placeholder="AAAA" />
                  </div>
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço de cobrança</label>
              <select value={form.billing_address_id || ''} onChange={e => setForm({ ...form, billing_address_id: e.target.value || null })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]">
                <option value="">Selecione um endereço</option>
                {addresses.map(addr => (
                  <option key={addr.id} value={addr.id}>{addr.name || `${addr.street}, ${addr.number} - ${addr.city}`}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
              <span className="text-[#6b7280]">Definir como método padrão</span>
            </div>

            <div className="col-span-2">
              <button onClick={saveMethod} disabled={stateLoading} className="btn-primary w-full py-3">{editingId ? 'Salvar alterações' : 'Adicionar método'}</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Meus métodos de pagamento</h2>
          {stateLoading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : methods.length === 0 ? (
            <p className="text-gray-400">Nenhum método cadastrado.</p>
          ) : (
            methods.map((m) => (
              <div key={m.id} className="card-elegant bg-white p-6 flex items-start justify-between">
                <div>
                  <p className="text-[#111827] font-medium">
                    {m.type === 'card' ? `${m.brand || 'Cartão'} •••• ${m.last4 || '----'}` : m.type.toUpperCase()} {m.is_default ? ' • Padrão' : ''}
                  </p>
                  {m.type === 'card' && (
                    <p className="text-[#6b7280]">Venc: {m.expiry_month?.toString().padStart(2, '0')}/{m.expiry_year}</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => editMethod(m)} className="btn-primary px-4 py-2">Editar</button>
                  <button onClick={() => deleteMethod(m.id!)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl">Remover</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
