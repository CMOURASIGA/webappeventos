import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ListChecks,
  MapPin,
  Zap,
  Target,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { getDaysUntil, formatCurrency, getStatusLabel, getPriorityLabel } from "../../utils/helpers";

interface MobileDashboardProps {
  onCreateEvent: () => void;
  onSelectEvent: (eventId: string) => void;
}

export default function MobileDashboard({ onCreateEvent, onSelectEvent }: MobileDashboardProps) {
  const { events, loading: eventsLoading } = useEvents();
  const { tasks } = useTasks();
  const { items: budgetItems } = useBudgetItems();

  const upcomingEvents = events
    .filter((event) => getDaysUntil(event.data_inicio) >= 0)
    .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
    .slice(0, 3);

  const urgentTasks = tasks.filter((task) => getDaysUntil(task.prazo) <= 3 && task.status !== "concluida");
  const totalBudget = budgetItems.reduce(
    (sum, item) => sum + (Number(item.valor_total) || Number(item.valor_unitario || 0) * Number(item.quantidade || 0)),
    0,
  );

  const getPriorityIcon = (priority: string) => {
    if (priority === "alta") return <Zap className="w-3 h-3" />;
    if (priority === "media") return <Target className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Eventos ativos",
            value: events.filter((e) => e.status !== "pos_evento" && e.status !== "cancelado").length.toString(),
            gradient: "from-indigo-500 to-blue-600",
            icon: Calendar,
          },
          {
            label: "Tarefas pendentes",
            value: tasks.filter((task) => task.status !== "concluida" && task.status !== "cancelada").length.toString(),
            gradient: "from-emerald-500 to-green-500",
            icon: ListChecks,
          },
          {
            label: "Urgentes",
            value: urgentTasks.length.toString(),
            gradient: "from-orange-500 to-rose-500",
            icon: Clock,
          },
          {
            label: "Orcamento total",
            value: formatCurrency(totalBudget),
            gradient: "from-purple-500 to-fuchsia-500",
            icon: DollarSign,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-3xl p-4 text-white shadow-lg`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <card.icon className="w-5 h-5 mb-2 opacity-90" />
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs opacity-90">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/85 backdrop-blur rounded-3xl p-5 shadow-sm border border-white/40 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Acoes rapidas</p>
          <p className="text-sm text-gray-700 font-medium">Precisa iniciar um novo projeto?</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap"
        >
          Criar evento
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Proximos eventos
          </h3>
          <button
            onClick={onCreateEvent}
            className="text-xs text-blue-600 font-semibold flex items-center gap-1 active:scale-95 transition-transform px-2 py-1"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Nenhum evento agendado.</p>
            <button onClick={onCreateEvent} className="text-sm text-blue-600 font-semibold">
              Criar primeiro evento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const days = getDaysUntil(event.data_inicio);
              return (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent(event.id)}
                  className="w-full text-left bg-gradient-to-r from-white to-blue-50/30 border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-blue-200 hover:bg-blue-50/60 transition-all active:scale-95"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{event.titulo}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.local}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-white/80 rounded-full text-blue-700 font-medium shadow ml-2">
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {days <= 0 ? "Hoje" : `Em ${days} ${days === 1 ? "dia" : "dias"}`}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                      {getPriorityIcon(event.prioridade)}
                      {getPriorityLabel(event.prioridade)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Tarefas urgentes
          </h3>
          <span className="text-xs text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full font-bold">
            {urgentTasks.length}
          </span>
        </div>

        {urgentTasks.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhuma tarefa urgente pendente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {urgentTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.titulo}</p>
                  <p className="text-xs text-gray-600">Entrega em {new Date(task.prazo).toLocaleDateString("pt-BR")}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-orange-200 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
