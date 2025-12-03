import { useMemo, useState } from "react";
import {
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import type { Event as EventType, Task, TaskStatus } from "../types";
import {
  getTaskStatusColor,
  getPriorityColor,
  formatDate,
  getDaysUntil,
  getLocalTodayISO,
  normalizeDateInput,
} from "../utils/helpers";
import { useTasks } from "../hooks/useTasks";
import { useEvents } from "../hooks/useEvents";
import { useProfiles } from "../hooks/useProfiles";
import { supabase } from "../lib/supabaseClient";

export default function TasksManager() {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "todos">("todos");
  const [filterResponsavel, setFilterResponsavel] = useState("todos");
  const { tasks, loading, refresh } = useTasks();
  const { events } = useEvents();
  const { profiles } = useProfiles();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const profilesMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((profile) => {
      map.set(profile.id, profile.nome ?? profile.email);
    });
    return map;
  }, [profiles]);

  const responsaveis = useMemo(() => {
    const ids = new Set<string>();
    tasks.forEach((task) => {
      if (task.responsavel_id) ids.add(task.responsavel_id);
    });
    return Array.from(ids);
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchStatus = filterStatus === "todos" || task.status === filterStatus;
    const matchResponsavel =
      filterResponsavel === "todos" || task.responsavel_id === filterResponsavel;
    return matchStatus && matchResponsavel;
  });

  const tarefasPorStatus = {
    pendente: filteredTasks.filter((t) => t.status === "pendente").length,
    em_andamento: filteredTasks.filter((t) => t.status === "em_andamento").length,
    concluida: filteredTasks.filter((t) => t.status === "concluida").length,
    cancelada: filteredTasks.filter((t) => t.status === "cancelada").length,
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const tarefaAtual = tasks.find((t) => t.id === taskId);
    if (!tarefaAtual) return;
    try {
      setUpdatingTaskId(taskId);
      const updates: Record<string, any> = { status: newStatus };
      if (!tarefaAtual.equipe_id) {
        const eventoDaTarefa = events.find((e) => e.id === tarefaAtual.evento_id);
        if (eventoDaTarefa?.equipe_id) {
          updates.equipe_id = eventoDaTarefa.equipe_id;
        }
      }
      if (newStatus === "concluida") {
        const defaultDate = getLocalTodayISO().replace(/-/g, "");
        const input = window.prompt(
          "Informe a data de conclus?o (AAAAMMDD ou AAAA-MM-DD):",
          defaultDate,
        );
        if (!input) {
          setUpdatingTaskId(null);
          return;
        }
        const normalized = normalizeDateInput(input);
        if (!normalized) {
          alert("Formato de data inv?lido.");
          setUpdatingTaskId(null);
          return;
        }
        updates.data_conclusao = normalized;
      } else {
        updates.data_conclusao = null;
      }
      const { error } = await supabase.from("tarefas").update(updates).eq("id", taskId);
      if (error) throw error;
      await refresh();
    } catch (err) {
      alert("Erro ao atualizar tarefa.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Gestão de Tarefas</h2>
        <p className="text-gray-600">Todas as tarefas dos eventos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Pendentes" value={tarefasPorStatus.pendente} icon={<Circle className="w-5 h-5 text-gray-600" />} />
        <SummaryCard label="Em Andamento" value={tarefasPorStatus.em_andamento} icon={<Clock className="w-5 h-5 text-blue-600" />} accent="bg-blue-100" />
        <SummaryCard label="Concluídas" value={tarefasPorStatus.concluida} icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} accent="bg-green-100" />
        <SummaryCard label="Atrasadas" value={filteredTasks.filter((t) => t.status !== "concluida" && getDaysUntil(t.prazo) < 0).length} icon={<AlertCircle className="w-5 h-5 text-red-600" />} accent="bg-red-100" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "todos")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <select
              value={filterResponsavel}
              onChange={(e) => setFilterResponsavel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Responsáveis</option>
              {responsaveis.map((resp) => (
                <option key={resp} value={resp}>
                  {profilesMap.get(resp) ?? resp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {["pendente", "em_andamento", "concluida"].map((status) => (
          <TaskColumn
            key={status}
            title={
              status === "pendente"
                ? "Pendentes"
                : status === "em_andamento"
                  ? "Em Andamento"
                  : "Concluídas"
            }
            count={filteredTasks.filter((t) => t.status === status).length}
            tasks={filteredTasks.filter((t) => t.status === status)}
            events={events}
            profilesMap={profilesMap}
            updatingTaskId={updatingTaskId}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent = "bg-gray-100",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
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

function TaskColumn({
  title,
  count,
  tasks,
  events,
  profilesMap,
  updatingTaskId,
  onStatusChange,
}: {
  title: string;
  count: number;
  tasks: Task[];
  events: EventType[];
  profilesMap: Map<string, string>;
  updatingTaskId: string | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{count} tarefas</p>
      </div>
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {tasks.map((task) => {
          const evento = events.find((e) => e.id === task.evento_id);
          const diasRestantes = getDaysUntil(task.prazo);
          const isOverdue = diasRestantes < 0;
          return (
            <div
              key={task.id}
              className={`bg-white border ${
                task.status === "em_andamento"
                  ? "border-blue-200"
                  : task.status === "concluida"
                    ? "border-green-200"
                    : "border-gray-200"
              } rounded-lg p-3 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{task.titulo}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{evento?.titulo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.prioridade)}`}>
                      {task.prioridade}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      disabled={updatingTaskId === task.id}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span className="truncate">
                      {task.responsavel_id
                        ? profilesMap.get(task.responsavel_id) ?? "Responsável"
                        : "Sem responsável"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 mt-1 text-xs ${
                      isOverdue ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(task.prazo)}</span>
                    {isOverdue && <span>(Atrasada)</span>}
                    {task.data_conclusao && (
                      <span className="text-gray-500">Concluída em {formatDate(task.data_conclusao)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {count === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Nenhuma tarefa {title.toLowerCase()}</p>
        )}
      </div>
    </div>
  );
}
