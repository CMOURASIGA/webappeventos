import { Calendar, CheckCircle2, DollarSign, TrendingUp, Target } from "lucide-react";
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
    .sort((a, b) => (b.orcamento_aprovado ?? 0) - (a.orcamento_aprovado ?? 0))
    .slice(0, 5);

  const totalEventos = events.length;
  const totalOrcamento = items.reduce(
    (sum, item) => sum + (Number(item.valor_total) || Number(item.valor_unitario || 0) * Number(item.quantidade || 0)),
    0,
  );

  const eventosAtivos = events.filter((e) => e.status !== "pos_evento" && e.status !== "cancelado").length;

  const statusColors: Record<string, string> = {
    input: "bg-gray-400",
    criacao_tarefas: "bg-blue-500",
    geracao_orcamento: "bg-purple-500",
    aguardando_aprovacao: "bg-orange-500",
    execucao: "bg-green-500",
    pos_evento: "bg-teal-500",
    cancelado: "bg-red-500",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-4 text-white shadow-lg">
          <Target className="w-5 h-5 mb-2 opacity-90" />
          <p className="text-3xl font-bold mb-1">{totalEventos}</p>
          <p className="text-xs opacity-90">Total de eventos</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-3xl p-4 text-white shadow-lg">
          <DollarSign className="w-5 h-5 mb-2 opacity-90" />
          <p className="text-xl font-bold mb-1">{formatCurrency(totalOrcamento)}</p>
          <p className="text-xs opacity-90">Orcamento total</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-4 text-white shadow-lg">
          <TrendingUp className="w-5 h-5 mb-2 opacity-90" />
          <p className="text-3xl font-bold mb-1">{eventosAtivos}</p>
          <p className="text-xs opacity-90">Eventos ativos</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-4 text-white shadow-lg">
          <CheckCircle2 className="w-5 h-5 mb-2 opacity-90" />
          <p className="text-3xl font-bold mb-1">{events.filter((e) => e.status === "pos_evento").length}</p>
          <p className="text-xs opacity-90">Concluidos</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Eventos por status
        </h3>
        {Object.keys(eventosPorStatus).length === 0 ? (
          <p className="text-center text-sm text-gray-500">Nenhum evento cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(eventosPorStatus).map(([status, count]) => {
              const color = statusColors[status] || "bg-gray-300";
              const percentage = totalEventos > 0 ? Math.round((count / totalEventos) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{getStatusLabel(status as any)}</span>
                    <span className="text-gray-900 font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-500" />
          Top 5 orcamentos
        </h3>
        {topOrcamento.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Nenhum orcamento registrado.</p>
        ) : (
          <ul className="space-y-3">
            {topOrcamento.map((event, index) => (
              <li
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-purple-50/40 border border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{event.titulo}</p>
                  <p className="text-xs text-gray-500">{event.tipo}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {event.orcamento_aprovado ? formatCurrency(event.orcamento_aprovado) : "A definir"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-5 border border-green-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Proximos passos
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          {[
            "Revise eventos aguardando aprovacao",
            "Garanta que tarefas estejam concluidas antes da execucao",
            "Atualize orcamentos com fornecedores confirmados",
            "Monitore o status dos eventos em andamento",
          ].map((tip, index) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="text-green-600 font-bold">-</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
