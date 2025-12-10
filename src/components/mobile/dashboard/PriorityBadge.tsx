import { cn } from '../../ui/utils';
import { type EventPriority } from '../../../types';

interface PriorityBadgeProps {
  priority: EventPriority;
}

const priorityConfig: Record<EventPriority, { text: string; dotClassName: string }> = {
  baixa: {
    text: 'Baixa',
    dotClassName: 'bg-gray-500',
  },
  media: {
    text: 'Média',
    dotClassName: 'bg-yellow-500',
  },
  alta: {
    text: 'Alta',
    dotClassName: 'bg-rose-500 animate-pulse',
  },
  urgente: {
    text: 'Urgente',
    dotClassName: 'bg-orange-500 animate-pulse',
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  if (!config) return null;

  return (
    <div className='flex items-center gap-1.5'>
      <span className={cn('h-2 w-2 rounded-full', config.dotClassName)}></span>
      <span className='text-xs font-semibold uppercase tracking-wider text-gray-600'>
        {config.text}
      </span>
    </div>
  );
}
