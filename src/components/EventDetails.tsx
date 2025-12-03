import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Edit2,
  CheckCircle2,
  Plus,
  MoreVertical,
} from "lucide-react";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDate,
  formatCurrency,
  getTaskStatusLabel,
  getTaskStatusColor,
  getDaysUntil,
  getLocalTodayISO,
  normalizeDateInput,
  calculateBudgetItemTotal,
} from "../utils/helpers";
import type { Event, EventStatus, EventPriority, TaskStatus, Approval } from "../types";
import { supabase } from "../lib/supabaseClient";
import { useTasks } from "../hooks/useTasks";
import { useBudgetItems } from "../hooks/useBudgetItems";
import { useProfiles } from "../hooks/useProfiles";
import { useAuth } from "../contexts/AuthContext";
import { useDepartments } from "../hooks/useDepartments";

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
  onEdit: (eventId: string) => void;
}

export default function EventDetails({ eventId, onBack, onEdit }: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState<"geral" | "tarefas" | "orcamento" | "historico">("geral");
  const [showAddTask, setShowAddTask] = useState(false);
  const [evento, setEvento] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { tasks: tarefasEvento, refresh: refreshTasks } = useTasks(eventId);
  const {
    items: orcamentoEvento,
    loading: budgetLoading,
    refresh: refreshOrcamento,
  } = useBudgetItems(eventId);
  const { profiles } = useProfiles();
  const { departments } = useDepartments();
  const { profile } = useAuth();
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updatingEventStatus, setUpdatingEventStatus] = useState(false);
  const [taskForm, setTaskForm] = useState({
    titulo: "",
    descricao: "",
    responsavel_id: "",
    prazo: "",
    prioridade: "media" as EventPriority,
  });
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [savingBudgetItem, setSavingBudgetItem] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    categoria: "",
    descricao: "",
    quantidade: "1",
    valor_unitario: "",
    fornecedor: "",
  });
  const [eventApprovals, setEventApprovals] = useState<Approval[]>([]);

  const profilesMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((profile) => {
      map.set(profile.id, profile.nome ?? profile.email);
    });
    return map;
  }, [profiles]);

  const departmentsMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((department) => {
      map.set(department.id, department.nome);
    });
    return map;
  }, [departments]);

useEffect(() => {
  const fetchEvent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from<Event>("eventos")
        .select("*")
        .eq("id", eventId)
        .single();
      setEvento(data ?? null);
      setLoading(false);
  };
  fetchEvent();
}, [eventId]);

  useEffect(() => {
    const fetchApprovals = async () => {
      const { data } = await supabase
        .from<Approval>("aprovacoes")
        .select("*")
        .eq("evento_id", eventId)
        .order("data_solicitacao", { ascending: false });
      setEventApprovals(data ?? []);
    };
    fetchApprovals();
  }, [eventId]);

  useEffect(() => {
    if (!evento) return;
    if (
      tarefasEvento.length > 0 &&
      statusIndex(evento.status) < statusIndex("criacao_tarefas")
    ) {
      updateEventStatus("criacao_tarefas", true);
    }
  }, [tarefasEvento, evento]);

  useEffect(() => {
    if (!evento) return;
    if (
      orcamentoEvento.length > 0 &&
      statusIndex(evento.status) < statusIndex("geracao_orcamento")
    ) {
      updateEventStatus("geracao_orcamento", true);
    }
  }, [orcamentoEvento, evento]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Carregando detalhes do evento...</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Evento não encontrado</p>
      </div>
    );
  }

  const totalOrcamento = orcamentoEvento.reduce(
    (sum, item) => sum + calculateBudgetItemTotal(item),
    0,
  );
  const tarefasConcluidas = tarefasEvento.filter(
    (t) => t.status === "concluida",
  ).length;
  const progressoTarefas =
    tarefasEvento.length > 0
      ? (tarefasConcluidas / tarefasEvento.length) * 100
      : 0;
  const latestApproval = eventApprovals[0];
  const latestApprovalStyles =
    latestApproval?.status === "rejeitado"
      ? {
          container: "border-red-200 bg-red-50 text-red-800",
          emphasis: "text-red-900",
        }
      : {
          container: "border-green-200 bg-green-50 text-green-800",
          emphasis: "text-green-900",
        };

const statusOptions: EventStatus[] = [
  "input",
  "criacao_tarefas",
  "geracao_orcamento",
  "aguardando_aprovacao",
  "execucao",
  "pos_evento",
];
const statusIndex = (status: EventStatus) => statusOptions.indexOf(status);

const updateEventStatus = async (newStatus: EventStatus, silent = false) => {
  if (!evento || evento.status === newStatus) return;
  try {
    if (!silent) {
      setUpdatingEventStatus(true);
    }
    const { error } = await supabase
      .from("eventos")
      .update({ status: newStatus })
      .eq("id", evento.id);
    if (error) throw error;
    setEvento((prev) => (prev ? { ...prev, status: newStatus } : prev));
  } catch (err) {
    if (!silent) {
      alert("Erro ao atualizar status do evento.");
    }
  } finally {
    if (!silent) {
      setUpdatingEventStatus(false);
    }
  }
};

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const tarefaAtual = tarefasEvento.find((t) => t.id === taskId);
    if (!tarefaAtual) return;
    try {
      setUpdatingTaskId(taskId);
      const updates: Record<string, any> = { status: newStatus };
      if (!tarefaAtual.equipe_id && evento?.equipe_id) {
        updates.equipe_id = evento.equipe_id;
      }
      if (newStatus === "concluida") {
        const defaultDate = getLocalTodayISO().replace(/-/g, "");
        const input = window.prompt(
          "Informe a data de conclusão (AAAAMMDD ou AAAA-MM-DD):",
          defaultDate,
        );
        if (!input) {
          setUpdatingTaskId(null);
          return;
        }
        const normalized = normalizeDateInput(input);
        if (!normalized) {
          alert("Formato de data inválido.");
          setUpdatingTaskId(null);
          return;
        }
        updates.data_conclusao = normalized;
      } else {
        updates.data_conclusao = null;
      }
      const { error } = await supabase
        .from("tarefas")
        .update(updates)
        .eq("id", taskId);
      if (error) throw error;
      await refreshTasks();
    } catch (err) {
      alert("Erro ao atualizar status da tarefa.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleBudgetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!evento) return;
    if (!budgetForm.categoria.trim() || !budgetForm.descricao.trim()) {
      alert("Informe categoria e descrição.");
      return;
    }
    const quantidade = Number(budgetForm.quantidade);
    const valorUnitario = Number(
      budgetForm.valor_unitario.toString().replace(",", "."),
    );
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }
    if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
      alert("Informe um valor unitário válido.");
      return;
    }
    try {
      setSavingBudgetItem(true);
      const { error } = await supabase.from("orcamentos_itens").insert({
        evento_id: evento.id,
        categoria: budgetForm.categoria.trim(),
        descricao: budgetForm.descricao.trim(),
        quantidade,
        valor_unitario: valorUnitario,
        fornecedor: budgetForm.fornecedor.trim() || null,
        equipe_id: evento.equipe_id,
      });
      if (error) throw error;
      await refreshOrcamento();
      setBudgetForm({
        categoria: "",
        descricao: "",
        quantidade: "1",
        valor_unitario: "",
        fornecedor: "",
      });
      setShowAddBudget(false);
    } catch (err) {
      alert("Erro ao salvar item de orçamento.");
    } finally {
      setSavingBudgetItem(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-gray-900">{evento.titulo}</h2>
            <p className="text-gray-600">{evento.tipo}</p>
          </div>
        </div>
        <button
          onClick={() => onEdit(evento.id)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Editar Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Data do Evento</p>
              <p className="text-sm text-gray-900">{formatDate(evento.data_inicio)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Progresso</p>
              <p className="text-sm text-gray-900">
                {progressoTarefas.toFixed(0)}% Concluído
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Orçamento</p>
              <p className="text-sm text-gray-900">
                {totalOrcamento > 0
                  ? formatCurrency(totalOrcamento)
                  : evento.orcamento_aprovado
                    ? formatCurrency(evento.orcamento_aprovado)
                    : "A definir"}
              </p>
              {evento.orcamento_aprovado && totalOrcamento > 0 && (
                <p className="text-[11px] text-gray-500">
                  Aprovado: {formatCurrency(evento.orcamento_aprovado)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Participantes</p>
              <p className="text-sm text-gray-900">
                {evento.participantes_esperados || "A definir"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            {[
              { id: "geral", label: "Informações Gerais" },
              { id: "tarefas", label: "Tarefas", badge: tarefasEvento.length },
              { id: "orcamento", label: "Orçamento" },
              { id: "historico", label: "Histórico" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{tab.badge}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "geral" && (
            <div className="space-y-6">
              {latestApproval && latestApproval.status !== "pendente" && (
                <div
                  className={`p-4 border rounded-lg text-sm space-y-1 ${latestApprovalStyles.container}`}
                >
                  <p className="font-semibold">
                    Evento{" "}
                    {latestApproval.status === "aprovado" ? "aprovado" : "reprovado"} em{" "}
                    {formatDate(
                      latestApproval.data_resposta ?? latestApproval.data_solicitacao,
                    )}
                  </p>
                  <p>
                    Responsável:{" "}
                    {latestApproval.aprovador_id
                      ? profilesMap.get(latestApproval.aprovador_id) ??
                        "Responsável não identificado"
                      : "Responsável não identificado"}
                  </p>
                  <p className={latestApprovalStyles.emphasis}>
                    Observação:{" "}
                    {latestApproval.observacoes && latestApproval.observacoes.trim().length > 0
                      ? latestApproval.observacoes
                      : "Nenhuma observação informada."}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Status Atual</label>
                  <select
                    value={evento.status}
                    onChange={(e) => updateEventStatus(e.target.value as EventStatus)}
                    disabled={updatingEventStatus}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Prioridade</label>
                  <span className={`inline-block px-3 py-2 rounded-lg ${getPriorityColor(evento.prioridade)}`}>
                    {getPriorityLabel(evento.prioridade)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Local</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{evento.local}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Responsável</label>
                  <p className="text-gray-900">
                    {evento.responsavel_id
                      ? profilesMap.get(evento.responsavel_id) ?? "Não identificado"
                      : "Não definido"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Solicitante</label>
                  <p className="text-gray-900">
                    {evento.solicitante_id
                      ? profilesMap.get(evento.solicitante_id) ?? "Não identificado"
                      : "Não definido"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Departamento</label>
                  <p className="text-gray-900">
                    {evento.departamento_id
                      ? departmentsMap.get(evento.departamento_id) ?? "Nao identificado"
                      : "Nao definido"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Descrição</label>
                <p className="text-gray-900">{evento.descricao}</p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-gray-900 mb-4">Fluxo do Evento</h4>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {statusOptions.map((status, index) => {
                      const isCompleted = statusOptions.indexOf(evento.status) >= index;
                      const isCurrent = evento.status === status;
                      return (
                        <div key={status} className="flex-1 relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                isCompleted ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                              } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                            >
                              {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                            </div>
                            <p
                              className={`text-xs mt-2 text-center max-w-[100px] ${
                                isCompleted ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {getStatusLabel(status)}
                            </p>
                          </div>
                          {index < statusOptions.length - 1 && (
                            <div
                              className={`absolute top-5 left-1/2 w-full h-0.5 ${
                                statusOptions.indexOf(evento.status) > index
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                              style={{ zIndex: -1 }}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tarefas" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {tarefasConcluidas} de {tarefasEvento.length} tarefas concluídas
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressoTarefas}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Tarefa
                </button>
              </div>

              {showAddTask && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <h4 className="text-gray-900 mb-3">Adicionar Nova Tarefa</h4>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!evento) return;
                      if (!taskForm.titulo.trim()) {
                        alert("Informe o título da tarefa.");
                        return;
                      }
                      if (!taskForm.prazo) {
                        alert("Informe o prazo da tarefa.");
                        return;
                      }
                      try {
                        setCreatingTask(true);
                        const { error } = await supabase.from("tarefas").insert({
                          evento_id: evento.id,
                          titulo: taskForm.titulo.trim(),
                          descricao: taskForm.descricao.trim() || null,
                          responsavel_id: taskForm.responsavel_id || profile?.id || null,
                          prazo: taskForm.prazo,
                          status: "pendente",
                          prioridade: taskForm.prioridade as EventPriority,
                          equipe_id: evento.equipe_id,
                        });
                        if (error) throw error;
                        await refreshTasks();
                        if (evento && statusIndex(evento.status) < statusIndex("criacao_tarefas")) {
                          await updateEventStatus("criacao_tarefas", true);
                        }
                        setTaskForm({
                          titulo: "",
                          descricao: "",
                          responsavel_id: "",
                          prazo: "",
                          prioridade: "media" as EventPriority,
                        });
                        setShowAddTask(false);
                      } catch (err) {
                        alert("Erro ao salvar tarefa. Tente novamente.");
                      } finally {
                        setCreatingTask(false);
                      }
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Título da tarefa"
                      value={taskForm.titulo}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <textarea
                      placeholder="Descrição"
                      rows={2}
                      value={taskForm.descricao}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, descricao: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600">Responsável (opcional)</label>
                        <select
                          value={taskForm.responsavel_id}
                          onChange={(e) => setTaskForm((prev) => ({ ...prev, responsavel_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione...</option>
                          {profiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome || p.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-600">Data de entrega (prazo)</label>
                        <input
                          type="date"
                          value={taskForm.prazo}
                          onChange={(e) => setTaskForm((prev) => ({ ...prev, prazo: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Prioridade</label>
                      <select
                        value={taskForm.prioridade}
                        onChange={(e) => setTaskForm((prev) => ({ ...prev, prioridade: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={creatingTask}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {creatingTask ? "Salvando..." : "Adicionar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {tarefasEvento.map((tarefa) => {
                  const diasRestantes = getDaysUntil(tarefa.prazo);
                  const isOverdue = diasRestantes < 0;
                  return (
                    <div
                      key={tarefa.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={tarefa.status === "concluida"}
                          className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p
                                className={`text-sm ${
                                  tarefa.status === "concluida"
                                    ? "line-through text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {tarefa.titulo}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{tarefa.descricao}</p>
                            </div>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${getTaskStatusColor(tarefa.status)}`}>
                                {getTaskStatusLabel(tarefa.status)}
                              </span>
                              <select
                                value={tarefa.status}
                                onChange={(e) => handleStatusChange(tarefa.id, e.target.value as TaskStatus)}
                                disabled={updatingTaskId === tarefa.id}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="em_andamento">Em andamento</option>
                                <option value="concluida">Concluída</option>
                                <option value="cancelada">Cancelada</option>
                              </select>
                            </div>
                          <span className="text-xs text-gray-500">
                            {tarefa.responsavel_id
                              ? profilesMap.get(tarefa.responsavel_id) ?? "Responsável não identificado"
                              : "Sem responsável"}
                          </span>
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                              <Clock className="w-3 h-3" />
                              {formatDate(tarefa.prazo)}
                              {isOverdue && " (Atrasada)"}
                            </span>
                            {tarefa.data_conclusao && (
                              <span className="text-xs text-gray-500">
                                Concluída em {formatDate(tarefa.data_conclusao)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tarefasEvento.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma tarefa cadastrada para este evento</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orcamento" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-900">Total do Or?amento</p>
                  <p className="text-gray-600">{formatCurrency(totalOrcamento)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBudget(!showAddBudget)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showAddBudget ? "Cancelar" : "Novo Item"}
                </button>
              </div>

              {showAddBudget && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-gray-900 mb-3">Adicionar Item de Or?amento</h4>
                  <form className="space-y-3" onSubmit={handleBudgetSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Categoria (ex.: Espa?o, Buffet, Marketing)"
                        value={budgetForm.categoria}
                        onChange={(e) =>
                          setBudgetForm((prev) => ({ ...prev, categoria: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Fornecedor (opcional)"
                        value={budgetForm.fornecedor}
                        onChange={(e) =>
                          setBudgetForm((prev) => ({ ...prev, fornecedor: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      placeholder="Descri??o detalhada do item"
                      rows={2}
                      value={budgetForm.descricao}
                      onChange={(e) =>
                        setBudgetForm((prev) => ({ ...prev, descricao: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={budgetForm.quantidade}
                          onChange={(e) =>
                            setBudgetForm((prev) => ({ ...prev, quantidade: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Valor unit?rio</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetForm.valor_unitario}
                          onChange={(e) =>
                            setBudgetForm((prev) => ({ ...prev, valor_unitario: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingBudgetItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {savingBudgetItem ? "Salvando..." : "Adicionar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddBudget(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {budgetLoading ? (
                <div className="text-center py-8 text-gray-500">Carregando itens de or?amento...</div>
              ) : (
                <>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Categoria</th>
                          <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Descri??o</th>
                          <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Qtd</th>
                          <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Valor Unit.</th>
                          <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Total</th>
                          <th className="text-center px-4 py-3 text-xs text-gray-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orcamentoEvento.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.categoria}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <p>{item.descricao}</p>
                              {item.fornecedor && (
                                <span className="text-xs text-gray-500 block mt-1">
                                  Fornecedor: {item.fornecedor}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantidade}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                              {formatCurrency(Number(item.valor_unitario || 0))}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatCurrency(calculateBudgetItemTotal(item))}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.aprovado ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Aprovado
                                </span>
                              ) : (
                                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                  Pendente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {orcamentoEvento.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum item de or?amento cadastrado</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {activeTab === "historico" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-white"></div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">Evento criado</p>
                      <p className="text-xs text-gray-500 mt-1">
                        por{" "}
                        {evento.solicitante_id
                          ? profilesMap.get(evento.solicitante_id) ?? "Usuário"
                          : "Solicitante"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(evento.created_at)}</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-green-500 border-2 border-white"></div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">
                        Status atualizado para: {getStatusLabel(evento.status)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        por{" "}
                        {evento.responsavel_id
                          ? profilesMap.get(evento.responsavel_id) ?? "Usuário"
                          : "Responsável"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(evento.updated_at)}</p>
                    </div>
                  </div>

                  {evento.orcamento_aprovado && (
                    <div className="relative pl-10">
                      <div className="absolute left-2 w-5 h-5 rounded-full bg-purple-500 border-2 border-white"></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">Orçamento aprovado</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Valor: {formatCurrency(evento.orcamento_aprovado)}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(evento.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
