import { EventStatus, EventPriority, TaskStatus } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const parseLocalDate = (date: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(date);
};

export const formatDate = (date: string): string => {
  return parseLocalDate(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateLong = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const getStatusLabel = (status: EventStatus): string => {
  const labels: Record<EventStatus, string> = {
    input: 'Input do Evento',
    criacao_tarefas: 'Criação de Tarefas',
    geracao_orcamento: 'Geração de Orçamento',
    aguardando_aprovacao: 'Aguardando Aprovação',
    execucao: 'Em Execução',
    pos_evento: 'Pós-Evento',
    cancelado: 'Cancelado'
  };
  return labels[status];
};

export const getStatusColor = (status: EventStatus): string => {
  const colors: Record<EventStatus, string> = {
    input: 'bg-gray-100 text-gray-700',
    criacao_tarefas: 'bg-blue-100 text-blue-700',
    geracao_orcamento: 'bg-purple-100 text-purple-700',
    aguardando_aprovacao: 'bg-yellow-100 text-yellow-700',
    execucao: 'bg-green-100 text-green-700',
    pos_evento: 'bg-teal-100 text-teal-700',
    cancelado: 'bg-red-100 text-red-700'
  };
  return colors[status];
};

export const getPriorityLabel = (priority: EventPriority): string => {
  const labels: Record<EventPriority, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente'
  };
  return labels[priority];
};

export const getPriorityColor = (priority: EventPriority): string => {
  const colors: Record<EventPriority, string> = {
    baixa: 'bg-gray-100 text-gray-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700'
  };
  return colors[priority];
};

export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada'
  };
  return labels[status];
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    pendente: 'bg-gray-100 text-gray-700',
    em_andamento: 'bg-blue-100 text-blue-700',
    concluida: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700'
  };
  return colors[status];
};

export const getDaysUntil = (date: string): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isOverdue = (date: string): boolean => {
  return getDaysUntil(date) < 0;
};

export const getLocalTodayISO = (): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Date().toLocaleDateString("en-CA", {
    timeZone,
  });
};

export const normalizeDateInput = (value: string): string | null => {
  const trimmed = value.trim();
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (isoPattern.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{8}$/.test(trimmed)) {
    const tryBuild = (year: string, month: string, day: string) => {
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      const isValid =
        parsed.getFullYear() === Number(year) &&
        parsed.getMonth() === Number(month) - 1 &&
        parsed.getDate() === Number(day);
      return isValid ? `${year}-${month}-${day}` : null;
    };

    const ddmmFirst = tryBuild(
      trimmed.slice(4, 8),
      trimmed.slice(2, 4),
      trimmed.slice(0, 2)
    );
    if (ddmmFirst) {
      return ddmmFirst;
    }

    const yyyymm = tryBuild(
      trimmed.slice(0, 4),
      trimmed.slice(4, 6),
      trimmed.slice(6, 8)
    );
    if (yyyymm) {
      return yyyymm;
    }
  }

  return null;
};

export const calculateBudgetItemTotal = (item: {
  valor_total?: number | null;
  quantidade?: number | null;
  valor_unitario?: number | null;
}): number => {
  const stored = Number(item.valor_total);
  if (!Number.isNaN(stored) && item.valor_total !== null && item.valor_total !== undefined) {
    return stored;
  }
  const qty = Number(item.quantidade ?? 0);
  const unit = Number(item.valor_unitario ?? 0);
  if (Number.isNaN(qty) || Number.isNaN(unit)) {
    return 0;
  }
  return qty * unit;
};
