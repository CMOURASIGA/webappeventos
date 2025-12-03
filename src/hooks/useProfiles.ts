import { useCallback, useEffect, useState } from "react";
import type { Profile } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<Profile>("perfis")
      .select("*")
      .order("nome", { ascending: true });
    if (error) {
      setError(error.message);
    } else if (data) {
      setProfiles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, refresh: fetchProfiles };
}
