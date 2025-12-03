import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  DollarSign,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useBudgetItems } from "../hooks/useBudgetItems";
import { useEvents } from "../hooks/useEvents";
import { supabase } from "../lib/supabaseClient";
import {
  calculateBudgetItemTotal,
  formatCurrency,
  formatDate,
} from "../utils/helpers";

export default function BudgetManager() {
  const { items, loading, refresh } = useBudgetItems();
  const { events } = useEvents();
  const [filterEvent, setFilterEvent] = useState<"todos" | string>("todos");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [form, setForm] = useState({
    evento_id: "",
    categoria: "",
    descricao: "",
    fornecedor: "",
    quantidade: "1",
    valor_unitario: "",
  });

  const eventMap = useMemo(() => {
    const map = new Map<string, { titulo: string; equipe_id?: string | null }>();
    events.forEach((event) =>
      map.set(event.id, { titulo: event.titulo, equipe_id: event.equipe_id }),
    );
    return map;
  }, [events]);

  const filteredItems = useMemo(() => {
    return filterEvent === "todos"
      ? items
      : items.filter((item) => item.evento_id === filterEvent);
  }, [items, filterEvent]);

  const totals = useMemo(() => {
    const total = filteredItems.reduce(
      (sum, item) => sum + calculateBudgetItemTotal(item),
      0,
    );
    const approvedTotal = filteredItems
      .filter((item) => item.aprovado)
      .reduce((sum, item) => sum + calculateBudgetItemTotal(item), 0);
    const pendingTotal = total - approvedTotal;
    return { total, approvedTotal, pendingTotal };
  }, [filteredItems]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.evento_id) {
      alert("Selecione o evento.");
      return;
    }
    const quantity = Number(form.quantidade);
    const unitValue = Number(form.valor_unitario.toString().replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }
    if (!Number.isFinite(unitValue) || unitValue < 0) {
      alert("Informe um valor unitário válido.");
      return;
    }
    try {
      setSaving(true);
      const eventInfo = eventMap.get(form.evento_id);
      const { error } = await supabase.from("orcamentos_itens").insert({
        evento_id: form.evento_id,
        categoria: form.categoria.trim(),
        descricao: form.descricao.trim(),
        fornecedor: form.fornecedor.trim() || null,
        quantidade: quantity,
        valor_unitario: unitValue,
        equipe_id: eventInfo?.equipe_id ?? null,
      });
      if (error) throw error;
      await refresh();
      setForm({
        evento_id: "",
        categoria: "",
        descricao: "",
        fornecedor: "",
        quantidade: "1",
        valor_unitario: "",
      });
      setShowForm(false);
    } catch (err) {
      alert("Erro ao salvar item de orçamento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprovalChange = async (itemId: string, current: boolean) => {
    try {
      setUpdatingItemId(itemId);
      const { error } = await supabase
        .from("orcamentos_itens")
        .update({ aprovado: !current })
        .eq("id", itemId);
      if (error) throw error;
      await refresh();
    } catch (err) {
      alert("Erro ao atualizar status do item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Controle de Orçamentos</h2>
        <p className="text-gray-600">
          Cadastre fornecedores, custos previstos e acompanhe a aprovação por
          evento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Valor Total"
          value={formatCurrency(totals.total)}
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          accent="bg-blue-50"
        />
        <SummaryCard
          label="Aprovado"
          value={formatCurrency(totals.approvedTotal)}
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          accent="bg-green-50"
        />
        <SummaryCard
          label="Pendente"
          value={formatCurrency(totals.pendingTotal)}
          icon={<AlertCircle className="w-5 h-5 text-yellow-600" />}
          accent="bg-yellow-50"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterEvent}
              onChange={(e) =>
                setFilterEvent(e.target.value as "todos" | string)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os eventos</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.titulo}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancelar" : "Novo Item"}
          </button>
        </div>

        {showForm && (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Evento
                </label>
                <select
                  value={form.evento_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, evento_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, categoria: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex.: Estrutura, Marketing, Alimentação"
                  required
                />
              </div>
            </div>
            <textarea
              placeholder="Descrição detalhada"
              rows={2}
              value={form.descricao}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descricao: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, quantidade: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Valor unitário
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor_unitario}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      valor_unitario: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={form.fornecedor}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fornecedor: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa (opcional)"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Adicionar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          Carregando itens de orçamento...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          Nenhum item encontrado para o filtro selecionado.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">
                  Evento
                </th>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">
                  Categoria / Item
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">
                  Quantidade
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">
                  Valor unit.
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">
                  Total
                </th>
                <th className="text-center px-4 py-3 text-xs text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const evento = eventMap.get(item.evento_id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {evento?.titulo ?? "Evento removido"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium">{item.categoria}</div>
                      <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>
                      {item.fornecedor && (
                        <p className="text-xs text-gray-500 mt-1">
                          Fornecedor: {item.fornecedor}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {item.quantidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {formatCurrency(Number(item.valor_unitario || 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(calculateBudgetItemTotal(item))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleApprovalChange(item.id, item.aprovado)}
                        disabled={updatingItemId === item.id}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
                          item.aprovado
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-yellow-200 bg-yellow-50 text-yellow-700"
                        } disabled:opacity-60`}
                      >
                        {item.aprovado ? "Aprovado" : "Pendente"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  value: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-gray-900">{value}</p>
        </div>
        <div className={`w-10 h-10 ${accent} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
