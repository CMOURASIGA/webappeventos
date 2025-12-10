import { memo } from 'react';
import { differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MapPin, Tag } from 'lucide-react';

import { type Event, type EventStatus, type EventPriority } from '../../../types';
import { cn } from '../../ui/utils';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface EventCardProps {
  event: Event;
  onSelectEvent: (eventId: string) => void;
}

// Mapping detailed status to a simpler, display-friendly status
type SimpleStatus = 'planejando' | 'executando' | 'concluido' | 'cancelado';
const mapEventStatus = (status: EventStatus): SimpleStatus => {
  switch (status) {
    case 'execucao':
      return 'executando';
    case 'pos_evento':
      return 'concluido';
    case 'cancelado':
      return 'cancelado';
    case 'input':
    case 'criacao_tarefas':
    case 'geracao_orcamento':
    case 'aguardando_aprovacao':
    default:
      return 'planejando';
  }
};

const TimeToEvent = ({ date }: { date: string }) => {
  const now = new Date();
  const eventDate = new Date(date);
  const diffDays = differenceInDays(eventDate, now);

  let content;
  if (diffDays > 0) {
    content = `em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    content = 'hoje';
  } else {
    content = `${formatDistanceToNowStrict(eventDate, { locale: ptBR, addSuffix: true })}`;
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
      <Calendar size={14} />
      <span>{content}</span>
    </div>
  );
};

export const EventCard = memo(({ event, onSelectEvent }: EventCardProps) => {
  const simpleStatus = mapEventStatus(event.status);

  return (
    <button
      onClick={() => onSelectEvent(event.id)}
      className={cn(
        'w-full transform rounded-2xl border p-4 text-left transition-all duration-200',
        'bg-gradient-to-r from-white to-blue-50/30', // updated
        'border-gray-100 shadow-sm', // updated
        'hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md',
        'active:scale-[0.98]'
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Top Section */}
        <div className="flex items-center justify-between">
          <StatusBadge status={simpleStatus} />
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Tag size={12} />
            <span>{event.tipo}</span>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-bold text-gray-900">{event.titulo}</h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{event.local}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200/80"></div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <TimeToEvent date={event.data_inicio} />
          <PriorityBadge priority={event.prioridade} />
        </div>
      </div>
    </button>
  );
});

EventCard.displayName = 'EventCard';
