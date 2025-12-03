import { useCallback, useEffect, useState } from "react";
import type { Department } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<Department>("departamentos")
      .select("*")
      .order("nome", { ascending: true });
    if (error) {
      setError(error.message);
    } else if (data) {
      setDepartments(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, loading, error, refresh: fetchDepartments };
}
