import { useEffect, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { EventStatus, EventPriority, Event } from "../types";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useDepartments } from "../hooks/useDepartments";

interface EventFormProps {
  onBack: () => void;
  eventId?: string;
}

const tiposEvento = [
  "Congresso",
  "Workshop",
  "Seminário",
  "Feira",
  "Reunião",
  "Treinamento",
  "Palestra",
  "Webinar",
  "Coquetel",
  "Outros",
];

export default function EventForm({ onBack, eventId }: EventFormProps) {
  const { profile, userTeams, teamsLoading } = useAuth();
  const { departments, refresh: reloadDepartments } = useDepartments();
  const isEditing = Boolean(eventId);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "Congresso",
    data_inicio: "",
    data_fim: "",
    local: "",
    status: "input" as EventStatus,
    prioridade: "media" as EventPriority,
    departamento: "",
    participantes_esperados: "",
    observacoes: "",
  });
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ nome: "", sigla: "" });
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(Boolean(eventId));

  useEffect(() => {
    if (!eventId) {
      setLoadingEvent(false);
      return;
    }
    const fetchEvent = async () => {
      setLoadingEvent(true);
      const { data, error } = await supabase
        .from<Event>("eventos")
        .select("*")
        .eq("id", eventId)
        .single();
      if (error || !data) {
        alert("Nao foi possivel carregar os dados do evento.");
        setLoadingEvent(false);
        onBack();
        return;
      }
      setFormData({
        titulo: data.titulo ?? "",
        descricao: data.descricao ?? "",
        tipo: data.tipo ?? "Congresso",
        data_inicio: data.data_inicio?.slice(0, 10) ?? "",
        data_fim: data.data_fim?.slice(0, 10) ?? "",
        local: data.local ?? "",
        status: data.status ?? "input",
        prioridade: data.prioridade ?? "media",
        departamento: data.departamento_id ?? "",
        participantes_esperados: data.participantes_esperados?.toString() ?? "",
        observacoes: data.observacoes ?? "",
      });
      setSelectedTeamId(data.equipe_id ?? "");
      setLoadingEvent(false);
    };
    fetchEvent();
  }, [eventId, onBack]);

  useEffect(() => {
    if (!selectedTeamId && userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams, selectedTeamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      alert("Não foi possível identificar o usuário logado.");
      return;
    }
    if (!selectedTeamId) {
      alert("Selecione a equipe responsável pelo evento.");
      return;
    }

    try {
      setSaving(true);
      const payloadBase = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: formData.tipo,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        local: formData.local,
        status: formData.status,
        prioridade: formData.prioridade,
        departamento_id: formData.departamento || null,
        equipe_id: selectedTeamId,
        participantes_esperados: formData.participantes_esperados
          ? Number(formData.participantes_esperados)
          : null,
        observacoes: formData.observacoes,
      };

      if (isEditing && eventId) {
        const { error } = await supabase.from("eventos").update(payloadBase).eq("id", eventId);
        if (error) throw error;
        alert("Evento atualizado com sucesso!");
      } else {
        const insertPayload = {
          ...payloadBase,
          responsavel_id: profile.id,
          solicitante_id: profile.id,
        };
        const { data: insertedEvent, error } = await supabase
          .from("eventos")
          .insert([insertPayload])
          .select("*")
          .single();
        if (error) throw error;

        if (insertedEvent?.id) {
          const { error: approvalError } = await supabase.from("aprovacoes").insert([
            {
              evento_id: insertedEvent.id,
              tipo: "evento",
              status: "pendente",
              solicitante_id: profile.id,
              equipe_id: selectedTeamId,
              observacoes: "Aguardando avaliacao do evento recem-cadastrado.",
            },
          ]);
          if (approvalError) throw approvalError;
        }
        alert("Evento cadastrado e enviado para aprovacao!");
      }

      onBack();
    } catch (err) {
      alert("Erro ao salvar evento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.nome.trim()) {
      alert("Informe o nome do departamento.");
      return;
    }
    try {
      setCreatingDepartment(true);
      const { data, error } = await supabase
        .from("departamentos")
        .insert([
          {
            nome: newDepartment.nome.trim(),
            sigla: newDepartment.sigla.trim() || null,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await reloadDepartments();
      if (data?.id) {
        setFormData((prev) => ({ ...prev, departamento: data.id }));
      }
      setNewDepartment({ nome: "", sigla: "" });
      setShowNewDepartment(false);
    } catch (err) {
      alert("Erro ao criar departamento. Tente novamente.");
    } finally {
      setCreatingDepartment(false);
    }
  };

  if (teamsLoading || loadingEvent) {
    return (
      <div className="p-6 text-gray-500">
        Carregando dados do formulario...
      </div>
    );
  }

  if (userTeams.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Nenhuma equipe vinculada</h2>
          <p>
            Para cadastrar eventos, você precisa estar associado a pelo menos uma equipe. Solicite ao
            administrador que faça o vínculo na tela de Configurações.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-gray-900">{isEditing ? "Editar Evento" : "Novo Evento"}</h2>
          <p className="text-gray-600">
            {isEditing ? "Atualize as informacoes do evento" : "Preencha as informacoes do evento"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">Equipe responsável *</label>
            {userTeams.length === 1 ? (
              <p className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                {userTeams[0].nome}
              </p>
            ) : (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {userTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">Título do Evento *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ex: Congresso Nacional de Comércio 2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">Descrição *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Descreva os objetivos e detalhes do evento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Tipo de Evento *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposEvento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Departamento *</label>
            <div className="flex items-center gap-2">
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewDepartment((prev) => !prev)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showNewDepartment ? "Fechar" : "Novo"}
              </button>
            </div>
            {showNewDepartment && (
              <div className="mt-3 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Nome do Departamento</label>
                  <input
                    type="text"
                    value={newDepartment.nome}
                    onChange={(e) => setNewDepartment((prev) => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Eventos Corporativos"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sigla (opcional)</label>
                  <input
                    type="text"
                    value={newDepartment.sigla}
                    onChange={(e) => setNewDepartment((prev) => ({ ...prev, sigla: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: EC"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewDepartment(false)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateDepartment}
                    disabled={creatingDepartment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-60"
                  >
                    {creatingDepartment ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Data de Início *</label>
            <input
              type="date"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Data de Término *</label>
            <input
              type="date"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">Local do Evento *</label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              required
              placeholder="Ex: Centro de Convenções - Brasília/DF"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Prioridade *</label>
            <select
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Participantes Esperados</label>
            <input
              type="number"
              name="participantes_esperados"
              value={formData.participantes_esperados}
              onChange={handleChange}
              placeholder="Ex: 500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : isEditing ? "Salvar Alteracoes" : "Cadastrar Evento"}
          </button>
        </div>
      </form>
    </div>
  );
}
