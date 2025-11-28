import { EventStatus, EventPriority, TaskStatus } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
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
