import { BarChart3, TrendingUp, Calendar, DollarSign, Users, FileDown } from 'lucide-react';
import { mockEvents, mockTasks, mockBudgetItems } from '../data/mockData';
import { formatCurrency } from '../utils/helpers';

export default function ReportsView() {
  const eventosPorStatus = {
    input: mockEvents.filter(e => e.status === 'input').length,
    criacao_tarefas: mockEvents.filter(e => e.status === 'criacao_tarefas').length,
    geracao_orcamento: mockEvents.filter(e => e.status === 'geracao_orcamento').length,
    aguardando_aprovacao: mockEvents.filter(e => e.status === 'aguardando_aprovacao').length,
    execucao: mockEvents.filter(e => e.status === 'execucao').length,
    pos_evento: mockEvents.filter(e => e.status === 'pos_evento').length
  };

  const eventosPorTipo = mockEvents.reduce((acc, evento) => {
    acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orcamentoTotal = mockEvents
    .filter(e => e.orcamento_aprovado)
    .reduce((sum, e) => sum + (e.orcamento_aprovado || 0), 0);

  const orcamentoPrevisto = mockEvents
    .filter(e => e.orcamento_previsto)
    .reduce((sum, e) => sum + (e.orcamento_previsto || 0), 0);

  const totalParticipantes = mockEvents
    .filter(e => e.participantes_esperados)
    .reduce((sum, e) => sum + (e.participantes_esperados || 0), 0);

  const tarefasStats = {
    total: mockTasks.length,
    concluidas: mockTasks.filter(t => t.status === 'concluida').length,
    emAndamento: mockTasks.filter(t => t.status === 'em_andamento').length,
    pendentes: mockTasks.filter(t => t.status === 'pendente').length
  };

  const progressoMedio = (tarefasStats.concluidas / tarefasStats.total) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-1">Relatórios e Indicadores</h2>
          <p className="text-gray-600">Análise detalhada da gestão de eventos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FileDown className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total de Eventos</p>
          <p className="text-gray-900">{mockEvents.length}</p>
          <p className="text-xs text-green-600 mt-2">+2 este mês</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Orçamento Total</p>
          <p className="text-gray-900">{formatCurrency(orcamentoTotal)}</p>
          <p className="text-xs text-gray-500 mt-2">Aprovado</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Participantes Totais</p>
          <p className="text-gray-900">{totalParticipantes.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-500 mt-2">Esperados</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Progresso Médio</p>
          <p className="text-gray-900">{progressoMedio.toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-2">Das tarefas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Eventos por Status</h3>
          <div className="space-y-3">
            {Object.entries(eventosPorStatus).map(([status, count]) => {
              const total = mockEvents.length;
              const percentage = (count / total) * 100;
              const labels: Record<string, string> = {
                input: 'Input',
                criacao_tarefas: 'Criação de Tarefas',
                geracao_orcamento: 'Geração de Orçamento',
                aguardando_aprovacao: 'Aguardando Aprovação',
                execucao: 'Em Execução',
                pos_evento: 'Pós-Evento'
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{labels[status]}</span>
                    <span className="text-sm text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Eventos por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(eventosPorTipo)
              .sort(([, a], [, b]) => b - a)
              .map(([tipo, count]) => {
                const total = mockEvents.length;
                const percentage = (count / total) * 100;
                return (
                  <div key={tipo}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{tipo}</span>
                      <span className="text-sm text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Desempenho de Tarefas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-gray-900">{tarefasStats.concluidas}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Taxa de conclusão</p>
                <p className="text-green-600">{((tarefasStats.concluidas / tarefasStats.total) * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-gray-900">{tarefasStats.emAndamento}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Percentual</p>
                <p className="text-blue-600">{((tarefasStats.emAndamento / tarefasStats.total) * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-gray-900">{tarefasStats.pendentes}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Percentual</p>
                <p className="text-gray-600">{((tarefasStats.pendentes / tarefasStats.total) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Análise Financeira</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Orçamento Aprovado</p>
              <p className="text-gray-900">{formatCurrency(orcamentoTotal)}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Orçamento Previsto</p>
              <p className="text-gray-900">{formatCurrency(orcamentoPrevisto)}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Taxa de Aprovação</p>
              <p className="text-gray-900">
                {((orcamentoTotal / orcamentoPrevisto) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Economia de {formatCurrency(orcamentoPrevisto - orcamentoTotal)}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Custo Médio por Evento</p>
              <p className="text-gray-900">
                {formatCurrency(orcamentoTotal / mockEvents.filter(e => e.orcamento_aprovado).length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Top 5 Eventos por Orçamento</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Evento</th>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Data</th>
                <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Orçamento</th>
                <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Participantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockEvents
                .filter(e => e.orcamento_aprovado)
                .sort((a, b) => (b.orcamento_aprovado || 0) - (a.orcamento_aprovado || 0))
                .slice(0, 5)
                .map((evento, index) => (
                  <tr key={evento.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{evento.titulo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{evento.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(evento.orcamento_aprovado || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {evento.participantes_esperados || '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
