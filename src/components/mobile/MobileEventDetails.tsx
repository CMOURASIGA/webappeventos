import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Calendar, MapPin, DollarSign, Users, CheckCircle2, Edit3 } from "lucide-react";
import type { Event, EventStatus, TaskStatus } from "../../types";
import { supabase } from "../../lib/supabaseClient";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { useProfiles } from "../../hooks/useProfiles";
import {
  calculateBudgetItemTotal,
  formatCurrency,
  formatDate,
  getPriorityLabel,
  getStatusLabel,
  getTaskStatusLabel,
} from "../../utils/helpers";

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
      if (!error && data) {
        setEvent(data);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const profilesMap = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((profile) => {
      map.set(profile.id, profile.nome ?? profile.email);
    });
    return map;
  }, [profiles]);

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    await supabase.from("tarefas").update({ status }).eq("id", taskId);
    refreshTasks();
  };

  if (loading || !event) {
    return <p className="text-center text-sm text-gray-500">Carregando detalhes...</p>;
  }

  const totalBudget = budgetItems.reduce((sum, item) => sum + calculateBudgetItemTotal(item), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">{event.tipo}</p>
            <h2 className="text-xl font-semibold text-gray-900">{event.titulo}</h2>
          </div>
          <button onClick={() => onEdit(event.id)} className="text-blue-600 text-sm flex items-center gap-1">
            <Edit3 className="w-4 h-4" />
            Editar
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">{event.descricao}</p>
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            {formatDate(event.data_inicio)} - {formatDate(event.data_fim)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-500" />
            {event.local}
          </span>
          {event.participantes_esperados ? (
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              {event.participantes_esperados} participantes
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-xs mt-4 flex-wrap">
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{getStatusLabel(event.status)}</span>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">{getPriorityLabel(event.prioridade)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Participantes</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-500">Responsável</p>
            <p className="text-gray-900">{event.responsavel_id ? profilesMap.get(event.responsavel_id) : "Não definido"}</p>
          </div>
          <div>
            <p className="text-gray-500">Solicitante</p>
            <p className="text-gray-900">{event.solicitante_id ? profilesMap.get(event.solicitante_id) : "Não definido"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Tarefas</h3>
          <span className="text-xs text-gray-400">{tasks.length} itens</span>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma tarefa cadastrada.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{task.titulo}</p>
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Entrega em {formatDate(task.prazo)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Orçamento</h3>
          <span className="text-xs flex items-center gap-1 text-gray-500">
            <DollarSign className="w-4 h-4" />
            {formatCurrency(totalBudget)}
          </span>
        </div>
        {budgetItems.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum item cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {budgetItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-900">{item.descricao}</p>
                  <p className="text-xs text-gray-500">{item.categoria}</p>
                </div>
                <span className="text-gray-900 font-medium">{formatCurrency(calculateBudgetItemTotal(item))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Fluxo do evento</h3>
        <div className="space-y-2">
          {(
            ["input", "criacao_tarefas", "geracao_orcamento", "aguardando_aprovacao", "execucao", "pos_evento"] as EventStatus[]
          ).map((status) => (
            <div key={status} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2
                className={`w-4 h-4 ${
                  event.status === status || event.status === "pos_evento"
                    ? "text-blue-600"
                    : "text-gray-300"
                }`}
              />
              <span>{getStatusLabel(status)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
