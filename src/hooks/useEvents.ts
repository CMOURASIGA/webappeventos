import { useCallback, useEffect, useState } from "react";
import type { Event } from "../types";
import { supabase } from "../lib/supabaseClient";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from<Event>("eventos")
      .select("*")
      .order("data_inicio", { ascending: true });

    if (error) {
      setError(error.message);
    } else if (data) {
      setEvents(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refresh: fetchEvents };
}
