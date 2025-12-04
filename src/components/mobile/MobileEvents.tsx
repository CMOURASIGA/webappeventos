import { useState } from "react";
import { Calendar, MapPin, Users, Loader2, AlertCircle, Target, Zap, Plus, ArrowRight } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { getStatusLabel, getPriorityLabel, getDaysUntil } from "../../utils/helpers";

interface MobileEventsProps {
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: () => void;
}

export default function MobileEvents({ onSelectEvent, onCreateEvent }: MobileEventsProps) {
  const { events, loading } = useEvents();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    const days = getDaysUntil(event.data_inicio);
    if (filter === "upcoming") return days >= 0;
    return days < 0;
  });

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
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "Todos", count: events.length },
          { id: "upcoming", label: "Proximos", count: events.filter((e) => getDaysUntil(e.data_inicio) >= 0).length },
          { id: "past", label: "Passados", count: events.filter((e) => getDaysUntil(e.data_inicio) < 0).length },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as "all" | "upcoming" | "past")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === item.id ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <button
        onClick={onCreateEvent}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4" />
        Criar novo evento
      </button>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Carregando eventos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">Nenhum evento encontrado.</p>
          <button onClick={onCreateEvent} className="text-blue-600 text-sm font-semibold">
            Criar primeiro evento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className="w-full text-left bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:border-blue-200 transition-all active:scale-95"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                    <span className="text-xs text-gray-500 font-medium">{event.tipo}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{event.titulo}</h3>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                  {getPriorityIcon(event.prioridade)}
                  {getPriorityLabel(event.prioridade)}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{new Date(event.data_inicio).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>{event.local}</span>
                </div>
                {event.participantes_esperados ? (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>{event.participantes_esperados} participantes</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {getStatusLabel(event.status)}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
