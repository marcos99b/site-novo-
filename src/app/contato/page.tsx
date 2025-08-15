'use client';
import { useState } from 'react';

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-light text-slate-800 mb-6 leading-tight">
            Contato
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Fale com a nossa equipa. Responderemos em poucas horas úteis.
          </p>
        </div>

        {/* Form Section */}
        {sent ? (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-emerald-800 mb-2">Mensagem Enviada!</h3>
            <p className="text-emerald-700">Em breve entraremos em contacto consigo.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 placeholder-slate-400 text-slate-800 transition-all duration-300" 
                  placeholder="seu@email.com" 
                />
              </div>
              
              {/* Message Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mensagem
                </label>
                <textarea 
                  required 
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100 placeholder-slate-400 text-slate-800 resize-none transition-all duration-300" 
                  rows={6}
                  placeholder="Como podemos ajudar?" 
                />
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-white py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-slate-500/25 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}



