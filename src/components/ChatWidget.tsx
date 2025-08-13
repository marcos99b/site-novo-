'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { trackUserEvent } from '@/lib/supabase';

type TopicKey =
  | 'root'
  | 'shipping'
  | 'payments'
  | 'returns'
  | 'sizes'
  | 'order_status'
  | 'contact';

const topics: Record<TopicKey, { title: string; body: JSX.Element }> = {
  root: { title: 'Posso ajudar?', body: <></> },
  shipping: {
    title: 'Envio e prazos para Portugal',
    body: (
      <div className="space-y-3 text-sm text-[#111827]">
        <p>Entregamos em todo o território de Portugal continental.</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Prazo estimado: 5–9 dias úteis após a confirmação do pagamento.</li>
          <li>Receberá e‑mail com rastreio assim que o pedido for despachado.</li>
        </ul>
        <p>
          Mais detalhes em{' '}
          <Link href="/ajuda" className="underline">Central de Ajuda</Link>.
        </p>
      </div>
    ),
  },
  payments: {
    title: 'Pagamentos (Stripe)',
    body: (
      <div className="space-y-3 text-sm text-[#111827]">
        <p>Processamos pagamentos com a Stripe (checkout seguro em EUR).</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Cartão de crédito/débito: Visa, Mastercard, Amex.</li>
          <li>Apple Pay e Google Pay (quando disponíveis no dispositivo).</li>
          <li>Link by Stripe (checkout acelerado, se ativado na conta).</li>
        </ul>
        <p>Não utilizamos Pix. Para dúvidas contacte‑nos em <Link href="/contato" className="underline">Contato</Link>.</p>
      </div>
    ),
  },
  returns: {
    title: 'Trocas & Devoluções',
    body: (
      <div className="space-y-3 text-sm text-[#111827]">
        <p>Oferecemos 7 dias para trocas/devoluções a partir da receção.</p>
        <p>
          Consulte a política completa em{' '}
          <Link href="/trocas-devolucoes" className="underline">Trocas e Devoluções</Link> e a nossa{' '}
          <Link href="/garantia" className="underline">Garantia</Link>.
        </p>
      </div>
    ),
  },
  sizes: {
    title: 'Tamanhos & Medidas',
    body: (
      <div className="space-y-3 text-sm text-[#111827]">
        <p>As peças seguem a grade Europeia (PT/EU). Dicas rápidas:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Se estiver entre dois tamanhos, recomendamos o maior.</li>
          <li>Vestidos com elastano ajustam mais ao corpo.</li>
          <li>Conjuntos de alfaiataria tendem a ter caimento estruturado.</li>
        </ul>
        <p>Se precisar de ajuda específica, envie as suas medidas em <Link href="/contato" className="underline">Contato</Link>.</p>
      </div>
    ),
  },
  order_status: {
    title: 'Estado do Pedido',
    body: (
      <div className="space-y-3 text-sm text-[#111827]">
        <p>
          Para acompanhar o pedido, aceda a <Link href="/pedidos" className="underline">Meus Pedidos</Link>.
        </p>
        <p>Se tiver número de rastreio, ele também estará no e‑mail de confirmação de envio.</p>
      </div>
    ),
  },
  contact: {
    title: 'Falar com humano',
    body: (
      <div className="space-y-3 text-sm text-[#111827]">
        <p>Estamos por aqui para o que precisar.</p>
        <p>
          Envie uma mensagem em <Link href="/contato" className="underline">Contato</Link> que respondemos o mais rápido possível.
        </p>
      </div>
    ),
  },
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<TopicKey>('root');

  const options = useMemo(
    () => [
      { key: 'shipping', label: 'Envio para Portugal' },
      { key: 'payments', label: 'Pagamentos (Stripe)' },
      { key: 'returns', label: 'Trocas & Devoluções' },
      { key: 'sizes', label: 'Tamanhos & Medidas' },
      { key: 'order_status', label: 'Estado do pedido' },
      { key: 'contact', label: 'Contato humano' },
    ] as Array<{ key: TopicKey; label: string }>,
    []
  );

  useEffect(() => {
    if (!open) return;
    try {
      trackUserEvent('chat_opened', {}, typeof window !== 'undefined' ? window.location.pathname : undefined);
    } catch {
      // ignore
    }
  }, [open]);

  const handleOpenTopic = (k: TopicKey) => {
    setTopic(k);
    try {
      trackUserEvent('chat_topic', { topic: k }, typeof window !== 'undefined' ? window.location.pathname : undefined);
    } catch {}
  };

  return (
    <div className="fixed z-[60] bottom-6 right-6">
      {!open && (
        <button
          type="button"
          aria-label="Abrir chat"
          className="shadow-3d-champagne bg-white/90 backdrop-blur-md border border-black/10 rounded-full px-5 py-3 text-sm font-semibold text-[#111827] hover:scale-[1.02] transition"
          onClick={() => setOpen(true)}
        >
          Precisa de ajuda?
        </button>
      )}

      {open && (
        <div className="w-[320px] sm:w-[360px] bg-white rounded-2xl border border-black/10 shadow-3d-champagne overflow-hidden">
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <div className="font-medium text-[#111827]">Assistente Reliet</div>
            <button type="button" className="text-[#111827]/60 hover:text-[#111827] text-sm" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
          <div className="p-4 space-y-4">
            {topic === 'root' ? (
              <>
                <div className="text-sm text-[#111827]">Escolha uma opção:</div>
                <div className="grid grid-cols-1 gap-2">
                  {options.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => handleOpenTopic(o.key)}
                      className="text-left px-3 py-2 rounded-lg border border-black/10 bg-white hover:bg-[#f8fafc] text-[#111827]"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-[#111827]">{topics[topic].title}</div>
                <div>{topics[topic].body}</div>
                <div className="pt-1 flex gap-2">
                  <button type="button" className="px-3 py-2 rounded-lg border border-black/10 bg-white text-[#111827]" onClick={() => setTopic('root')}>
                    Voltar
                  </button>
                  <button type="button" className="px-3 py-2 rounded-lg border border-black/10 bg-white text-[#111827]" onClick={() => setOpen(false)}>
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


