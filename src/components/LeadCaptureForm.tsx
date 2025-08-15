'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface LeadCaptureFormProps {
  title?: string;
  subtitle?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  errorMessage?: string;
  discount?: string;
}

export default function LeadCaptureForm({
  title = "🎉 Ganhe Desconto Exclusivo!",
  subtitle = "Inscreva-se para receber ofertas especiais",
  description = "Seja o primeiro a saber sobre nossas novas coleções e receba descontos exclusivos diretamente no seu email.",
  placeholder = "Seu melhor email",
  buttonText = "Quero o Desconto!",
  discount = "15%"
}: LeadCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category: 'Geral' })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Email registrado com sucesso! Verifique sua caixa de entrada.');
        setEmail('');
      } else {
        throw new Error('Erro ao registrar email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao registrar email. Tente novamente.');
    }
  };

  return (
    <section className="mt-16 pt-16 pb-12 sm:pt-20 sm:pb-16 bg-gradient-to-br from-[#faf9f6] via-[#f5f4f1] to-[#f0efec] border-t border-[#e8e6e0] relative overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-radial from-[#e8e6e0]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-radial from-[#d4d1c8]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#f8f7f4]/50 to-transparent" />
      </div>

      {/* Floating Tech Orbs */}
      <div className="absolute top-16 left-8 w-3 h-3 bg-[#d4d1c8]/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
      <div className="absolute top-24 right-16 w-2 h-2 bg-[#c8c5bc]/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-24 left-16 w-4 h-4 bg-[#e8e6e0]/25 rounded-full animate-ping" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4 bg-gradient-to-r from-[#d4d1c8] to-[#c8c5bc] px-5 py-2.5 rounded-full border border-[#b8b5ac]/30 shadow-lg">
            <span className="text-[#8b8574] text-sm font-medium tracking-wider">NEWSLETTER</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#8b8574] rounded-full animate-ping" />
              <div className="w-2 h-2 bg-[#8b8574] rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-[#8b8574] rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#1f1f1f] mb-4 leading-tight bg-gradient-to-r from-[#1f1f1f] via-[#2a2a2a] to-[#1f1f1f] bg-clip-text text-transparent">
            {title}
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-[#2a2a2a] mb-3">
            {subtitle}
          </p>
          
          <p className="text-sm sm:text-base lg:text-lg text-[#4a4a4a] max-w-xl mx-auto">
            {description}
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-md mx-auto">
          {/* Glow Effect */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4d1c8] via-[#c8c5bc] to-[#d4d1c8] rounded-2xl blur opacity-30" />
            
            {/* Form Card */}
            <div className="relative bg-gradient-to-br from-white via-[#fefefe] to-[#faf9f6] backdrop-blur-xl border border-[#e8e6e0]/50 rounded-2xl p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input Group */}
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#c8c5bc] to-[#b8b5ac] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={placeholder}
                      required
                      className="w-full pl-14 pr-4 py-3 bg-white/80 border-2 border-[#e8e6e0]/50 rounded-xl focus:border-[#c8c5bc] focus:ring-4 focus:ring-[#c8c5bc]/20 placeholder-[#8b8574] text-[#1f1f1f] backdrop-blur-sm group-hover:border-[#d4d1c8]/70 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-[#c8c5bc] via-[#b8b5ac] to-[#c8c5bc] hover:from-[#b8b5ac] hover:via-[#a8a59c] hover:to-[#b8b5ac] text-white py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-[#b8b5ac]/25 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {/* Button Glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d4d1c8] to-[#c8c5bc] rounded-xl blur opacity-75" />
                    
                    {/* Button Content */}
                    <div className="relative flex items-center justify-center gap-3">
                      {status === 'loading' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{buttonText}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </form>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="mt-5 p-3 bg-[#f0f9ff] text-[#0c4a6e] border border-[#7dd3fc] rounded-xl">
                  {message}
                </div>
              )}
              {status === 'error' && (
                <div className="mt-5 p-3 bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5] rounded-xl">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
