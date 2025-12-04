import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Users, DollarSign, CheckCircle2, Edit3, ClipboardList, Inbox } from "lucide-react";
import type { Event, TaskStatus, EventStatus } from "../../types";
import { supabase } from "../../lib/supabaseClient";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { useProfiles } from "../../hooks/useProfiles";
import { formatDate, getPriorityLabel, getStatusLabel, calculateBudgetItemTotal } from "../../utils/helpers";

interface MobileEventDetailsProps {
  eventId: string;
  onEdit: (eventId: string) => void;
}

export default function MobileEventDetails({ eventId, onEdit }: MobileEventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { tasks, refresh: refreshTasks } = useTasks(eventId);
  const { items: budgetItems } = useBudgetItems(eventId);
  const { profiles } = useProfiles();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase.from<Event>("eventos").select("*").eq("id", eventId).single();
      if (!error) {
        setEvent(data ?? null);
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

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    await supabase.from("tarefas").update({ status }).eq("id", taskId);
    refreshTasks();
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-gray-500">Carregando detalhes...</div>;
  }

  if (!event) {
    return <div className="text-center py-12 text-sm text-gray-500">Evento nao encontrado.</div>;
  }

  const totalBudget = budgetItems.reduce((sum, item) => sum + calculateBudgetItemTotal(item), 0);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl overflow-hidden shadow-lg border border-white/30 bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 text-white">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/70">{event.tipo}</p>
              <h2 className="text-2xl font-semibold leading-snug">{event.titulo}</h2>
            </div>
            <button
              onClick={() => onEdit(event.id)}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold active:scale-95 transition-transform"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
          <p className="text-sm text-white/80">{event.descricao}</p>
          <div className="text-sm text-white/80 space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(event.data_inicio)} - {formatDate(event.data_fim)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.local}
            </div>
            {event.participantes_esperados ? (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {event.participantes_esperados} participantes
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-3 bg-black/10 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-white/20">{getStatusLabel(event.status)}</span>
          <span className="px-3 py-1 rounded-full bg-white/20">{getPriorityLabel(event.prioridade)}</span>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Participantes</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-500">Responsavel</p>
            <p className="text-gray-900">{event.responsavel_id ? profilesMap.get(event.responsavel_id) : "Nao definido"}</p>
          </div>
          <div>
            <p className="text-gray-500">Solicitante</p>
            <p className="text-gray-900">{event.solicitante_id ? profilesMap.get(event.solicitante_id) : "Nao definido"}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Tarefas</h3>
          <span className="text-xs text-gray-400">{tasks.length} itens</span>
        </div>
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 flex flex-col items-center gap-2">
            <ClipboardList className="w-10 h-10 text-gray-300" />
            Nenhuma tarefa cadastrada.
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.titulo}</p>
                    <p className="text-xs text-gray-500 mt-1">Entrega em {formatDate(task.prazo)}</p>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluida">Concluida</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Orcamento</h3>
          <span className="text-xs flex items-center gap-1 text-gray-500">
            <DollarSign className="w-4 h-4" />
            {formatCurrency(totalBudget)}
          </span>
        </div>
        {budgetItems.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 flex flex-col items-center gap-2">
            <Inbox className="w-10 h-10 text-gray-300" />
            Nenhum item cadastrado.
          </div>
        ) : (
          <ul className="space-y-2">
            {budgetItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-900">{item.descricao}</p>
                  <p className="text-xs text-gray-500">{item.categoria}</p>
                </div>
                <span className="text-gray-900 font-semibold">{formatCurrency(calculateBudgetItemTotal(item))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Fluxo do evento</h3>
        <div className="space-y-2">
          {(
            ["input", "criacao_tarefas", "geracao_orcamento", "aguardando_aprovacao", "execucao", "pos_evento"] as EventStatus[]
          ).map((status) => {
            const active = event.status === status || event.status === "pos_evento";
            return (
              <div key={status} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className={active ? "text-gray-900 font-medium" : "text-gray-500"}>{getStatusLabel(status)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
