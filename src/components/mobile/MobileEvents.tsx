import { Calendar, MapPin, Users } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { getStatusLabel, getPriorityLabel } from "../../utils/helpers";

interface MobileEventsProps {
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: () => void;
}

export default function MobileEvents({ onSelectEvent, onCreateEvent }: MobileEventsProps) {
  const { events, loading } = useEvents();

  return (
    <div className="space-y-4">
      <button
        onClick={onCreateEvent}
        className="w-full bg-blue-600 text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-md"
      >
        Criar novo evento
      </button>

      {loading ? (
        <p className="text-center text-sm text-gray-500">Carregando eventos...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Nenhum evento cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <button
              key={event.id}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              onClick={() => onSelectEvent(event.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-base font-semibold text-gray-900">{event.titulo}</p>
                <span className="text-xs text-gray-500">{getPriorityLabel(event.prioridade)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(event.data_inicio).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                {event.local}
              </div>
              {event.participantes_esperados ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Users className="w-4 h-4" />
                  {event.participantes_esperados} participantes
                </div>
              ) : null}
              <span className="inline-flex mt-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {getStatusLabel(event.status)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
