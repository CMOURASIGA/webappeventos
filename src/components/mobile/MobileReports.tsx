import { Target, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { useEvents } from "../../hooks/useEvents";
import { useBudgetItems } from "../../hooks/useBudgetItems";
import { formatCurrency } from "../../utils/helpers";

export default function MobileReports() {
  const { events } = useEvents();
  const { items } = useBudgetItems();

  const totalOrcamento = items.reduce((sum, item) => sum + (Number(item.valor_total) || 0), 0);
  const eventosAtivos = events.filter((e) => !["pos_evento", "cancelado"].includes(e.status)).length;
  const concluidos = events.filter((e) => e.status === "pos_evento").length;

  const KPICard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
       </div>
       <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <KPICard label="Ativos" value={eventosAtivos} icon={Target} color="bg-blue-100 text-blue-600" />
        <KPICard label="Concluídos" value={concluidos} icon={CheckCircle2} color="bg-green-100 text-green-600" />
        <KPICard label="Total Investido" value={new Intl.NumberFormat('pt-BR', { notation: "compact", style: 'currency', currency: 'BRL' }).format(totalOrcamento)} icon={DollarSign} color="bg-purple-100 text-purple-600" />
        <KPICard label="Total Eventos" value={events.length} icon={TrendingUp} color="bg-orange-100 text-orange-600" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
         <h3 className="font-bold text-slate-900 mb-4">Top Orçamentos</h3>
         <div className="space-y-4">
            {[...events].sort((a,b) => (b.orcamento_aprovado||0) - (a.orcamento_aprovado||0)).slice(0,5).map((e, i) => (
               <div key={e.id} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-slate-300">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-semibold text-slate-900 truncate">{e.titulo}</p>
                     <p className="text-xs text-slate-500">{e.tipo}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{e.orcamento_aprovado ? formatCurrency(e.orcamento_aprovado) : '-'}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
