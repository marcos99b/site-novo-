'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
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
      <div className="space-y-3 text-sm text-white/90">
        <p>Entregamos em todo o território de Portugal continental.</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Prazo estimado: 5–9 dias úteis após a confirmação do pagamento.</li>
          <li>Receberá e‑mail com rastreio assim que o pedido for despachado.</li>
        </ul>
        <p>
          Mais detalhes em{' '}
          <Link href="/ajuda" className="underline text-white/80 hover:text-white">Central de Ajuda</Link>.
        </p>
      </div>
    ),
  },
  payments: {
    title: 'Pagamentos (Stripe)',
    body: (
      <div className="space-y-3 text-sm text-white/90">
        <p>Processamos pagamentos com a Stripe (checkout seguro em EUR).</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Cartão de crédito/débito: Visa, Mastercard, Amex.</li>
          <li>Apple Pay e Google Pay (quando disponíveis no dispositivo).</li>
          <li>Link by Stripe (checkout acelerado, se ativado na conta).</li>
        </ul>
        <p>Não utilizamos Pix. Para dúvidas contacte‑nos em <Link href="/contato" className="underline text-white/80 hover:text-white">Contato</Link>.</p>
      </div>
    ),
  },
  returns: {
    title: 'Trocas & Devoluções',
    body: (
      <div className="space-y-3 text-sm text-white/90">
        <p>Oferecemos 7 dias para trocas/devoluções a partir da receção.</p>
        <p>
          Consulte a política completa em{' '}
          <Link href="/trocas-devolucoes" className="underline text-white/80 hover:text-white">Trocas e Devoluções</Link> e a nossa{' '}
          <Link href="/garantia" className="underline text-white/80 hover:text-white">Garantia</Link>.
        </p>
      </div>
    ),
  },
  sizes: {
    title: 'Tamanhos & Medidas',
    body: (
      <div className="space-y-3 text-sm text-white/90">
        <p>As peças seguem a grade Europeia (PT/EU). Dicas rápidas:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Se estiver entre dois tamanhos, recomendamos o maior.</li>
          <li>Vestidos com elastano ajustam mais ao corpo.</li>
          <li>Conjuntos de alfaiataria tendem a ter caimento estruturado.</li>
        </ul>
        <p>Se precisar de ajuda específica, envie as suas medidas em <Link href="/contato" className="underline text-white/80 hover:text-white">Contato</Link>.</p>
      </div>
    ),
  },
  order_status: {
    title: 'Estado do Pedido',
    body: (
      <div className="space-y-3 text-sm text-white/90">
        <p>
          Para acompanhar o pedido, aceda a <Link href="/pedidos" className="underline text-white/80 hover:text-white">Meus Pedidos</Link>.
        </p>
        <p>Se tiver número de rastreio, ele também estará no e‑mail de confirmação de envio.</p>
      </div>
    ),
  },
  contact: {
    title: 'Falar com humano',
    body: (
      <div className="space-y-3 text-sm text-white/90">
        <p>Estamos por aqui para o que precisar.</p>
        <p>
          Envie uma mensagem em <Link href="/contato" className="underline text-white/80 hover:text-white">Contato</Link> que respondemos o mais rápido possível.
        </p>
      </div>
    ),
  },
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<TopicKey>('root');
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{sender: 'user' | 'assistant', text: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    // Adicionar mensagem do usuário ao histórico
    const newUserMessage = { sender: 'user' as const, text: userMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    
    // Simular resposta do assistente
    const assistantResponse = { sender: 'assistant' as const, text: 'Obrigado pela sua mensagem! Em breve um membro da nossa equipa entrará em contacto consigo.' };
    setChatHistory(prev => [...prev, assistantResponse]);
    
    // Limpar campo de input
    setUserMessage('');
    
    // Tracking do evento
    try {
      trackUserEvent('chat_message_sent', { message: userMessage }, typeof window !== 'undefined' ? window.location.pathname : undefined);
    } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed z-[60] bottom-6 right-6">
      {!open && (
        <button
          type="button"
          aria-label="Abrir chat"
          className="shadow-3d-champagne bg-white/95 backdrop-blur-md border border-black/10 rounded-full w-14 h-14 grid place-items-center text-[#111827] hover:scale-[1.06] transition"
          onClick={() => setOpen(true)}
        >
          {/* Emblema moderno de chat */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12c0 4.418-4.03 8-9 8-1.01 0-1.98-.144-2.88-.41L4 21l1.51-3.02C4.56 16.85 4 14.99 4 13c0-4.418 4.03-8 9-8s8 3.582 8 7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="12" r="1" fill="currentColor"/>
            <circle cx="13" cy="12" r="1" fill="currentColor"/>
            <circle cx="17" cy="12" r="1" fill="currentColor"/>
          </svg>
        </button>
      )}

      {open && (
        <div className="w-[460px] sm:w-[520px] bg-[#0f141b] rounded-2xl border border-white/10 shadow-3d-champagne overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/90 grid place-items-center text-[#0f141b] text-[11px] font-bold">R</div>
              <div className="font-medium text-white/95">Assistente Reliet</div>
            </div>
            <button type="button" className="text-white/60 hover:text-white text-sm" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[75vh] overflow-auto">
            {/* Mensagem inicial estilo bolha - ASSISTENTE */}
            <div className="max-w-[85%] bg-gradient-to-br from-[#111827] to-[#1f2937] border border-white/20 rounded-2xl rounded-tl-md p-4 text-sm text-white shadow-sm">
              <div className="font-light tracking-[0.12em] text-[#d4af37] mb-2 uppercase text-xs">Assistente Reliet</div>
              <div className="font-medium">Olá! Sou o assistente da Reliet. Como posso ajudar?</div>
            </div>

            {/* Histórico de chat */}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#caa45e]/15 border border-[#d4af37]/25 text-white' 
                    : 'bg-gradient-to-br from-white/15 to-white/5 border border-white/20 text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {topic === 'root' ? (
              <div className="flex flex-wrap gap-3">
                {options.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => handleOpenTopic(o.key)}
                    className="px-4 py-2.5 rounded-xl border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/15 to-[#caa45e]/10 text-white font-light tracking-[0.08em] text-sm hover:from-[#d4af37]/25 hover:to-[#caa45e]/20 hover:border-[#d4af37]/40 transition-all duration-200 shadow-sm"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="max-w-[85%] bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-2xl rounded-tl-md p-4 text-sm shadow-sm">
                  <div className="font-semibold mb-2 text-white text-base">{topics[topic].title}</div>
                  <div className="space-y-2">{topics[topic].body}</div>
                </div>
                <div className="flex gap-3">
                  <button type="button" className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white/90 text-sm hover:bg-white/20 transition-colors" onClick={() => setTopic('root')}>
                    Voltar
                  </button>
                  <button type="button" className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white/90 text-sm hover:bg-white/20 transition-colors" onClick={() => setOpen(false)}>
                    Fechar
                  </button>
                </div>
              </>
            )}

            {/* Campo de input para mensagem do usuário */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escreva a sua mensagem..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:border-amber-400/50 focus:bg-white/15 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/15 border border-amber-400/25 text-white rounded-xl hover:from-amber-500/30 hover:to-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


