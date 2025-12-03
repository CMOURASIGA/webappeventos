import { useCallback, useEffect, useState } from "react";
import type { Team } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<Team>("equipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else if (data) setTeams(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return { teams, loading, error, refresh: fetchTeams };
}
