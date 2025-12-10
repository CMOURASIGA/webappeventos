import { cn } from '../../ui/utils';
import { EventStatus } from '../../../types';

interface StatusBadgeProps {
  status: EventStatus;
}

const statusStyles: Record<EventStatus, string> = {
  planejando: 'bg-blue-100 text-blue-800',
  executando: 'bg-green-100 text-green-800 animate-pulse',
  concluido: 'bg-gray-100 text-gray-800',
  cancelado: 'bg-red-100 text-red-800',
};

const statusDotStyles: Record<EventStatus, string> = {
  planejando: 'bg-blue-500',
  executando: 'bg-green-500',
  concluido: 'bg-gray-500',
  cancelado: 'bg-red-500',
};


export function StatusBadge({ status }: StatusBadgeProps) {
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', statusDotStyles[status])}></span>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {formattedStatus}
      </span>
    </div>
  );
}
