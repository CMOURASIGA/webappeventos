import { useEffect, useMemo, useState, memo } from "react";
import { Calendar, MapPin, Users, DollarSign, CheckCircle2, Edit3, ClipboardList, Inbox, Clock, AlertCircle } from "lucide-react";
import type { Event, TaskStatus, EventStatus } from "../../types";
import { supabase } from "../../lib/supabaseClient";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { useProfiles } from "../../hooks/useProfiles";
import { formatDate, getPriorityLabel, getStatusLabel, calculateBudgetItemTotal, formatCurrency } from "../../utils/helpers";

interface MobileEventDetailsProps {
  eventId: string;
  onEdit: (eventId: string) => void;
}

const InfoCard = memo(({ icon: Icon, label, value, color = "text-gray-600" }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
    <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 font-semibold truncate">{value}</p>
    </div>
  </div>
));

InfoCard.displayName = "InfoCard";

const TaskCard = memo(({ task, onStatusChange, updating }: any) => (
  <li className="border border-gray-100 rounded-xl p-3 bg-white">
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 mb-1">{task.titulo}</p>
        <p className="text-xs text-gray-500">
          Entrega em {formatDate(task.prazo)}
          {task.data_conclusao && ` • Concluída em ${formatDate(task.data_conclusao)}`}
        </p>
      </div>
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
        disabled={updating}
        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 touch-manipulation"
      >
        <option value="pendente">Pendente</option>
        <option value="em_andamento">Em andamento</option>
        <option value="concluida">Concluída</option>
        <option value="cancelada">Cancelada</option>
      </select>
    </div>
  </li>
));

TaskCard.displayName = "TaskCard";

const BudgetItem = memo(({ item }: any) => (
  <li className="flex items-center justify-between text-sm p-3 rounded-xl bg-gray-50 border border-gray-100">
    <div className="flex-1 min-w-0">
      <p className="text-gray-900 font-semibold truncate">{item.descricao}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-gray-500">{item.categoria}</p>
        {item.fornecedor && (
          <>
            <span className="text-gray-300">•</span>
            <p className="text-xs text-gray-500 truncate">{item.fornecedor}</p>
          </>
        )}
      </div>
    </div>
    <span className="text-gray-900 font-bold ml-3 flex-shrink-0">
      {formatCurrency(calculateBudgetItemTotal(item))}
    </span>
  </li>
));

BudgetItem.displayName = "BudgetItem";

const FlowStep = memo(({ status, current, label }: any) => {
  const active = status === current || status === "pos_evento";
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
          active ? "bg-blue-600 border-blue-600 text-white scale-110" : "bg-white border-gray-200 text-gray-300"
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>
      <span className={`${active ? "text-gray-900 font-semibold" : "text-gray-500"} truncate`}>{label}</span>
    </div>
  );
});

FlowStep.displayName = "FlowStep";

function MobileEventDetails({ eventId, onEdit }: MobileEventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  
  const { tasks, refresh: refreshTasks } = useTasks(eventId);
  const { items: budgetItems } = useBudgetItems(eventId);
  const { profiles } = useProfiles();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<Event>("eventos")
        .select("*")
        .eq("id", eventId)
        .single();
      if (!error && data) {
        setEvent(data);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const profilesMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((profile) => map.set(profile.id, profile.nome ?? profile.email));
    return map;
  }, [profiles]);

  const totalBudget = useMemo(
    () => budgetItems.reduce((sum, item) => sum + calculateBudgetItemTotal(item), 0),
    [budgetItems]
  );

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const updates: Record<string, any> = { status };
      
      if (status === "concluida") {
        updates.data_conclusao = new Date().toISOString().split("T")[0];
      } else {
        updates.data_conclusao = null;
      }

      const { error } = await supabase.from("tarefas").update(updates).eq("id", taskId);
      if (error) throw error;
      await refreshTasks();
    } catch (err) {
      alert("Erro ao atualizar tarefa.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Carregando detalhes...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Evento não encontrado.</p>
      </div>
    );
  }

  const flowSteps: { status: EventStatus; label: string }[] = [
    { status: "input", label: "Input do Evento" },
    { status: "criacao_tarefas", label: "Criação de Tarefas" },
    { status: "geracao_orcamento", label: "Geração de Orçamento" },
    { status: "aguardando_aprovacao", label: "Aguardando Aprovação" },
    { status: "execucao", label: "Em Execução" },
    { status: "pos_evento", label: "Pós-Evento" },
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Section com gradiente */}
      <section className="rounded-3xl overflow-hidden shadow-lg border border-white/30 bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 text-white">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-white/70 font-bold mb-1">{event.tipo}</p>
              <h2 className="text-2xl font-bold leading-snug mb-2">{event.titulo}</h2>
              <p className="text-sm text-white/80 leading-relaxed">{event.descricao}</p>
            </div>
            <button
              onClick={() => onEdit(event.id)}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold active:scale-95 transition-all flex-shrink-0 touch-manipulation"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
          
          <div className="text-sm text-white/80 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formatDate(event.data_inicio)} - {formatDate(event.data_fim)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.local}</span>
            </div>
            {event.participantes_esperados && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{event.participantes_esperados} participantes</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between px-5 py-3 bg-black/10 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-white/20">{getStatusLabel(event.status)}</span>
          <span className="px-3 py-1 rounded-full bg-white/20">{getPriorityLabel(event.prioridade)}</span>
        </div>
      </section>

      {/* Participantes */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Participantes
        </h3>
        <div className="space-y-3">
          <InfoCard
            icon={Users}
            label="Responsável"
            value={event.responsavel_id ? profilesMap.get(event.responsavel_id) || "Não identificado" : "Não definido"}
            color="text-blue-500"
          />
          <InfoCard
            icon={Users}
            label="Solicitante"
            value={event.solicitante_id ? profilesMap.get(event.solicitante_id) || "Não identificado" : "Não definido"}
            color="text-purple-500"
          />
        </div>
      </section>

      {/* Tarefas */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-green-500" />
            Tarefas
          </h3>
          <span className="text-xs text-gray-400 font-medium">{tasks.length} itens</span>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 flex flex-col items-center gap-2">
            <ClipboardList className="w-10 h-10 text-gray-300" />
            <p>Nenhuma tarefa cadastrada.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleTaskStatusChange}
                updating={updatingTaskId === task.id}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Orçamento */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            Orçamento
          </h3>
          <span className="text-xs flex items-center gap-1 text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-lg">
            <DollarSign className="w-4 h-4" />
            {formatCurrency(totalBudget)}
          </span>
        </div>
        
        {budgetItems.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 flex flex-col items-center gap-2">
            <Inbox className="w-10 h-10 text-gray-300" />
            <p>Nenhum item cadastrado.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {budgetItems.map((item) => (
              <BudgetItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>

      {/* Fluxo do evento */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          Fluxo do evento
        </h3>
        <div className="space-y-2">
          {flowSteps.map((step) => (
            <FlowStep
              key={step.status}
              status={step.status}
              current={event.status}
              label={step.label}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default memo(MobileEventDetails);