import { Event, Task, BudgetItem, Approval } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    titulo: 'Congresso Nacional de Comércio 2025',
    descricao: 'Evento anual reunindo líderes empresariais do setor de comércio',
    tipo: 'Congresso',
    data_inicio: '2025-03-15',
    data_fim: '2025-03-17',
    local: 'Centro de Convenções - Brasília/DF',
    status: 'execucao',
    prioridade: 'alta',
    responsavel: 'Thereza Carolina M.',
    solicitante: 'Presidência CNC',
    departamento: 'Eventos Corporativos',
    orcamento_previsto: 450000,
    orcamento_aprovado: 420000,
    participantes_esperados: 800,
    created_at: '2024-11-01',
    updated_at: '2025-02-15'
  },
  {
    id: '2',
    titulo: 'Workshop de Inovação Digital',
    descricao: 'Capacitação sobre transformação digital no varejo',
    tipo: 'Workshop',
    data_inicio: '2025-12-10',
    data_fim: '2025-12-10',
    local: 'Auditório CNC - São Paulo/SP',
    status: 'aguardando_aprovacao',
    prioridade: 'media',
    responsavel: 'Christian Moura',
    solicitante: 'Diretoria de Tecnologia',
    departamento: 'Educação e Capacitação',
    orcamento_previsto: 35000,
    participantes_esperados: 150,
    created_at: '2025-11-15',
    updated_at: '2025-11-25'
  },
  {
    id: '3',
    titulo: 'Feira de Empreendedorismo',
    descricao: 'Feira com expositores e palestras sobre empreendedorismo',
    tipo: 'Feira',
    data_inicio: '2025-12-28',
    data_fim: '2025-12-30',
    local: 'Expo Center Norte - São Paulo/SP',
    status: 'geracao_orcamento',
    prioridade: 'alta',
    responsavel: 'Yuri de Moura Pinto',
    solicitante: 'Departamento Comercial',
    departamento: 'Fomento ao Comércio',
    orcamento_previsto: 180000,
    participantes_esperados: 2000,
    created_at: '2025-11-20',
    updated_at: '2025-11-26'
  },
  {
    id: '4',
    titulo: 'Reunião Trimestral de Diretoria',
    descricao: 'Apresentação de resultados e planejamento estratégico',
    tipo: 'Reunião',
    data_inicio: '2025-12-05',
    data_fim: '2025-12-05',
    local: 'Sala de Reuniões - Sede CNC',
    status: 'criacao_tarefas',
    prioridade: 'urgente',
    responsavel: 'Iury Teixeira Cavalcante',
    solicitante: 'Diretoria Executiva',
    departamento: 'Governança',
    orcamento_previsto: 8000,
    participantes_esperados: 25,
    created_at: '2025-11-22',
    updated_at: '2025-11-24'
  },
  {
    id: '5',
    titulo: 'Seminário de Sustentabilidade',
    descricao: 'Discussão sobre práticas sustentáveis no comércio',
    tipo: 'Seminário',
    data_inicio: '2026-01-20',
    data_fim: '2026-01-20',
    local: 'Hotel Intercontinental - Rio de Janeiro/RJ',
    status: 'input',
    prioridade: 'media',
    responsavel: 'Thereza Carolina M.',
    solicitante: 'Comitê de Sustentabilidade',
    departamento: 'Responsabilidade Social',
    participantes_esperados: 300,
    created_at: '2025-11-26',
    updated_at: '2025-11-26'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    evento_id: '1',
    titulo: 'Confirmar palestrantes principais',
    descricao: 'Entrar em contato e confirmar presença dos 5 palestrantes keynote',
    responsavel: 'Thereza Carolina M.',
    prazo: '2025-02-28',
    status: 'concluida',
    prioridade: 'alta',
    created_at: '2024-11-05'
  },
  {
    id: '2',
    evento_id: '1',
    titulo: 'Contratar empresa de catering',
    descricao: 'Selecionar e contratar fornecedor para coffee breaks e almoços',
    responsavel: 'Christian Moura',
    prazo: '2025-03-01',
    status: 'em_andamento',
    prioridade: 'alta',
    created_at: '2024-11-10'
  },
  {
    id: '3',
    evento_id: '2',
    titulo: 'Preparar material didático',
    descricao: 'Desenvolver slides e apostilas para o workshop',
    responsavel: 'Christian Moura',
    prazo: '2025-12-03',
    status: 'em_andamento',
    prioridade: 'alta',
    created_at: '2025-11-16'
  },
  {
    id: '4',
    evento_id: '3',
    titulo: 'Divulgação nas redes sociais',
    descricao: 'Criar campanha de divulgação para a feira',
    responsavel: 'Yuri de Moura Pinto',
    prazo: '2025-12-01',
    status: 'pendente',
    prioridade: 'media',
    created_at: '2025-11-21'
  },
  {
    id: '5',
    evento_id: '4',
    titulo: 'Reservar sala e equipamentos',
    descricao: 'Garantir disponibilidade da sala e projetor',
    responsavel: 'Iury Teixeira Cavalcante',
    prazo: '2025-11-30',
    status: 'em_andamento',
    prioridade: 'urgente',
    created_at: '2025-11-22'
  }
];

export const mockBudgetItems: BudgetItem[] = [
  {
    id: '1',
    evento_id: '1',
    categoria: 'Locação de Espaço',
    descricao: 'Aluguel do Centro de Convenções (3 dias)',
    quantidade: 3,
    valor_unitario: 45000,
    valor_total: 135000,
    fornecedor: 'Centro de Convenções Ulysses Guimarães',
    aprovado: true
  },
  {
    id: '2',
    evento_id: '1',
    categoria: 'Alimentação',
    descricao: 'Coffee breaks e almoços',
    quantidade: 800,
    valor_unitario: 150,
    valor_total: 120000,
    fornecedor: 'Buffet Eventos Premium',
    aprovado: true
  },
  {
    id: '3',
    evento_id: '1',
    categoria: 'Tecnologia',
    descricao: 'Sistema de som, projeção e streaming',
    quantidade: 1,
    valor_unitario: 85000,
    valor_total: 85000,
    fornecedor: 'TechEvent Soluções',
    aprovado: true
  },
  {
    id: '4',
    evento_id: '2',
    categoria: 'Material Didático',
    descricao: 'Apostilas e certificados',
    quantidade: 150,
    valor_unitario: 45,
    valor_total: 6750,
    aprovado: false
  },
  {
    id: '5',
    evento_id: '2',
    categoria: 'Equipamentos',
    descricao: 'Notebooks e projetores',
    quantidade: 1,
    valor_unitario: 12000,
    valor_total: 12000,
    aprovado: false
  }
];

export const mockApprovals: Approval[] = [
  {
    id: '1',
    evento_id: '1',
    tipo: 'orcamento',
    solicitante: 'Thereza Carolina M.',
    aprovador: 'Diretoria Financeira',
    status: 'aprovado',
    observacoes: 'Aprovado com redução de 6,7% no orçamento inicial',
    data_solicitacao: '2024-12-01',
    data_resposta: '2024-12-05'
  },
  {
    id: '2',
    evento_id: '2',
    tipo: 'orcamento',
    solicitante: 'Christian Moura',
    aprovador: 'Diretoria de Tecnologia',
    status: 'pendente',
    data_solicitacao: '2025-11-25'
  },
  {
    id: '3',
    evento_id: '3',
    tipo: 'evento',
    solicitante: 'Yuri de Moura Pinto',
    aprovador: 'Comitê Executivo',
    status: 'pendente',
    observacoes: 'Aguardando análise do comitê',
    data_solicitacao: '2025-11-26'
  }
];

export const tiposEvento = [
  'Congresso',
  'Workshop',
  'Seminário',
  'Feira',
  'Reunião',
  'Treinamento',
  'Palestra',
  'Webinar',
  'Coquetel',
  'Outros'
];

export const departamentos = [
  'Eventos Corporativos',
  'Educação e Capacitação',
  'Fomento ao Comércio',
  'Governança',
  'Responsabilidade Social',
  'Marketing e Comunicação',
  'Relações Institucionais'
];
