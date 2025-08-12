'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  total_orders: number;
  total_spent: number;
  status: string;
}

export default function PerfilPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stateLoading, setStateLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      const redirect = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [loading, user, router]);

  const loadProfile = async () => {
    try {
      // 1) Tentar carregar de customers
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (customer) {
        setProfile(customer as any);
        setFormData({
          name: (customer as any).name || '',
          phone: (customer as any).phone || ''
        });
        return;
      }

      // Se deu erro por RLS/perm, não mostrar toast ruidoso; apenas logar
      if (customerError) console.warn('customers select falhou:', customerError.message);

      // 2) Sem customer → tentar do profiles (perfil básico)
      if (user?.id) {
        const { data: profileRow, error: profileErr } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', user.id)
          .maybeSingle();

        if (profileRow) {
          const basic: UserProfile = {
            name: profileRow.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
            phone: profileRow.phone || '',
            total_orders: 0,
            total_spent: 0,
            status: 'active'
          };
          setProfile(basic);
          setFormData({ name: basic.name, phone: basic.phone || '' });
          return;
        }
        if (profileErr) console.warn('profiles select falhou:', profileErr.message);
      }

      // 3) Último fallback: criar customer mínimo (se permitido)
      if (user?.id) {
        const insert = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            total_orders: 0,
            total_spent: 0,
            status: 'active'
          })
          .select('*')
          .maybeSingle();

        if (insert && 'data' in insert && insert.data) {
          setProfile(insert.data as any);
          setFormData({
            name: (insert.data as any).name || '',
            phone: (insert.data as any).phone || ''
          });
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Evitar toast duplicado na UI
    } finally {
      setStateLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setStateLoading(true);
      
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          phone: formData.phone
        })
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Erro ao atualizar perfil');
      } else {
        toast.success('Perfil atualizado com sucesso!');
        setEditing(false);
        loadProfile();
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setStateLoading(false);
    }
  };

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

  if (stateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-royal text-4xl text-white">Meu Perfil</h1>
          <p className="text-gray-300 mt-2">Gerencie seus dados e acompanhe sua conta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-elegant bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#111827]">Informações Pessoais</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn-primary px-4 py-2"
                >
                  {editing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827] placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-black/10 rounded-lg bg-white text-[#111827] placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-black/10 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-primary flex-1 py-3 disabled:opacity-50"
                    >
                      {loading ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-[#6b7280] mb-1">Nome</div>
                    <div className="text-[#111827] text-lg">{profile?.name || 'Não informado'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7280] mb-1">Email</div>
                    <div className="text-[#111827] text-lg">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7280] mb-1">Telefone</div>
                    <div className="text-[#111827] text-lg">{profile?.phone || 'Não informado'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-elegant bg-white p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[#111827]">
                  <span className="text-[#6b7280]">Total de pedidos</span>
                  <span className="font-semibold">{profile?.total_orders || 0}</span>
                </div>
                <div className="flex justify-between text-[#111827]">
                  <span className="text-[#6b7280]">Total gasto</span>
                  <span className="font-semibold">R$ {profile?.total_spent || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6b7280]">Status</span>
                  <span className="px-2 py-1 rounded-full text-sm bg-emerald-50 text-emerald-600">
                    {profile?.status || 'Ativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-elegant bg-white p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Ações rápidas</h3>
              <div className="space-y-3">
                <a href="/pedidos" className="btn-primary block text-center py-3">Ver meus pedidos</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
