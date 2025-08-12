export default function TrocasDevolucoesPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="card-elegant p-8 bg-white">
        <h1 className="text-3xl font-semibold text-[#111827] mb-4">Trocas e Devoluções</h1>
        <p className="text-[#374151] mb-6">Você pode solicitar troca ou devolução em até 7 dias após o recebimento. O produto deve estar sem uso e com etiqueta.</p>
        <ul className="list-disc pl-6 space-y-2 text-[#374151]">
          <li>Prazo para solicitar: 7 dias após recebimento</li>
          <li>Peças devem estar sem uso, na embalagem original</li>
          <li>Envie seu pedido para <a className="underline" href="mailto:suporte@reliet.com">suporte@reliet.com</a></li>
        </ul>
      </div>
    </div>
  );
}


