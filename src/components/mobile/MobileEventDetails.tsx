import { useEffect, useMemo, useState, memo } from "react";
import { Calendar, MapPin, Users, DollarSign, CheckCircle2, Edit3, ClipboardList, TrendingUp } from "lucide-react";
import type { Event, TaskStatus } from "../../types";
import { supabase } from "../../lib/supabaseClient";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { formatDate, getPriorityLabel, getStatusLabel, calculateBudgetItemTotal, formatCurrency } from "../../utils/helpers";

interface MobileEventDetailsProps {
  eventId: string;
  onEdit: (eventId: string) => void;
}

const DetailBlock = ({ title, icon: Icon, children, count }: any) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Icon className="w-4 h-4" /></div>
        {title}
      </h3>
      {count !== undefined && <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{count}</span>}
    </div>
    {children}
  </div>
);

function MobileEventDetails({ eventId, onEdit }: MobileEventDetailsProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { tasks, refresh: refreshTasks } = useTasks(eventId);
  const { items: budgetItems } = useBudgetItems(eventId);

  useEffect(() => {
    supabase.from<Event>("eventos").select("*").eq("id", eventId).single().then(({ data }) => {
       if(data) setEvent(data);
       setLoading(false);
    });
  }, [eventId]);

  const totalBudget = useMemo(() => budgetItems.reduce((sum, item) => sum + calculateBudgetItemTotal(item), 0), [budgetItems]);

  const handleTaskToggle = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === 'concluida' ? 'pendente' : 'concluida';
    await supabase.from("tarefas").update({ status: newStatus, data_conclusao: newStatus === 'concluida' ? new Date() : null }).eq("id", taskId);
    refreshTasks();
  };

  if (loading || !event) return <div className="text-center py-20 text-slate-400">Carregando...</div>;

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-xl shadow-blue-900/20 mb-6">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
         
         <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
               {event.tipo}
            </span>
            <button onClick={() => onEdit(event.id)} className="p-2 bg-white/20 rounded-full active:bg-white/30 transition-colors">
               <Edit3 className="w-4 h-4" />
            </button>
         </div>

         <h2 className="text-2xl font-bold leading-tight mb-2 relative z-10">{event.titulo}</h2>
         <p className="text-blue-100 text-sm mb-6 leading-relaxed opacity-90 relative z-10">{event.descricao}</p>

         <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-blue-800/30 backdrop-blur-sm p-3 rounded-xl border border-white/10">
               <Calendar className="w-4 h-4 mb-1 text-blue-200" />
               <p className="text-xs text-blue-200">Início</p>
               <p className="font-semibold text-sm">{formatDate(event.data_inicio)}</p>
            </div>
            <div className="bg-blue-800/30 backdrop-blur-sm p-3 rounded-xl border border-white/10">
               <MapPin className="w-4 h-4 mb-1 text-blue-200" />
               <p className="text-xs text-blue-200">Local</p>
               <p className="font-semibold text-sm truncate">{event.local}</p>
            </div>
         </div>
      </div>

      {/* Progress Bar Simplificada */}
      <div className="mb-6 px-2">
         <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Progresso</span>
            <span>{getStatusLabel(event.status)}</span>
         </div>
         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-1/3" /> {/* Lógica de progresso real pode ser injetada aqui */}
         </div>
      </div>

      {/* Tasks Block */}
      <DetailBlock title="Tarefas" icon={ClipboardList} count={tasks.length}>
         {tasks.length === 0 ? <p className="text-sm text-gray-400 py-2">Sem tarefas.</p> : (
            <div className="space-y-3">
               {tasks.slice(0, 5).map(task => (
                  <div key={task.id} onClick={() => handleTaskToggle(task.id, task.status)} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer touch-manipulation">
                     <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.status === 'concluida' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {task.status === 'concluida' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === 'concluida' ? 'text-gray-400 line-through' : 'text-slate-900'}`}>{task.titulo}</p>
                        <p className="text-xs text-gray-500">{formatDate(task.prazo)}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </DetailBlock>

      {/* Budget Block */}
      <DetailBlock title="Orçamento" icon={DollarSign}>
         <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 mb-3">
            <span className="text-sm font-medium text-emerald-800">Total Previsto</span>
            <span className="text-lg font-bold text-emerald-700">{formatCurrency(totalBudget)}</span>
         </div>
         <div className="space-y-2">
            {budgetItems.slice(0, 3).map(item => (
               <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-slate-600 truncate pr-4">{item.descricao}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(calculateBudgetItemTotal(item))}</span>
               </div>
            ))}
            {budgetItems.length > 3 && <p className="text-xs text-center text-blue-500 font-bold mt-2">Ver todos os itens</p>}
         </div>
      </DetailBlock>
    </div>
  );
}

export default memo(MobileEventDetails);
