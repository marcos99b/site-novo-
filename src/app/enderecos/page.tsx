"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface AddressForm {
  id?: string;
  type: 'shipping' | 'billing';
  name: string; // rótulo do endereço
  street: string; // Morada
  number?: string; // Nº / Porta
  complement?: string; // Andar / Apartamento
  neighborhood?: string; // Bairro/Freguesia (opcional)
  city: string; // Concelho
  state: string; // Distrito
  postal_code: string; // Código Postal PT (1234-567)
  country: string; // Sempre 'PT'
  phone?: string; // Telemóvel
  is_default: boolean;
}

export default function EnderecosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressForm[]>([]);
  const [form, setForm] = useState<AddressForm>({
    type: 'shipping',
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'PT',
    phone: '',
    is_default: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      const redirect = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [loading, user, router]);

  async function loadAddresses() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAddresses(data as any);
    } catch (e: any) {
      toast.error('Erro ao carregar endereços');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveAddress() {
    try {
      setIsLoading(true);
      const payload = { ...form, user_id: user?.id };
      if (editingId) {
        const { error } = await supabase.from('addresses').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Endereço atualizado!');
      } else {
        const { error } = await supabase.from('addresses').insert(payload);
        if (error) throw error;
        toast.success('Endereço adicionado!');
      }
      setForm({
        type: 'shipping', name: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', postal_code: '', country: 'PT', phone: '', is_default: true
      });
      setEditingId(null);
      loadAddresses();
    } catch (e: any) {
      toast.error('Erro ao salvar endereço');
    } finally {
      setIsLoading(false);
    }
  }

  async function editAddress(addr: AddressForm) {
    setEditingId(addr.id!);
    setForm({ ...addr });
  }

  async function deleteAddress(id: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Endereço removido!');
      loadAddresses();
    } catch (e: any) {
      toast.error('Erro ao remover endereço');
    } finally {
      setIsLoading(false);
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
          <h2 className="text-xl font-semibold text-[#111827] mb-4">{editingId ? 'Editar endereço' : 'Novo endereço'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]">
                <option value="shipping">Entrega</option>
                <option value="billing">Cobrança</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do endereço</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" placeholder="Ex: Casa" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Morada (Rua/Avenida)</label>
              <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nº/Porta</label>
              <input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Andar / Apartamento</label>
              <input value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Freguesia (opcional)</label>
              <input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concelho</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
              <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
              <input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} placeholder="1234-567" className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telemóvel</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827]" />
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
              <span className="text-[#6b7280]">Tornar endereço padrão</span>
            </div>
            <div className="col-span-2">
              <button onClick={saveAddress} disabled={loading} className="btn-primary w-full py-3">{editingId ? 'Salvar alterações' : 'Adicionar endereço'}</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Meus endereços</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-400">Nenhum endereço cadastrado.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="card-elegant bg-white p-6 flex items-start justify-between">
                <div>
                  <p className="text-[#111827] font-medium">{addr.name || (addr.type === 'shipping' ? 'Entrega' : 'Cobrança')} {addr.is_default ? ' • Padrão' : ''}</p>
                  <p className="text-[#6b7280]">{addr.street}, {addr.number} {addr.complement}</p>
                  <p className="text-[#6b7280]">{addr.neighborhood ? addr.neighborhood + ' - ' : ''}{addr.city}/{addr.state}</p>
                  <p className="text-[#6b7280]">CP {addr.postal_code} • {addr.country}</p>
                  {addr.phone && <p className="text-[#6b7280]">Tel: {addr.phone}</p>}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => editAddress(addr)} className="btn-primary px-4 py-2">Editar</button>
                  <button onClick={() => deleteAddress(addr.id!)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl">Remover</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
