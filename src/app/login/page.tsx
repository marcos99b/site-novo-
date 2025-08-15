'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, Shield, Zap } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name, phone);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-slate-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-slate-300/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-slate-200/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-slate-300/40 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
      <div className="absolute top-32 right-20 w-3 h-3 bg-slate-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-5 h-5 bg-slate-200/25 rounded-full animate-ping" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header Card */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-6 bg-gradient-to-r from-slate-200 to-slate-300 px-6 py-3 rounded-full border border-slate-400/30 shadow-lg">
              <Sparkles className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 text-sm font-medium tracking-wider">RELIET ACCOUNT</span>
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-light text-slate-800 mb-4 leading-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              {isLogin ? 'Bem-vindo de volta' : 'Junte-se à Reliet'}
            </h2>
            
            <p className="text-lg text-slate-600 max-w-sm mx-auto leading-relaxed">
              {isLogin ? 'Acesse sua conta e continue sua jornada de estilo' : 'Crie sua conta e descubra o mundo da moda elegante'}
            </p>
          </div>

          {/* Main Form Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 rounded-2xl blur opacity-30" />
            
            {/* Form Card */}
            <div className="relative bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-xl border border-slate-200/50 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span>Login seguro e protegido</span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    {/* Nome */}
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Nome completo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <div className="w-6 h-6 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                            <User className="h-3 h-3 text-white" />
                          </div>
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required={!isLogin}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-14 pr-4 py-4 bg-white/80 border-2 border-slate-200/50 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 placeholder-slate-400 text-slate-800 backdrop-blur-sm group-hover:border-slate-300/70 transition-all duration-300"
                          placeholder="Seu nome completo"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="group">
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Telefone <span className="text-slate-400 font-normal">(opcional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <div className="w-6 h-6 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                            <Phone className="h-3 h-3 text-white" />
                          </div>
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-14 pr-4 py-4 bg-white/80 border-2 border-slate-200/50 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 placeholder-slate-400 text-slate-800 backdrop-blur-sm group-hover:border-slate-300/70 transition-all duration-300"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                        <Mail className="h-3 h-3 text-white" />
                      </div>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-white/80 border-2 border-slate-200/50 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 placeholder-slate-400 text-slate-800 backdrop-blur-sm group-hover:border-slate-300/70 transition-all duration-300"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                        <Lock className="h-3 h-3 text-white" />
                      </div>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-14 py-4 bg-white/80 border-2 border-slate-200/50 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 placeholder-slate-400 text-slate-800 backdrop-blur-sm group-hover:border-slate-300/70 transition-all duration-300"
                      placeholder={isLogin ? 'Sua senha' : 'Crie uma senha forte'}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full flex items-center justify-center hover:from-slate-400 hover:to-slate-500 transition-all duration-300">
                        {showPassword ? (
                          <EyeOff className="h-3 h-3 text-white" />
                        ) : (
                          <Eye className="h-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-slate-500/25 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {/* Button Glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-400 rounded-xl blur opacity-75" />
                    
                    {/* Button Content */}
                    <div className="relative flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>{isLogin ? 'Entrar na Conta' : 'Criar Conta'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </form>

              {/* Toggle Login/Register */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail('');
                    setPassword('');
                    setName('');
                    setPhone('');
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium hover:underline"
                >
                  {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
                </button>
              </div>

              {/* Back to Site */}
              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium hover:underline"
                >
                  ← Voltar para o site
                </Link>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
