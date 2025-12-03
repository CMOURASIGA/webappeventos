import { BarChart3, Calendar, CheckCircle2, DollarSign } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { getStatusLabel, formatCurrency } from "../../utils/helpers";

export default function MobileReports() {
  const { events } = useEvents();
  const { items } = useBudgetItems();

  const eventosPorStatus = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.status] = (acc[event.status] ?? 0) + 1;
    return acc;
  }, {});

  const topOrcamento = [...events]
    .sort(
      (a, b) =>
        (b.orcamento_aprovado ?? 0) - (a.orcamento_aprovado ?? 0),
    )
    .slice(0, 5);

  const totalEventos = events.length;
  const totalOrcamento = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.valor_total) || Number(item.valor_unitario || 0) * Number(item.quantidade || 0)),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <BarChart3 className="w-4 h-4" />
          Visão geral
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <p className="text-xs text-gray-500">Eventos cadastrados</p>
            <p className="text-2xl font-semibold text-gray-900">{totalEventos}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Orçamento estimado</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalOrcamento)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Eventos por status
        </h3>
        <div className="space-y-2">
          {Object.entries(eventosPorStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <span>{getStatusLabel(status as any)}</span>
              <span className="text-gray-900 font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-500" />
          Top 5 orçamentos
        </h3>
        {topOrcamento.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum orçamento registrado.</p>
        ) : (
          <ul className="space-y-3">
            {topOrcamento.map((event) => (
              <li key={event.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-900 font-medium">{event.titulo}</p>
                  <p className="text-xs text-gray-500">{event.tipo}</p>
                </div>
                <span className="text-gray-900 font-semibold">
                  {event.orcamento_aprovado ? formatCurrency(event.orcamento_aprovado) : "A definir"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Próximos passos
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Revise eventos aguardando aprovação.</li>
          <li>• Garanta tarefas concluídas antes da execução.</li>
          <li>• Atualize orçamentos com fornecedores confirmados.</li>
        </ul>
      </div>
    </div>
  );
}
