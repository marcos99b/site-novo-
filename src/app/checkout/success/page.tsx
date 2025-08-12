export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-3xl font-semibold text-white mb-3">Pagamento concluído</h1>
        <p className="text-gray-300 mb-6">Recebemos o seu pagamento com sucesso. Você receberá um e-mail com os detalhes do pedido.</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/pedidos" className="btn-primary">Ver meus pedidos</a>
          <a href="/catalogo" className="btn-secondary">Voltar ao Catálogo</a>
        </div>
      </div>
    </div>
  );
}

