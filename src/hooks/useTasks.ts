import { useCallback, useEffect, useState } from "react";
import type { Task } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useTasks(eventId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from<Task>("tarefas").select("*");
    if (eventId) {
      query = query.eq("evento_id", eventId);
    }
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) {
      setError(error.message);
    } else if (data) {
      setTasks(data);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refresh: fetchTasks };
}
