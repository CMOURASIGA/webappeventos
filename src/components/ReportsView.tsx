import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  FileDown,
} from "lucide-react";
import { formatCurrency, formatDate, calculateBudgetItemTotal, getStatusLabel, getTaskStatusLabel } from "../utils/helpers";
import { useEvents } from "../hooks/useEvents";
import { useTasks } from "../hooks/useTasks";
import { useBudgetItems } from "../hooks/useBudgetItems";
import { useProfiles } from "../hooks/useProfiles";
import { useApprovals } from "../hooks/useApprovals";
import { useTeams } from "../hooks/useTeams";

export default function ReportsView() {
  const { events, loading: eventsLoading } = useEvents();
  const { tasks, loading: tasksLoading } = useTasks();
  const { items: budgetItems } = useBudgetItems();
  const { profiles, loading: profilesLoading } = useProfiles();
  const { approvals, loading: approvalsLoading } = useApprovals();
  const { teams, loading: teamsLoading } = useTeams();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const profilesMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((profile) => map.set(profile.id, profile.nome ?? profile.email));
    return map;
  }, [profiles]);

  const teamsMap = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => map.set(team.id, team.nome));
    return map;
  }, [teams]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const eventTasks = useMemo(
    () => tasks.filter((task) => task.evento_id === selectedEventId),
    [tasks, selectedEventId],
  );

  const eventBudgets = useMemo(
    () => budgetItems.filter((item) => item.evento_id === selectedEventId),
    [budgetItems, selectedEventId],
  );

  const eventApprovals = useMemo(() => {
    return approvals
      .filter((approval) => approval.evento_id === selectedEventId)
      .sort(
        (a, b) =>
          new Date(b.data_solicitacao).getTime() -
          new Date(a.data_solicitacao).getTime(),
      );
  }, [approvals, selectedEventId]);

  const latestApproval = eventApprovals[0];
  const detailedBudgetTotal = useMemo(
    () =>
      eventBudgets.reduce(
        (sum, item) => sum + calculateBudgetItemTotal(item),
        0,
      ),
    [eventBudgets],
  );
  const completedTasksCount = useMemo(
    () => eventTasks.filter((task) => task.status === "concluida").length,
    [eventTasks],
  );

  if (eventsLoading || tasksLoading || profilesLoading || approvalsLoading || teamsLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Carregando relatórios...</p>
      </div>
    );
  }

  const eventosPorStatus = {
    input: events.filter((e) => e.status === "input").length,
    criacao_tarefas: events.filter((e) => e.status === "criacao_tarefas").length,
    geracao_orcamento: events.filter((e) => e.status === "geracao_orcamento").length,
    aguardando_aprovacao: events.filter((e) => e.status === "aguardando_aprovacao").length,
    execucao: events.filter((e) => e.status === "execucao").length,
    pos_evento: events.filter((e) => e.status === "pos_evento").length,
  };

  const eventosPorTipo = events.reduce((acc, evento) => {
    acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orcamentoTotal = events
    .filter((e) => e.orcamento_aprovado)
    .reduce((sum, e) => sum + (e.orcamento_aprovado || 0), 0);

  const orcamentoPrevisto = events
    .filter((e) => e.orcamento_previsto)
    .reduce((sum, e) => sum + (e.orcamento_previsto || 0), 0);

  const totalParticipantes = events
    .filter((e) => e.participantes_esperados)
    .reduce((sum, e) => sum + (e.participantes_esperados || 0), 0);

  const tarefasStats = {
    total: tasks.length,
    concluidas: tasks.filter((t) => t.status === "concluida").length,
    emAndamento: tasks.filter((t) => t.status === "em_andamento").length,
    pendentes: tasks.filter((t) => t.status === "pendente").length,
  };

  const progressoMedio =
    tarefasStats.total > 0 ? (tarefasStats.concluidas / tarefasStats.total) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6 print-hide">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-1">Relatórios e Indicadores</h2>
          <p className="text-gray-600">Análise detalhada da gestão de eventos</p>
        </div>
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
          <p className="text-gray-900">{events.length}</p>
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
              const total = events.length || 1;
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
                const total = events.length || 1;
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
                {orcamentoPrevisto > 0
                  ? `${((orcamentoTotal / orcamentoPrevisto) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Economia de {formatCurrency(orcamentoPrevisto - orcamentoTotal)}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Custo Médio por Evento</p>
              <p className="text-gray-900">
                {formatCurrency(
                  events.filter((e) => e.orcamento_aprovado).length
                    ? orcamentoTotal / events.filter((e) => e.orcamento_aprovado).length
                    : 0,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 print-section">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h3 className="text-gray-900">Relatório detalhado por evento</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={selectedEventId ?? ""}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.titulo}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print-hide"
            >
              <FileDown className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {selectedEvent ? (
          <div className="space-y-10">
            <ReportSection
              title="Sobre o evento"
              rows={[
                {
                  label: "Cliente",
                  value:
                    selectedEvent.solicitante_id
                      ? profilesMap.get(selectedEvent.solicitante_id) ?? "Não identificado"
                      : "Não identificado",
                },
                {
                  label: "Equipe responsável",
                  value:
                    selectedEvent.equipe_id
                      ? teamsMap.get(selectedEvent.equipe_id) ?? selectedEvent.equipe_id
                      : "Não definida",
                },
                { label: "Descrição", value: selectedEvent.descricao || "Sem descrição" },
                {
                  label: "Responsável interno",
                  value:
                    selectedEvent.responsavel_id
                      ? profilesMap.get(selectedEvent.responsavel_id) ?? "Não identificado"
                      : "Não definido",
                },
                { label: "Local", value: selectedEvent.local || "Não informado" },
              ]}
            />

            <ReportSection
              title="Prazos do evento"
              rows={[
                {
                  label: "Data de início",
                  value: selectedEvent.data_inicio ? formatDate(selectedEvent.data_inicio) : "Não definida",
                },
                {
                  label: "Data de término",
                  value: selectedEvent.data_fim ? formatDate(selectedEvent.data_fim) : "Não definida",
                },
                {
                  label: "Tempo total",
                  value:
                    selectedEvent.data_inicio && selectedEvent.data_fim
                      ? `${Math.ceil(
                          (new Date(selectedEvent.data_fim).getTime() -
                            new Date(selectedEvent.data_inicio).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )} dias`
                      : "Não calculado",
                },
              ]}
            />

            <ReportSection
              title="Andamento e aprovações"
              rows={[
                { label: "Status atual", value: getStatusLabel(selectedEvent.status) },
                {
                  label: "Última decisão",
                  value: latestApproval
                    ? `${latestApproval.status === "aprovado" ? "Aprovado" : latestApproval.status === "rejeitado" ? "Rejeitado" : "Pendente"} em ${formatDate(
                        latestApproval.data_resposta ?? latestApproval.data_solicitacao,
                      )}`
                    : "Sem decisões registradas",
                },
                {
                  label: "Observação da decisão",
                  value: latestApproval?.observacoes
                    ? latestApproval.observacoes
                    : "Nenhuma observação registrada",
                },
                {
                  label: "Tarefas concluídas",
                  value: `${completedTasksCount} de ${eventTasks.length}`,
                },
              ]}
            />

            <ReportSection
              title="Volume de etapas e orçamento"
              rows={[
                { label: "Quantidade de tarefas", value: `${eventTasks.length} etapas cadastradas` },
                { label: "Itens de orçamento", value: `${eventBudgets.length} itens` },
                {
                  label: "Valor total estimado",
                  value:
                    eventBudgets.length > 0 ? formatCurrency(detailedBudgetTotal) : "Sem orçamento registrado",
                },
              ]}
            />
            {eventTasks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1">
                  Detalhamento das tarefas
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Tarefa</th>
                        <th className="px-3 py-2 text-left font-medium">Responsável</th>
                        <th className="px-3 py-2 text-left font-medium">Prazo</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventTasks.map((task) => (
                        <tr key={task.id} className="border-t border-gray-200">
                          <td className="px-3 py-2 text-gray-900">{task.titulo}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {task.responsavel_id
                              ? profilesMap.get(task.responsavel_id) ?? "Responsável não identificado"
                              : "Sem responsável"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {task.prazo ? formatDate(task.prazo) : "Sem prazo"}
                          </td>
                          <td className="px-3 py-2 text-gray-900">{getTaskStatusLabel(task.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum evento selecionado.</p>
        )}
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
              {events
                .filter((e) => e.orcamento_aprovado)
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

function ReportSection({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1">
        {title}
      </h4>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-gray-200">
                <th className="bg-gray-50 text-left text-gray-700 px-3 py-2 font-medium w-1/3">
                  {row.label}
                </th>
                <td className="px-3 py-2 text-gray-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
