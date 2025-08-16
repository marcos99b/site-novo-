'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
// Remover tracking para performance máxima
// import { trackUserEvent } from '@/lib/supabase';

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
      <div className="space-y-3 text-sm text-gray-700">
        <p>Entregamos em todo o território de Portugal continental.</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Prazo estimado: 5–9 dias úteis após a confirmação do pagamento.</li>
          <li>Receberá e‑mail com rastreio assim que o pedido for despachado.</li>
        </ul>
        <p>
          Mais detalhes em{' '}
          <Link href="/ajuda" className="underline text-blue-600 hover:text-blue-800">Central de Ajuda</Link>.
        </p>
      </div>
    ),
  },
  payments: {
    title: 'Pagamentos (Stripe)',
    body: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Processamos pagamentos com a Stripe (checkout seguro em EUR).</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Cartão de crédito/débito: Visa, Mastercard, Amex.</li>
          <li>Apple Pay e Google Pay (quando disponíveis no dispositivo).</li>
          <li>Link by Stripe (checkout acelerado, se ativado na conta).</li>
        </ul>
        <p>Não utilizamos Pix. Para dúvidas contacte‑nos em <Link href="/contato" className="underline text-blue-600 hover:text-blue-800">Contato</Link>.</p>
      </div>
    ),
  },
  returns: {
    title: 'Trocas & Devoluções',
    body: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Oferecemos 7 dias para trocas/devoluções a partir da receção.</p>
        <p>
          Consulte a política completa em{' '}
          <Link href="/trocas-devolucoes" className="underline text-blue-600 hover:text-blue-800">Trocas e Devoluções</Link> e a nossa{' '}
          <Link href="/garantia" className="underline text-blue-600 hover:text-blue-800">Garantia</Link>.
        </p>
      </div>
    ),
  },
  sizes: {
    title: 'Tamanhos & Medidas',
    body: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>As peças seguem a grade Europeia (PT/EU). Dicas rápidas:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Se estiver entre dois tamanhos, recomendamos o maior.</li>
          <li>Vestidos com elastano ajustam mais ao corpo.</li>
          <li>Conjuntos de alfaiataria tendem a ter caimento estruturado.</li>
        </ul>
        <p>Se precisar de ajuda específica, envie as suas medidas em <Link href="/contato" className="underline text-blue-600 hover:text-blue-800">Contato</Link>.</p>
      </div>
    ),
  },
  order_status: {
    title: 'Estado do Pedido',
    body: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          Para acompanhar o pedido, aceda a <Link href="/pedidos" className="underline text-blue-600 hover:text-blue-800">Meus Pedidos</Link>.
        </p>
        <p>Se tiver número de rastreio, ele também estará no e‑mail de confirmação de envio.</p>
      </div>
    ),
  },
  contact: {
    title: 'Falar com humano',
    body: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Estamos por aqui para o que precisar.</p>
        <p>
          Envie uma mensagem em <Link href="/contato" className="underline text-blue-600 hover:text-blue-800">Contato</Link> que respondemos o mais rápido possível.
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
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () => [
      { key: 'shipping', label: '🚚 Envio para Portugal', icon: '🚚' },
      { key: 'payments', label: '💳 Pagamentos (Stripe)', icon: '💳' },
      { key: 'returns', label: '🔄 Trocas & Devoluções', icon: '🔄' },
      { key: 'sizes', label: '📏 Tamanhos & Medidas', icon: '📏' },
      { key: 'order_status', label: '📦 Estado do pedido', icon: '📦' },
      { key: 'contact', label: '👥 Contato humano', icon: '👥' },
    ] as Array<{ key: TopicKey; label: string; icon: string }>,
    []
  );

  useEffect(() => {
    if (!open) return;
    try {
      // Remover tracking para performance máxima
      // trackUserEvent('chat_opened', {}, typeof window !== 'undefined' ? window.location.pathname : undefined);
    } catch {
      // ignore
    }
  }, [open]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleOpenTopic = (k: TopicKey) => {
    setTopic(k);
    try {
              // Remover tracking para performance máxima
        // trackUserEvent('chat_topic', { topic: k }, typeof window !== 'undefined' ? window.location.pathname : undefined);
    } catch {}
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Adicionar mensagem do usuário ao histórico
    const newUserMessage = { sender: 'user' as const, text: userMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    
    // Simular digitação do assistente
    setIsTyping(true);
    
    // Simular resposta do assistente com delay
    setTimeout(() => {
      setIsTyping(false);
      const assistantResponse = { sender: 'assistant' as const, text: 'Obrigado pela sua mensagem! Em breve um membro da nossa equipa entrará em contacto consigo.' };
      setChatHistory(prev => [...prev, assistantResponse]);
    }, 1500);
    
    // Limpar campo de input
    setUserMessage('');
    
    // Tracking do evento
    try {
              // Remover tracking para performance máxima
        // trackUserEvent('chat_message_sent', { message: userMessage }, typeof window !== 'undefined' ? window.location.pathname : undefined);
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
          className="group relative shadow-2xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border-0 rounded-full w-16 h-16 grid place-items-center text-white hover:scale-110 transition-all duration-300 transform hover:rotate-3"
          onClick={() => setOpen(true)}
        >
          {/* Efeito de brilho */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          
          {/* Emblema moderno de chat */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-300">
            <path d="M21 12c0 4.418-4.03 8-9 8-1.01 0-1.98-.144-2.88-.41L4 21l1.51-3.02C4.56 16.85 4 14.99 4 13c0-4.418 4.03-8 9-8s8 3.582 8 7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="12" r="1" fill="currentColor"/>
            <circle cx="13" cy="12" r="1" fill="currentColor"/>
            <circle cx="17" cy="12" r="1" fill="currentColor"/>
          </svg>
          
          {/* Indicador de notificação */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
        </button>
      )}

      {open && (
        <div className="w-[90vw] max-w-[460px] sm:w-[520px] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden animate-slide-up">
          {/* Header sofisticado */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center">
                  <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12c0 4.418-4.03 8-9 8-1.01 0-1.98-.144-2.88-.41L4 21l1.51-3.02C4.56 16.85 4 14.99 4 13c0-4.418 4.03-8 9-8s8 3.582 8 7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-base sm:text-lg">Assistente Reliet</div>
                  <div className="text-slate-200 text-xs sm:text-sm">Online • Resposta em segundos</div>
                </div>
              </div>
              <button 
                type="button" 
                className="text-white/80 hover:text-white p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors" 
                onClick={() => setOpen(false)}
              >
                <svg width="18" height="18" className="sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conteúdo do chat */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[60vh] sm:max-h-[75vh] overflow-auto bg-gray-50">
            {/* Mensagem inicial estilo bolha - ASSISTENTE */}
            <div className="flex justify-start">
              <div className="max-w-[90%] sm:max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-tl-md p-3 sm:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 grid place-items-center">
                    <svg width="10" height="10" className="sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">Assistente Reliet</div>
                </div>
                <div className="text-gray-700 text-sm sm:text-base">Olá! Sou o assistente da Reliet. Como posso ajudar?</div>
              </div>
            </div>

            {/* Histórico de chat */}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[75%] p-3 sm:p-4 rounded-2xl text-sm sm:text-base ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg' 
                    : 'bg-white border border-gray-200 text-gray-700 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[90%] sm:max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-tl-md p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 grid place-items-center">
                      <svg width="10" height="10" className="sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {topic === 'root' ? (
              <div className="space-y-3">
                <div className="text-xs sm:text-sm text-gray-500 text-center">Escolha uma opção ou escreva sua mensagem:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {options.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => handleOpenTopic(o.key)}
                      className="p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-slate-400 hover:shadow-md text-left transition-all duration-200 group"
                    >
                      <div className="text-xl sm:text-2xl mb-2">{o.icon}</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-slate-600">{o.label.replace(o.icon + ' ', '')}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-start">
                  <div className="max-w-[90%] sm:max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-tl-md p-3 sm:p-4 shadow-sm">
                    <div className="font-semibold mb-3 text-gray-800 text-sm sm:text-base">{topics[topic].title}</div>
                    <div className="space-y-2 text-sm sm:text-base">{topics[topic].body}</div>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button 
                    type="button" 
                    className="px-3 sm:px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs sm:text-sm hover:bg-gray-50 transition-colors" 
                    onClick={() => setTopic('root')}
                  >
                    ← Voltar
                  </button>
                  <button 
                    type="button" 
                    className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs sm:text-sm hover:from-slate-800 hover:to-slate-900 transition-all duration-200" 
                    onClick={() => setOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}

            {/* Campo de input para mensagem do usuário */}
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <div className="flex gap-2 sm:gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escreva a sua mensagem..."
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || isTyping}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2 text-center">
                💡 Dica: Pode fazer perguntas específicas ou escolher um dos tópicos acima
              </div>
            </div>
            
            {/* Referência para scroll automático */}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}


