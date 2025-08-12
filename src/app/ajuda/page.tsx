'use client';
import Link from 'next/link';

export default function AjudaPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="card-elegant p-8 bg-white">
        <h1 className="text-3xl font-semibold text-[#111827] mb-4">Central de Ajuda</h1>
        <p className="text-[#374151] mb-8">Encontre respostas rápidas e suporte para sua compra na Reliet.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/trocas-devolucoes" className="card-elegant p-6 block hover:scale-[1.01] transition">
            <h2 className="text-xl font-medium text-[#111827] mb-2">Trocas e Devoluções</h2>
            <p className="text-[#374151]">Como solicitar troca, prazos e condições.</p>
          </Link>
          <Link href="/garantia" className="card-elegant p-6 block hover:scale-[1.01] transition">
            <h2 className="text-xl font-medium text-[#111827] mb-2">Garantia</h2>
            <p className="text-[#374151]">Cobertura, limitações e como acionar.</p>
          </Link>
          <Link href="/contato" className="card-elegant p-6 block hover:scale-[1.01] transition">
            <h2 className="text-xl font-medium text-[#111827] mb-2">Contato</h2>
            <p className="text-[#374151]">Fale conosco por e‑mail ou WhatsApp.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}


