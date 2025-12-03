import { useCallback, useEffect, useState } from "react";
import type { BudgetItem } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useBudgetItems(eventId?: string) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from<BudgetItem>("orcamentos_itens").select("*");
    if (eventId) {
      query = query.eq("evento_id", eventId);
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) {
      setError(error.message);
    } else if (data) {
      setItems(data);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refresh: fetchItems };
}
