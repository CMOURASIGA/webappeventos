import { useCallback, useEffect, useState } from "react";
import type { Approval } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<Approval>("aprovacoes")
      .select("*")
      .order("data_solicitacao", { ascending: false });

    if (error) {
      setError(error.message);
    } else if (data) {
      setApprovals(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  return { approvals, loading, error, refresh: fetchApprovals };
}
