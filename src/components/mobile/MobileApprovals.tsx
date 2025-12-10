import { useState } from "react";
import { Check, Loader2, X, Inbox, ShieldCheck, Clock, Calendar } from "lucide-react";
import { useApprovals } from "../../hooks/useApprovals";
import { useEvents } from "../../hooks/useEvents";
import { supabase } from "../../lib/supabaseClient";

export default function MobileApprovals() {
  const { approvals, loading, refresh } = useApprovals();
  const { events } = useEvents();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const eventsMap = new Map(events.map((event) => [event.id, event]));

  const handleDecision = async (id: string, status: "aprovado" | "rejeitado") => {
    setUpdatingId(id);
    await supabase.from("aprovacoes").update({ status }).eq("id", id);
    await refresh();
    setUpdatingId(null);
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" /></div>;

  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Tudo limpo!</h3>
        <p className="text-slate-500 mt-2">Você zerou suas pendências de aprovação.</p>
      </div>
    );
  }

  const pendingCount = approvals.filter((a) => a.status === "pendente").length;

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-600/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">{pendingCount}</div>
          <div>
             <p className="font-bold">Pendências</p>
             <p className="text-xs text-blue-100">Necessitam sua atenção</p>
          </div>
        </div>
      )}

      {approvals.map((approval) => {
        const event = approval.evento_id ? eventsMap.get(approval.evento_id) : null;
        const isPending = approval.status === "pendente";
        
        return (
          <div
            key={approval.id}
            className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
              isPending ? "border-blue-100 ring-4 ring-blue-50/50" : "border-gray-100 opacity-80"
            }`}
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     {approval.tipo === 'orcamento' ? 'Orçamento' : 'Evento'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{event?.titulo ?? "Item sem título"}</h3>
               </div>
               <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                  approval.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                  approval.status === 'rejeitado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
               }`}>
                  {approval.status}
               </span>
            </div>

            <div className="space-y-2 mb-5">
               <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Solicitado em {new Date(approval.data_solicitacao).toLocaleDateString("pt-BR")}</span>
               </div>
               {approval.observacoes && (
                  <p className="text-sm text-slate-600 p-3 bg-gray-50 rounded-xl border border-gray-100 italic">
                     "{approval.observacoes}"
                  </p>
               )}
            </div>

            {/* Actions Area */}
            {isPending ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDecision(approval.id, "rejeitado")}
                  disabled={!!updatingId}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold active:scale-95 transition-all hover:bg-red-100"
                >
                  {updatingId === approval.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  Rejeitar
                </button>
                <button
                  onClick={() => handleDecision(approval.id, "aprovado")}
                  disabled={!!updatingId}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500 text-white font-bold shadow-lg shadow-green-500/30 active:scale-95 transition-all hover:bg-green-600"
                >
                  {updatingId === approval.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Aprovar
                </button>
              </div>
            ) : (
               <div className="flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-gray-100 pt-3">
                  <Clock className="w-3 h-3" />
                  Resolvido em {new Date(approval.updated_at).toLocaleDateString("pt-BR")}
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
