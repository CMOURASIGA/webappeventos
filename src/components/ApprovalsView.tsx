import { useMemo, useState } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import {
  formatDate,
  formatCurrency,
  calculateBudgetItemTotal,
  getStatusLabel,
  getPriorityLabel,
} from "../utils/helpers";
import { useApprovals } from "../hooks/useApprovals";
import { useEvents } from "../hooks/useEvents";
import { useProfiles } from "../hooks/useProfiles";
import { useBudgetItems } from "../hooks/useBudgetItems";
import { useTasks } from "../hooks/useTasks";
import { supabase } from "../lib/supabaseClient";
import { Approval, Event, Task, BudgetItem } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function ApprovalsView() {
  const { approvals, loading, refresh } = useApprovals();
  const { events } = useEvents();
  const { profiles } = useProfiles();
  const { items: budgetItems } = useBudgetItems();
  const { tasks } = useTasks();
  const { profile } = useAuth();

  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendentes = approvals.filter((a) => a.status === "pendente");
  const aprovadas = approvals.filter((a) => a.status === "aprovado");
  const rejeitadas = approvals.filter((a) => a.status === "rejeitado");

  const tasksByEvent = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const list = map.get(task.evento_id) ?? [];
      list.push(task);
      map.set(task.evento_id, list);
    });
    return map;
  }, [tasks]);

  const getProfileName = (id?: string | null) => {
    if (!id) return "Não informado";
    const person = profiles.find((p) => p.id === id);
    return person?.nome ?? person?.email ?? "Usuário";
  };

  const handleDecision = async (
    approval: Approval,
    decision: "aprovado" | "rejeitado",
  ) => {
    if (processingId) return;
    const confirmation = window.confirm(
      `Deseja realmente ${decision === "aprovado" ? "aprovar" : "rejeitar"} esta solicitação?`,
    );
    if (!confirmation) return;

    let observacoes = approval.observacoes ?? "";
    if (decision === "rejeitado") {
      const reason = window.prompt("Informe o motivo da rejeição:", observacoes);
      if (reason === null) return;
      observacoes = reason;
    } else {
      const note = window.prompt(
        "Deseja registrar alguma observação para esta aprovação? (opcional)",
        observacoes,
      );
      if (note === null) return;
      observacoes = note;
    }

    try {
      setProcessingId(approval.id);
      const updates = {
        status: decision,
        data_resposta: new Date().toISOString(),
        aprovador_id: profile?.id ?? null,
        observacoes,
      };

      const { error } = await supabase
        .from("aprovacoes")
        .update(updates)
        .eq("id", approval.id);
      if (error) throw error;

      if (decision === "aprovado" && approval.tipo === "evento") {
        await supabase
          .from<Event>("eventos")
          .update({ status: "execucao" })
          .eq("id", approval.evento_id);
      }

      await refresh();
      setSelectedApproval(null);
      alert("Decisão registrada com sucesso.");
    } catch (err) {
      alert("Não foi possível registrar a decisão. Tente novamente.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Carregando aprovações...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Central de Aprovações</h2>
        <p className="text-gray-600">Gerencie todas as solicitações de aprovação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pendentes"
          value={pendentes.length}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          accent="bg-yellow-100"
        />
        <StatCard
          label="Aprovadas"
          value={aprovadas.length}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          accent="bg-green-100"
        />
        <StatCard
          label="Rejeitadas"
          value={rejeitadas.length}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          accent="bg-red-100"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-gray-900 mb-3">Aprovações Pendentes</h3>
          {pendentes.length > 0 ? (
            <div className="space-y-3">
              {pendentes.map((approval) => {
                const event = events.find((e) => e.id === approval.evento_id);
                const eventBudgets = budgetItems.filter(
                  (item) => item.evento_id === approval.evento_id,
                );
                const totalBudget = eventBudgets.reduce(
                  (sum, item) => sum + calculateBudgetItemTotal(item),
                  0,
                );
                const eventTasks = tasksByEvent.get(approval.evento_id) ?? [];
                const completedTasks = eventTasks.filter((t) => t.status === "concluida").length;

                return (
                  <div
                    key={approval.id}
                    className="bg-white border border-yellow-200 rounded-lg p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="text-gray-900">
                              {event?.titulo ?? "Evento removido"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {approval.tipo === "orcamento"
                                ? "Aprovação de Orçamento"
                                : "Aprovação de Evento"}
                            </p>
                          </div>
                        </div>

                        <div className="ml-13 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <InfoBlock
                              label="Solicitante"
                              value={getProfileName(approval.solicitante_id)}
                            />
                            <InfoBlock
                              label="Data da solicitação"
                              value={formatDate(approval.data_solicitacao)}
                            />
                            <InfoBlock
                              label="Status do evento"
                              value={event ? getStatusLabel(event.status) : "Indisponível"}
                            />
                            <InfoBlock
                              label="Total do orçamento"
                              value={
                                totalBudget > 0
                                  ? formatCurrency(totalBudget)
                                  : event?.orcamento_previsto
                                    ? formatCurrency(event.orcamento_previsto)
                                    : "Não informado"
                              }
                            />
                            <InfoBlock
                              label="Tarefas concluídas"
                              value={`${completedTasks} de ${eventTasks.length}`}
                            />
                            {event?.prioridade && (
                              <InfoBlock
                                label="Prioridade"
                                value={getPriorityLabel(event.prioridade)}
                              />
                            )}
                          </div>

                          {approval.observacoes && (
                            <div>
                              <p className="text-gray-500 text-sm">Observações</p>
                              <p className="text-gray-900 text-sm">{approval.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleDecision(approval, "aprovado")}
                        disabled={processingId === approval.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleDecision(approval, "rejeitado")}
                        disabled={processingId === approval.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                      <button
                        onClick={() => setSelectedApproval(approval)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma aprovação pendente</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-gray-900 mb-3">Histórico de Aprovações</h3>
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Evento</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">
                    Solicitante
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Data</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...aprovadas, ...rejeitadas].map((approval) => {
                  const event = events.find((e) => e.id === approval.evento_id);
                  return (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{event?.titulo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {approval.tipo === "orcamento" ? "Orçamento" : "Evento"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getProfileName(approval.solicitante_id)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {approval.data_resposta
                          ? formatDate(approval.data_resposta)
                          : formatDate(approval.data_solicitacao)}
                      </td>
                      <td className="px-6 py-4">
                        {approval.status === "aprovado" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                            <XCircle className="w-3 h-3" />
                            Rejeitado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {approval.observacoes ? (
                          <span>{approval.observacoes}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedApproval && (
        <ApprovalDetailsModal
          approval={selectedApproval}
          event={events.find((e) => e.id === selectedApproval.evento_id) ?? null}
          budgets={budgetItems.filter((item) => item.evento_id === selectedApproval.evento_id)}
          tasks={tasksByEvent.get(selectedApproval.evento_id) ?? []}
          requester={getProfileName(selectedApproval.solicitante_id)}
          onClose={() => setSelectedApproval(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 ${accent} rounded-lg flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function ApprovalDetailsModal({
  approval,
  event,
  budgets,
  tasks,
  requester,
  onClose,
}: {
  approval: Approval;
  event: Event | null;
  budgets: BudgetItem[];
  tasks: Task[];
  requester: string;
  onClose: () => void;
}) {
  const totalBudget = budgets.reduce(
    (sum, item) => sum + calculateBudgetItemTotal(item),
    0,
  );
  const completedTasks = tasks.filter((t) => t.status === "concluida").length;
  const inProgressTasks = tasks.filter((t) => t.status === "em_andamento").length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase">Solicitação</p>
            <h3 className="text-gray-900 text-xl font-medium">
              {approval.tipo === "orcamento" ? "Aprovação de Orçamento" : "Aprovação de Evento"}
            </h3>
            <p className="text-sm text-gray-500">
              Solicitado por {requester} em {formatDate(approval.data_solicitacao)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Fechar
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h4 className="text-gray-900 mb-3">Resumo do Evento</h4>
            {event ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <InfoBlock label="Título" value={event.titulo} />
                <InfoBlock label="Tipo" value={event.tipo ?? "Não informado"} />
                <InfoBlock label="Local" value={event.local ?? "Não informado"} />
                <InfoBlock label="Departamento" value={event.departamento_id ?? "Não informado"} />
                <InfoBlock
                  label="Período"
                  value={
                    event.data_inicio && event.data_fim
                      ? `${formatDate(event.data_inicio)} a ${formatDate(event.data_fim)}`
                      : event.data_inicio
                        ? formatDate(event.data_inicio)
                        : "Não informado"
                  }
                />
                <InfoBlock label="Status" value={getStatusLabel(event.status)} />
                {event.descricao && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Descrição</p>
                    <p className="text-gray-900">{event.descricao}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Evento não localizado.</p>
            )}
          </section>

          <section>
            <h4 className="text-gray-900 mb-3">Orçamento</h4>
            {budgets.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Valor total solicitado</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Categoria</th>
                        <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Descrição</th>
                        <th className="text-right px-3 py-2 text-xs text-gray-500 uppercase">Qtd</th>
                        <th className="text-right px-3 py-2 text-xs text-gray-500 uppercase">Valor unit.</th>
                        <th className="text-right px-3 py-2 text-xs text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {budgets.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-gray-900">{item.categoria}</td>
                          <td className="px-3 py-2 text-gray-600">{item.descricao}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{item.quantidade}</td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {formatCurrency(Number(item.valor_unitario || 0))}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {formatCurrency(calculateBudgetItemTotal(item))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhum item de orçamento cadastrado para este evento.
              </p>
            )}
          </section>

          <section>
            <h4 className="text-gray-900 mb-3">Tarefas do Evento</h4>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <InfoBlock label="Concluídas" value={`${completedTasks}`} />
                <InfoBlock label="Em andamento" value={`${inProgressTasks}`} />
                <InfoBlock
                  label="Pendentes"
                  value={`${tasks.length - completedTasks - inProgressTasks}`}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma tarefa registrada para este evento.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
