import { Calendar, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { mockEvents, mockTasks, mockApprovals } from '../data/mockData';
import { getStatusLabel, getStatusColor, formatDate, getDaysUntil } from '../utils/helpers';

interface DashboardProps {
  onViewChange: (view: string, eventId?: string) => void;
}

export default function Dashboard({ onViewChange }: DashboardProps) {
  const proximosEventos = mockEvents
    .filter(e => getDaysUntil(e.data_inicio) >= 0)
    .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
    .slice(0, 5);

  const tarefasPendentes = mockTasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada');
  const aprovacoesAguardando = mockApprovals.filter(a => a.status === 'pendente');
  
  const eventosEmExecucao = mockEvents.filter(e => e.status === 'execucao').length;
  const orcamentoTotal = mockEvents
    .filter(e => e.orcamento_aprovado)
    .reduce((sum, e) => sum + (e.orcamento_aprovado || 0), 0);

  const stats = [
    {
      label: 'Eventos Ativos',
      value: mockEvents.filter(e => e.status !== 'pos_evento' && e.status !== 'cancelado').length.toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      trend: '+2 este mês'
    },
    {
      label: 'Em Execução',
      value: eventosEmExecucao.toString(),
      icon: Clock,
      color: 'bg-green-500',
      trend: 'Em andamento'
    },
    {
      label: 'Tarefas Pendentes',
      value: tarefasPendentes.length.toString(),
      icon: AlertCircle,
      color: 'bg-orange-500',
      trend: `${tarefasPendentes.filter(t => getDaysUntil(t.prazo) < 3).length} urgentes`
    },
    {
      label: 'Orçamento Total',
      value: `R$ ${(orcamentoTotal / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'bg-purple-500',
      trend: 'Aprovado'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Dashboard</h2>
        <p className="text-gray-600">Visão geral da gestão de eventos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Próximos Eventos</h3>
            <button 
              onClick={() => onViewChange('eventos')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {proximosEventos.map((evento) => {
              const diasRestantes = getDaysUntil(evento.data_inicio);
              return (
                <div 
                  key={evento.id} 
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onViewChange('evento-detalhes', evento.id)}
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-blue-600">{new Date(evento.data_inicio).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-blue-600">{new Date(evento.data_inicio).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-gray-900">{evento.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">{evento.local}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(evento.status)}`}>
                        {getStatusLabel(evento.status)}
                      </span>
                      {diasRestantes <= 7 && diasRestantes >= 0 && (
                        <span className="text-xs text-orange-600">{diasRestantes}d restantes</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Tarefas Urgentes</h3>
              <button 
                onClick={() => onViewChange('tarefas')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {tarefasPendentes.slice(0, 4).map((tarefa) => {
                const diasRestantes = getDaysUntil(tarefa.prazo);
                const isUrgent = diasRestantes < 3;
                return (
                  <div key={tarefa.id} className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{tarefa.titulo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{tarefa.responsavel}</p>
                        <span className="text-gray-300">•</span>
                        <p className={`text-xs ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                          {formatDate(tarefa.prazo)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Aprovações Pendentes</h3>
              <button 
                onClick={() => onViewChange('aprovacoes')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {aprovacoesAguardando.map((aprovacao) => {
                const evento = mockEvents.find(e => e.id === aprovacao.evento_id);
                return (
                  <div key={aprovacao.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{evento?.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {aprovacao.tipo === 'orcamento' ? 'Aprovação de Orçamento' : 'Aprovação de Evento'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Solicitado em {formatDate(aprovacao.data_solicitacao)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Linha do Tempo de Eventos</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
          <div className="space-y-6">
            {mockEvents
              .filter(e => e.status !== 'cancelado')
              .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
              .slice(0, 6)
              .map((evento, index) => (
                <div key={evento.id} className="relative pl-10">
                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-white ${
                    evento.status === 'execucao' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div 
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => onViewChange('evento-detalhes', evento.id)}
                  >
                    <p className="text-sm text-gray-900">{evento.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(evento.data_inicio)} - {evento.local}
                    </p>
                    <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${getStatusColor(evento.status)}`}>
                      {getStatusLabel(evento.status)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
