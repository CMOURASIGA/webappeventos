import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTeams } from "../hooks/useTeams";
import { useProfiles } from "../hooks/useProfiles";
import { useTeamMemberships } from "../hooks/useTeamMemberships";

export default function TeamManager() {
  const { teams, loading: teamsLoading, refresh: refreshTeams } = useTeams();
  const { profiles, loading: profilesLoading, refresh: refreshProfiles } = useProfiles();
  const {
    memberships,
    loading: membershipsLoading,
    refresh: refreshMemberships,
  } = useTeamMemberships();
  const [newTeam, setNewTeam] = useState({ nome: "", descricao: "" });
  const [savingTeam, setSavingTeam] = useState(false);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.nome.trim()) {
      alert("Informe o nome da equipe");
      return;
    }
    try {
      setSavingTeam(true);
      const { error } = await supabase.from("equipes").insert({
        nome: newTeam.nome.trim(),
        descricao: newTeam.descricao.trim() || null,
      });
      if (error) throw error;
      setNewTeam({ nome: "", descricao: "" });
      await refreshTeams();
    } catch (err) {
      alert("Erro ao criar equipe. Tente novamente.");
    } finally {
      setSavingTeam(false);
    }
  };

  const membershipMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    memberships.forEach((membership) => {
      if (!map.has(membership.perfil_id)) {
        map.set(membership.perfil_id, new Set());
      }
      map.get(membership.perfil_id)!.add(membership.equipe_id);
    });
    return map;
  }, [memberships]);

  const [pendingMemberships, setPendingMemberships] = useState<Record<string, Set<string>>>({});
  const [savingMembership, setSavingMembership] = useState(false);

  const handleToggleMembership = (profileId: string, teamId: string, checked: boolean) => {
    setPendingMemberships((prev) => {
      const current = new Set(prev[profileId] ?? (membershipMap.get(profileId) ?? new Set()));
      if (checked) {
        current.add(teamId);
      } else {
        current.delete(teamId);
      }
      return { ...prev, [profileId]: current };
    });
  };

  const handleSaveMemberships = async (profileId: string) => {
    const selectedTeams =
      pendingMemberships[profileId] ?? membershipMap.get(profileId) ?? new Set<string>();
    try {
      setSavingMembership(true);
    setUpdatingMember(profileId);
      await supabase.from("equipes_membros").delete().eq("perfil_id", profileId);
      if (selectedTeams.size > 0) {
        const { error } = await supabase.from("equipes_membros").insert(
          Array.from(selectedTeams).map((teamId) => ({
            perfil_id: profileId,
            equipe_id: teamId,
          })),
        );
        if (error) throw error;
      }
      await refreshMemberships();
      const primaryTeam = selectedTeams.size > 0 ? Array.from(selectedTeams)[0] : null;
      await supabase
        .from("perfis")
        .update({ equipe_id: primaryTeam })
        .eq("id", profileId);
      await refreshProfiles();
      setPendingMemberships((prev) => {
        const next = { ...prev };
        delete next[profileId];
        return next;
      });
    } catch (err: any) {
      alert(`Erro ao atualizar vínculos: ${err.message ?? err}`);
    } finally {
      setSavingMembership(false);
      setUpdatingMember(null);
    }
  };

  const handleRoleChange = async (profileId: string, newRole: string) => {
    const admins = profiles.filter((profile) => (profile.papel ?? "admin") === "admin");
    const isCurrentAdmin = admins.some((profile) => profile.id === profileId);
    if (newRole !== "admin" && isCurrentAdmin && admins.length <= 1) {
      alert("É necessário manter pelo menos um administrador no sistema.");
      return;
    }
    try {
      setUpdatingRoleId(profileId);
      const { error } = await supabase
        .from("perfis")
        .update({ papel: newRole })
        .eq("id", profileId);
      if (error) throw error;
      await refreshProfiles();
    } catch (err: any) {
      alert(`Erro ao atualizar o perfil do usuário: ${err.message ?? err}`);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-gray-900">Configurações de Equipes</h2>
          <p className="text-gray-600">Crie equipes e defina quais usuários pertencem a cada uma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-900 flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4" />
            Nova equipe
          </h3>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nome da equipe</label>
              <input
                type="text"
                value={newTeam.nome}
                onChange={(e) => setNewTeam((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Eventos Corporativos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Descrição (opcional)</label>
              <textarea
                value={newTeam.descricao}
                onChange={(e) => setNewTeam((prev) => ({ ...prev, descricao: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Objetivo ou detalhes da equipe"
              />
            </div>
            <button
              type="submit"
              disabled={savingTeam}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {savingTeam ? "Salvando..." : "Criar equipe"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-gray-900">Equipes cadastradas</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {teamsLoading ? (
              <p className="p-4 text-gray-500">Carregando equipes...</p>
            ) : teams.length === 0 ? (
              <p className="p-4 text-gray-500">Nenhuma equipe cadastrada ainda.</p>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="p-4">
                  <p className="text-gray-900">{team.nome}</p>
                  <p className="text-sm text-gray-500">{team.descricao || "Sem descrição"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">Vincular usuários a equipes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
               <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Usuário</th>
               <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">E-mail</th>
                <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Perfil</th>
               <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Equipe</th>
               <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Salvar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profilesLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Carregando usuários...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                   <td className="px-4 py-3 text-sm text-gray-900">{profile.nome || "Sem nome"}</td>
                   <td className="px-4 py-3 text-sm text-gray-600">{profile.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <select
                        value={profile.papel ?? "admin"}
                        disabled={updatingRoleId === profile.id}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="admin">Administrador</option>
                        <option value="usuario">Usuário</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {teams.map((team) => {
                          const baseSet = pendingMemberships[profile.id] ?? membershipMap.get(profile.id);
                          const checked = baseSet?.has(team.id) ?? false;
                          return (
                            <label
                              key={`${profile.id}-${team.id}`}
                              className="inline-flex items-center gap-1 text-sm text-gray-700"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={checked}
                                disabled={updatingMember === profile.id || membershipsLoading}
                                onChange={(e) =>
                                  handleToggleMembership(profile.id, team.id, e.target.checked)
                                }
                              />
                              {team.nome}
                            </label>
                          );
                        })}
                        {teams.length === 0 && <span className="text-sm text-gray-400">Nenhuma equipe disponível</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSaveMemberships(profile.id)}
                        disabled={savingMembership || membershipsLoading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                      >
                        {updatingMember === profile.id ? "Salvando..." : "Salvar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
