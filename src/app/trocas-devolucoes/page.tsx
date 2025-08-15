export default function TrocasDevolucoesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-light text-slate-800 mb-6 leading-tight">
            Trocas e Devoluções
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Você pode solicitar troca ou devolução em até 7 dias após o recebimento. O produto deve estar sem uso e com etiqueta.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          <ul className="space-y-4 text-slate-700 leading-relaxed">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Prazo para solicitar:</strong> 7 dias após recebimento</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Peças devem estar:</strong> sem uso, na embalagem original</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
              <span><strong>Envie seu pedido para:</strong> <a className="text-slate-600 hover:text-slate-800 underline transition-colors" href="mailto:suporte@reliet.com">suporte@reliet.com</a></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}


