import { useState, useMemo, memo } from "react";
import { Calendar, MapPin, Users, Loader2, AlertCircle, Target, Zap, Plus, ArrowRight, Search } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { getStatusLabel, getPriorityLabel, getDaysUntil } from "../../utils/helpers";

interface MobileEventsProps {
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: () => void;
}

const FilterButton = memo(({ active, label, count, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all touch-manipulation ${
      active 
        ? "bg-blue-600 text-white shadow-md scale-105" 
        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 active:scale-95"
    }`}
  >
    {label} ({count})
  </button>
));

FilterButton.displayName = "FilterButton";

const EventCard = memo(({ event, onClick }: any) => {
  const getPriorityIcon = (priority: string) => {
    if (priority === "alta") return <Zap className="w-3 h-3" />;
    if (priority === "media") return <Target className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      input: "bg-gray-400",
      criacao_tarefas: "bg-blue-500",
      geracao_orcamento: "bg-purple-500",
      aguardando_aprovacao: "bg-orange-500",
      execucao: "bg-green-500",
      pos_evento: "bg-teal-500",
      cancelado: "bg-red-500",
    };
    return colors[status] || "bg-gray-300";
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-98 touch-manipulation"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{event.tipo}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{event.titulo}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
          {getPriorityIcon(event.prioridade)}
          {getPriorityLabel(event.prioridade)}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="truncate">{new Date(event.data_inicio).toLocaleDateString("pt-BR")}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <span className="truncate">{event.local}</span>
        </div>
        {event.participantes_esperados && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>{event.participantes_esperados} participantes</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
          {getStatusLabel(event.status)}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </button>
  );
});

EventCard.displayName = "EventCard";

function MobileEvents({ onSelectEvent, onCreateEvent }: MobileEventsProps) {
  const { events, loading } = useEvents();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    let result = events;

    // Aplicar filtro de data
    if (filter === "upcoming") {
      result = result.filter((event) => getDaysUntil(event.data_inicio) >= 0);
    } else if (filter === "past") {
      result = result.filter((event) => getDaysUntil(event.data_inicio) < 0);
    }

    // Aplicar busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.titulo.toLowerCase().includes(term) ||
          event.local.toLowerCase().includes(term) ||
          event.tipo.toLowerCase().includes(term)
      );
    }

    return result;
  }, [events, filter, searchTerm]);

  const filterCounts = useMemo(() => ({
    all: events.length,
    upcoming: events.filter((e) => getDaysUntil(e.data_inicio) >= 0).length,
    past: events.filter((e) => getDaysUntil(e.data_inicio) < 0).length,
  }), [events]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar eventos..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterButton
          active={filter === "all"}
          label="Todos"
          count={filterCounts.all}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          active={filter === "upcoming"}
          label="Próximos"
          count={filterCounts.upcoming}
          onClick={() => setFilter("upcoming")}
        />
        <FilterButton
          active={filter === "past"}
          label="Passados"
          count={filterCounts.past}
          onClick={() => setFilter("past")}
        />
      </div>

      {/* Result Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{filteredEvents.length} eventos encontrados</span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-blue-600 font-semibold touch-manipulation"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Create Event Button */}
      <button
        onClick={onCreateEvent}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all touch-manipulation"
      >
        <Plus className="w-4 h-4" />
        Criar novo evento
      </button>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Carregando eventos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">
            {searchTerm ? "Nenhum evento encontrado para sua busca." : "Nenhum evento encontrado."}
          </p>
          {!searchTerm && (
            <button 
              onClick={onCreateEvent} 
              className="text-blue-600 text-sm font-semibold touch-manipulation"
            >
              Criar primeiro evento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onSelectEvent(event.id)}
            />
          ))}
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default memo(MobileEvents);