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

export interface Team {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
}

export interface TeamMembership {
  equipe_id: string;
  perfil_id: string;
  created_at: string;
}

export interface Department {
  id: string;
  nome: string;
  sigla?: string;
}

export interface Profile {
  id: string;
  nome: string | null;
  email: string;
  papel?: string | null;
  permissoes?: Record<string, boolean> | null;
  equipe_id?: string | null;
  departamento_id?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

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
  responsavel_id?: string | null;
  solicitante_id?: string | null;
  departamento_id?: string | null;
  equipe_id?: string | null;
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
  responsavel_id?: string | null;
  prazo: string;
  status: TaskStatus;
  prioridade: EventPriority;
  data_conclusao?: string | null;
  created_at: string;
  equipe_id?: string | null;
}

export interface BudgetItem {
  id: string;
  evento_id: string;
  categoria: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total?: number | null;
  fornecedor?: string | null;
  aprovado: boolean;
  equipe_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  evento_id: string;
  tipo: 'orcamento' | 'evento' | 'alteracao';
  solicitante_id?: string | null;
  aprovador_id?: string | null;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  data_solicitacao: string;
  data_resposta?: string;
  equipe_id?: string | null;
}
