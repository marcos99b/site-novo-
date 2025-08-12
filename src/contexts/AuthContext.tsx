'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para criar lead diretamente
async function createLeadFromUser(user: User) {
  try {
    const { error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
        source: 'signup',
        status: 'new'
      })
      .single();

    if (error && !error.message.includes('duplicate key')) {
      console.error('Erro ao criar lead:', error);
    }
  } catch (error) {
    console.error('Erro ao criar lead:', error);
  }
}

// Função para criar customer diretamente
async function createCustomerFromUser(user: User) {
  try {
    const { error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
        total_orders: 0,
        total_spent: 0,
        status: 'active'
      })
      .single();

    if (error && !error.message.includes('duplicate key')) {
      console.error('Erro ao criar customer:', error);
    }
  } catch (error) {
    console.error('Erro ao criar customer:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se Supabase está configurado
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase não configurado. Sistema de autenticação desabilitado.');
      setLoading(false);
      return;
    }

    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se há uma sessão ativa, criar lead e customer se necessário
        if (session?.user) {
          console.log('✅ Usuário já logado:', session.user.email);
          // Garantir perfil mínimo sem bloquear UI
          createLeadFromUser(session.user);
          createCustomerFromUser(session.user);
        } else {
          // Sem sessão: apenas finalize loading; evitamos criar sessão anônima para não gerar loops/latência
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fallback para nunca ficar carregando infinito
    const timeoutId = setTimeout(() => setLoading(false), 2000);
    getSession().finally(() => clearTimeout(timeoutId));

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de autenticação:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Redirecionar apenas no SIGNED_IN (evitar loop em TOKEN_REFRESHED)
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Usuário logado:', session.user.email);
          // Não bloquear a UX: criar em background
          createLeadFromUser(session.user);
          createCustomerFromUser(session.user);
          toast.success(`Bem-vindo, ${session.user.user_metadata?.full_name || session.user.email}!`);
          
          // Redirecionar somente se estiver na página de login/cadastro
          if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/login' || path === '/signup') {
              window.location.href = '/';
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado');
          toast.success('Logout realizado com sucesso!');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast.error('Erro ao fazer login com Google');
        throw error;
      }
    } catch (error) {
      console.error('Erro no login Google:', error);
      toast.error('Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Tentando login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error.message);
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (msg.includes('email not confirmed')) {
          // Tentar confirmar automaticamente (via email) e logar
          try {
            const c = await fetch('/api/auth/auto-confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            if (c.ok) {
              const { error: reErr } = await supabase.auth.signInWithPassword({ email, password });
              if (!reErr) {
                toast.success('Conta confirmada automaticamente. Você está logado!');
              } else {
                toast.error('Conta confirmada, mas falha ao logar automaticamente. Tente novamente.');
              }
            } else {
              toast.error('Email não confirmado. Verifique sua caixa de entrada.');
            }
          } catch (e) {
            toast.error('Email não confirmado. Verifique sua caixa de entrada.');
          }
        } else {
          toast.error('Erro ao fazer login: ' + error.message);
        }
        throw error;
      }

      if (data.user) {
        console.log('✅ Login realizado com sucesso:', data.user.email);
        toast.success('Login realizado com sucesso!');
        // Redirecionamento ocorrerá via onAuthStateChange (SIGNED_IN)
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // Não mostrar toast aqui pois já foi mostrado acima
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, phone?: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Tentando criar conta:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
            phone: phone || null
          }
        }
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        console.error('❌ Erro ao criar conta:', error.message);
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('duplicate') ||
          msg.includes('user already')
        ) {
          toast.error('Conta já existe. Faça login.');
        } else if (msg.includes('email not confirmed')) {
          toast.error('Email não confirmado. Verifique sua caixa de entrada.');
        } else if (msg.includes('password')) {
          toast.error('Senha inválida. Use uma senha mais forte.');
        } else {
          toast.error('Erro ao criar conta: ' + error.message);
        }
        throw error;
      }

      // Criar lead e customer imediatamente após signup
      if (data.user) {
        console.log('✅ Usuário criado:', data.user.email);
        // Não bloquear a UI criando CRM; executar em background
        createLeadFromUser(data.user);
        createCustomerFromUser(data.user);
        
        // Se a confirmação de email estiver desabilitada, o usuário já está logado
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          toast.success(`Bem-vindo, ${name}! Sua conta foi criada com sucesso.`);
          // Redirecionamento ocorrerá via onAuthStateChange (SIGNED_IN)
        } else {
          // Sem sessão -> tentar auto confirm e login (no cliente) para persistir
          try {
            const resp = await fetch('/api/auth/auto-confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: data.user.id })
            });
            if (resp.ok) {
              const { error: signInErr } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (signInErr) throw signInErr;
              toast.success(`Bem-vindo, ${name}! Sua conta foi criada e você foi autenticado.`);
            } else {
              toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
            }
          } catch (e) {
            console.error('Auto-confirm falhou:', e);
            toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
          }
        }
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      // Não mostrar toast aqui pois já foi mostrado acima
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Erro ao fazer logout');
        throw error;
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase não configurado. Configure as variáveis de ambiente.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        toast.error('Erro ao enviar email de reset');
        throw error;
      }

      toast.success('Email de recuperação enviado!');
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      toast.error('Erro ao enviar email de reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
