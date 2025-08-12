'use client';
import { useState } from 'react';

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-semibold text-[#111827] mb-4">Contato</h1>
      <p className="text-[#374151] mb-6">Fale com a nossa equipa. Responderemos em poucas horas úteis.</p>
      {sent ? (
        <div className="p-4 rounded-lg bg-green-50 text-green-700">Mensagem enviada! Em breve entraremos em contacto.</div>
      ) : (
        <form onSubmit={(e)=>{e.preventDefault(); setSent(true);}} className="space-y-4">
          <div>
            <label className="block text-sm text-[#374151] mb-1">Email</label>
            <input required type="email" className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm text-[#374151] mb-1">Mensagem</label>
            <textarea required className="w-full rounded-md border border-gray-300 px-3 py-2 h-28" placeholder="Como podemos ajudar?" />
          </div>
          <button type="submit" className="btn-primary px-6 py-3">Enviar</button>
        </form>
      )}
    </div>
  );
}



