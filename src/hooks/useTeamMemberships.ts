import { useCallback, useEffect, useState } from "react";
import type { TeamMembership } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useTeamMemberships() {
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<TeamMembership>("equipes_membros")
      .select("*");
    if (error) setError(error.message);
    else if (data) setMemberships(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return { memberships, loading, error, refresh: fetchMemberships };
}
