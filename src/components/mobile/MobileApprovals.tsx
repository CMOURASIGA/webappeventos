import { useState } from "react";
import { Check, Clock, Loader2, X, Inbox, ShieldCheck } from "lucide-react";
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Carregando aprovacoes...</p>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">Tudo aprovado!</h3>
        <p className="text-sm text-gray-500">Nenhuma solicitacao pendente no momento.</p>
      </div>
    );
  }

  const pendingCount = approvals.filter((approval) => approval.status === "pendente").length;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="text-lg font-bold">Aprovacoes pendentes</h2>
        </div>
        <p className="text-sm text-white/80">{pendingCount} solicitacoes aguardando revisao</p>
      </div>

      {approvals.map((approval) => {
        const event = approval.evento_id ? eventsMap.get(approval.evento_id) : null;
        const isPending = approval.status === "pendente";
        return (
          <div
            key={approval.id}
            className={`bg-white rounded-3xl border p-4 shadow-sm transition-all ${
              isPending ? "border-blue-200 shadow-md" : "border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{event?.titulo ?? "Evento"}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">{approval.tipo === "evento" ? "Evento" : "Orcamento"}</span>
                  <span>-</span>
                  <span>{new Date(approval.data_solicitacao).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold ${
                  approval.status === "aprovado"
                    ? "bg-green-100 text-green-700"
                    : approval.status === "rejeitado"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              </span>
            </div>

            {approval.observacoes ? (
              <div className="mb-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{approval.observacoes}</p>
              </div>
            ) : null}

            {isPending ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision(approval.id, "aprovado")}
                  disabled={updatingId === approval.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold disabled:opacity-60 active:scale-95 transition-all shadow-md"
                >
                  {updatingId === approval.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Aprovar
                </button>
                <button
                  onClick={() => handleDecision(approval.id, "rejeitado")}
                  disabled={updatingId === approval.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-60 active:scale-95 transition-all shadow-md"
                >
                  {updatingId === approval.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Rejeitar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                <Clock className="w-3 h-3" />
                <span>
                  Ultima atualizacao em{" "}
                  {approval.data_resposta
                    ? new Date(approval.data_resposta).toLocaleDateString("pt-BR")
                    : new Date(approval.updated_at ?? approval.data_solicitacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
