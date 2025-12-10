import { useState, useMemo, memo } from "react";
import { Calendar, MapPin, Users, Loader2, Search, ArrowRight, Filter } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { getStatusLabel, getDaysUntil } from "../../utils/helpers";

interface MobileEventsProps {
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: () => void;
}

const FilterChip = memo(({ active, label, count, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all touch-manipulation ${
      active 
        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
        : "bg-white text-slate-600 border border-slate-200"
    }`}
  >
    {label} <span className={`ml-1 text-xs opacity-80 ${active ? "text-white" : "text-slate-400"}`}>{count}</span>
  </button>
));

FilterChip.displayName = "FilterChip";

const EventCard = memo(({ event, onClick }: any) => {
  const statusColors: Record<string, string> = {
    execucao: "bg-green-100 text-green-700",
    aguardando_aprovacao: "bg-orange-100 text-orange-700",
    cancelado: "bg-red-100 text-red-700",
  };
  const badgeClass = statusColors[event.status] || "bg-slate-100 text-slate-700";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-3xl p-5 shadow-sm border border-gray-100 active:scale-[0.98] active:bg-gray-50 transition-all touch-manipulation mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg ${badgeClass}`}>
          {getStatusLabel(event.status)}
        </span>
        <span className="text-xs text-slate-400 font-medium">{event.tipo}</span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{event.titulo}</h3>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>{new Date(event.data_inicio).toLocaleDateString("pt-BR")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="truncate">{event.local}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
         <div className="flex -space-x-2">
            {/* Fake Avatars para sensação de atividade */}
            {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">?</div>
            ))}
         </div>
         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ArrowRight className="w-4 h-4" />
         </div>
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
    if (filter === "upcoming") result = result.filter((event) => getDaysUntil(event.data_inicio) >= 0);
    else if (filter === "past") result = result.filter((event) => getDaysUntil(event.data_inicio) < 0);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e => e.titulo.toLowerCase().includes(term) || e.local.toLowerCase().includes(term));
    }
    return result;
  }, [events, filter, searchTerm]);

  const counts = useMemo(() => ({
    all: events.length,
    upcoming: events.filter((e) => getDaysUntil(e.data_inicio) >= 0).length,
    past: events.filter((e) => getDaysUntil(e.data_inicio) < 0).length,
  }), [events]);

  return (
    <div className="space-y-4">
      {/* Busca Moderna (iOS Style) */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar eventos..."
          className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-base text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* Filtros Horizontais */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        <FilterChip active={filter === "all"} label="Todos" count={counts.all} onClick={() => setFilter("all")} />
        <FilterChip active={filter === "upcoming"} label="Futuros" count={counts.upcoming} onClick={() => setFilter("upcoming")} />
        <FilterChip active={filter === "past"} label="Histórico" count={counts.past} onClick={() => setFilter("past")} />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="py-12 text-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" /></div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 opacity-60">
           <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
           <p className="text-slate-500">Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className="pb-4">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} onClick={() => onSelectEvent(event.id)} />
          ))}
        </div>
      )}
      
       <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default memo(MobileEvents);
