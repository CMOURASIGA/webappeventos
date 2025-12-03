import { useState } from "react";
import { Check, Clock, Loader2, X } from "lucide-react";
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
    return <p className="text-center text-sm text-gray-500">Carregando aprovações...</p>;
  }

  if (approvals.length === 0) {
    return <p className="text-center text-sm text-gray-500">Nenhuma solicitação cadastrada.</p>;
  }

  return (
    <div className="space-y-3">
      {approvals.map((approval) => {
        const event = approval.evento_id ? eventsMap.get(approval.evento_id) : null;
        return (
          <div key={approval.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{event?.titulo ?? "Evento"}</p>
                <p className="text-xs text-gray-500">{approval.tipo === "evento" ? "Evento" : "Orçamento"}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  approval.status === "aprovado"
                    ? "bg-green-50 text-green-600"
                    : approval.status === "rejeitado"
                      ? "bg-red-50 text-red-600"
                      : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Solicitado em {new Date(approval.data_solicitacao).toLocaleDateString("pt-BR")}
            </p>
            {approval.observacoes ? <p className="text-sm text-gray-700">{approval.observacoes}</p> : null}
            {approval.status === "pendente" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision(approval.id, "aprovado")}
                  disabled={updatingId === approval.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100 text-sm font-medium disabled:opacity-60"
                >
                  {updatingId === approval.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Aprovar
                </button>
                <button
                  onClick={() => handleDecision(approval.id, "rejeitado")}
                  disabled={updatingId === approval.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100 text-sm font-medium disabled:opacity-60"
                >
                  {updatingId === approval.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Rejeitar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Última atualização em{" "}
                {approval.data_resposta
                  ? new Date(approval.data_resposta).toLocaleDateString("pt-BR")
                  : new Date(approval.updated_at ?? approval.data_solicitacao).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
