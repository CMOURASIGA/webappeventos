import { memo, useMemo } from "react";
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
  ArrowRight,
} from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { getDaysUntil, formatCurrency, getStatusLabel, getPriorityLabel } from "../../utils/helpers";

interface MobileDashboardProps {
  onCreateEvent: () => void;
  onSelectEvent: (eventId: string) => void;
}

const StatCard = memo(({ card }: { card: any }) => (
  <div className={`snap-center flex-shrink-0 w-36 p-4 rounded-3xl bg-gradient-to-br ${card.gradient} text-white shadow-lg shadow-blue-900/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]`}>
    <card.icon className="w-16 h-16 absolute -right-4 -top-4 opacity-20 rotate-12" />
    <div className="relative z-10 p-2 bg-white/20 w-fit rounded-xl mb-3 backdrop-blur-sm">
      <card.icon className="w-5 h-5" />
    </div>
    <div className="relative z-10">
      <p className="text-2xl font-bold tracking-tight leading-none mb-1">{card.value}</p>
      <p className="text-xs font-medium opacity-90 leading-tight">{card.label}</p>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

const UpcomingEventRow = memo(({ event, onClick, days }: { event: any; onClick: () => void; days: number }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all touch-manipulation"
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold leading-none">
      <span className="text-xs uppercase">{new Date(event.data_inicio).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
      <span className="text-lg">{new Date(event.data_inicio).getDate()}</span>
    </div>
    
    <div className="flex-1 min-w-0 text-left">
      <h4 className="text-sm font-bold text-gray-900 truncate mb-0.5">{event.titulo}</h4>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1 truncate max-w-[120px]">
          <MapPin className="w-3 h-3" /> {event.local}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${days <= 3 ? 'bg-red-500' : 'bg-green-500'}`} />
        <span className={days <= 3 ? 'text-red-600 font-medium' : ''}>
          {days === 0 ? "Hoje" : days === 1 ? "Amanhã" : `Em ${days} dias`}
        </span>
      </div>
    </div>
    
    <ArrowRight className="w-4 h-4 text-gray-300" />
  </button>
));

UpcomingEventRow.displayName = "UpcomingEventRow";

function MobileDashboard({ onCreateEvent, onSelectEvent }: MobileDashboardProps) {
  const { events, loading: eventsLoading } = useEvents();
  const { tasks } = useTasks();
  const { items: budgetItems } = useBudgetItems();

  const stats = useMemo(() => {
    const totalBudget = budgetItems.reduce(
      (sum, item) => sum + (Number(item.valor_total) || Number(item.valor_unitario || 0) * Number(item.quantidade || 0)),
      0,
    );
    
    return [
      {
        label: "Eventos ativos",
        value: events.filter((e) => e.status !== "pos_evento" && e.status !== "cancelado").length.toString(),
        gradient: "from-blue-500 to-indigo-600",
        icon: Calendar,
      },
      {
        label: "Tarefas hoje",
        value: tasks.filter((task) => getDaysUntil(task.prazo) === 0 && task.status !== "concluida").length.toString(),
        gradient: "from-emerald-500 to-teal-600",
        icon: ListChecks,
      },
      {
        label: "Urgentes",
        value: tasks.filter((task) => getDaysUntil(task.prazo) <= 3 && task.status !== "concluida").length.toString(),
        gradient: "from-orange-500 to-red-600",
        icon: AlertCircle,
      },
      {
        label: "Budget",
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalBudget),
        gradient: "from-violet-500 to-purple-600",
        icon: DollarSign,
      },
    ];
  }, [events, tasks, budgetItems]);

  const upcomingEvents = useMemo(
    () => events
      .filter((event) => getDaysUntil(event.data_inicio) >= 0)
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
      .slice(0, 4),
    [events]
  );

  return (
    <div className="space-y-6">
      {/* Horizontal Snap Scroll Stats */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 snap-x scrollbar-hide">
        {stats.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* Seção de Próximos Eventos */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-lg font-bold text-gray-900">Próximos eventos</h3>
          <button onClick={onCreateEvent} className="text-sm font-semibold text-blue-600 active:opacity-60">
            Novo
          </button>
        </div>

        {eventsLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">Sem eventos próximos</p>
            <button onClick={onCreateEvent} className="text-blue-600 font-bold text-sm mt-2">Criar agora</button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <UpcomingEventRow
                key={event.id}
                event={event}
                days={getDaysUntil(event.data_inicio)}
                onClick={() => onSelectEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default memo(MobileDashboard);
