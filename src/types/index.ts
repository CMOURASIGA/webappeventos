export type EventStatus = 
  | 'input'
  | 'criacao_tarefas'
  | 'geracao_orcamento'
  | 'aguardando_aprovacao'
  | 'execucao'
  | 'pos_evento'
  | 'cancelado';

export type EventPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export interface Event {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: EventStatus;
  prioridade: EventPriority;
  responsavel: string;
  solicitante: string;
  departamento: string;
  orcamento_previsto?: number;
  orcamento_aprovado?: number;
  participantes_esperados?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  evento_id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: TaskStatus;
  prioridade: EventPriority;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  evento_id: string;
  categoria: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  fornecedor?: string;
  aprovado: boolean;
}

export interface Approval {
  id: string;
  evento_id: string;
  tipo: 'orcamento' | 'evento' | 'alteracao';
  solicitante: string;
  aprovador: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  data_solicitacao: string;
  data_resposta?: string;
}
