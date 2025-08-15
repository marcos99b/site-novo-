'use client';
import Link from 'next/link';

export default function AjudaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-light text-slate-800 mb-6 leading-tight">
            Central de Ajuda
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Encontre respostas rápidas e suporte para sua compra na Reliet.
          </p>
        </div>

        {/* Help Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/trocas-devolucoes" className="group">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8 hover:shadow-xl hover:border-slate-300/50 transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors">
                Trocas e Devoluções
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Como solicitar troca, prazos e condições.
              </p>
            </div>
          </Link>
          
          <Link href="/garantia" className="group">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8 hover:shadow-xl hover:border-slate-300/50 transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors">
                Garantia
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Cobertura, limitações e como acionar.
              </p>
            </div>
          </Link>
          
          <Link href="/contato" className="group">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8 hover:shadow-xl hover:border-slate-300/50 transition-all duration-300 hover:scale-[1.02]">
              <h2 className="text-2xl font-semibold text-slate-800 mb-3 group-hover:text-slate-700 transition-colors">
                Contato
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Fale conosco por e‑mail ou WhatsApp.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}


