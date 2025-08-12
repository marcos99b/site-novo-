'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const router = useRouter();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      console.log('✅ Usuário já logado, redirecionando...');
      router.push('/');
    }
  }, [user, router]);

  // Google login desativado neste projeto

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        // O redirecionamento será feito pelo useEffect quando o user mudar
      } else {
        await signUpWithEmail(email, password, name, phone);
        // O redirecionamento será feito pelo useEffect quando o user mudar
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert('Digite seu email primeiro');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Erro no reset de senha:', error);
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver logado, mostrar loading
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center card-elegant bg-white p-8">
          <h2 className="mt-2 text-3xl font-semibold text-[#1a1a1a]">
            {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
          </h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            {isLogin ? 'Acesse sua conta Reliet' : 'Junte-se à Reliet'}
          </p>
        </div>

        <div className="mt-2 space-y-6 card-elegant bg-white p-8">
          <div className="text-center text-sm text-[#6b7280] -mt-2">Use seu email e senha</div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-black/10 placeholder-black/50 text-[#111827] bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:z-10 sm:text-sm"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone (opcional)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-black/10 placeholder-black/50 text-[#111827] bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:z-10 sm:text-sm"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-black/10 placeholder-black/50 text-[#111827] bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-black/10 placeholder-black/50 text-[#111827] bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder={isLogin ? 'Sua senha' : 'Crie uma senha forte'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setName('');
                setPhone('');
              }}
              className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
