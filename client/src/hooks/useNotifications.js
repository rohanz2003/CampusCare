import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";

export function useNotifications() {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
  }, [load]);

  return { items, unread, setUnread, setItems, load };
}