export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Ícone de sucesso animado */}
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        {/* Título elegante */}
        <h1 className="text-4xl font-royal font-bold text-slate-800 mb-4 tracking-[0.2px]">
          Pagamento Concluído com Sucesso! ✨
        </h1>
        
        {/* Mensagem premium */}
        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
          Parabéns! Sua compra foi processada com segurança. Você receberá um e-mail com todos os detalhes do pedido e acompanhamento da entrega.
        </p>
        
        {/* Badges de confiança */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
            ✅ Pagamento Seguro
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            🚚 Envio Premium
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
            💎 Qualidade Garantida
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="/catalogo" 
            className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-8 py-4 rounded-2xl font-royal font-bold hover:from-slate-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 tracking-[0.2px]"
          >
            Continuar Comprando
          </a>
          <a 
            href="/" 
            className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-royal font-bold hover:border-slate-400 hover:text-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 tracking-[0.2px]"
          >
            Voltar ao Início
          </a>
        </div>
        
        {/* Mensagem adicional */}
        <p className="text-sm text-slate-500 mt-8">
          Obrigado por escolher a RELIET! 🎉
        </p>
      </div>
    </div>
  );
}


