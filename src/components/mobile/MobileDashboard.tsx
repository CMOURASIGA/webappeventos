import { Calendar, CheckCircle2, Clock, DollarSign, ListChecks, Plus } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { getDaysUntil, formatCurrency, getStatusLabel } from "../../utils/helpers";

interface MobileDashboardProps {
  onCreateEvent: () => void;
  onSelectEvent: (eventId: string) => void;
}

export default function MobileDashboard({ onCreateEvent, onSelectEvent }: MobileDashboardProps) {
  const { events, loading: eventsLoading } = useEvents();
  const { tasks } = useTasks();
  const { items: budgetItems } = useBudgetItems();

  const proxEventos = events
    .filter((event) => getDaysUntil(event.data_inicio) >= 0)
    .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
    .slice(0, 3);
  const tarefasUrgentes = tasks.filter((task) => getDaysUntil(task.prazo) <= 3 && task.status !== "concluida");
  const totalBudget = budgetItems.reduce(
    (sum, item) => sum + (Number(item.valor_total) || Number(item.valor_unitario || 0) * Number(item.quantidade || 0)),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Eventos Ativos
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {events.filter((e) => e.status !== "pos_evento" && e.status !== "cancelado").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-green-500" />
            Tarefas Pend.
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {tasks.filter((task) => task.status !== "concluida" && task.status !== "cancelada").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            Urgentes
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{tarefasUrgentes.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            Orçamento
          </div>
          <p className="text-xl font-semibold text-gray-900 mt-2">{formatCurrency(totalBudget)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Próximos eventos</h3>
          <button onClick={onCreateEvent} className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>
        {eventsLoading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : proxEventos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum evento futuro cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {proxEventos.map((event) => (
              <li
                key={event.id}
                className="p-3 rounded-xl border border-gray-100 flex justify-between items-center"
                onClick={() => onSelectEvent(event.id)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.titulo}</p>
                  <p className="text-xs text-gray-500">{new Date(event.data_inicio).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {getStatusLabel(event.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Tarefas urgentes</h3>
          <span className="text-xs text-gray-400">{tarefasUrgentes.length} itens</span>
        </div>
        {tarefasUrgentes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma tarefa urgente.</p>
        ) : (
          <ul className="space-y-3">
            {tarefasUrgentes.slice(0, 4).map((task) => (
              <li key={task.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-900">{task.titulo}</p>
                  <p className="text-xs text-gray-500">
                    Entrega em {new Date(task.prazo).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-gray-300" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
