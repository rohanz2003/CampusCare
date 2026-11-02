import { useCallback, useEffect, useRef, useState } from "react";
import { api, getToken } from "../lib/api.js";

const POLL_MS = 45000;

export function useNotifications() {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const alive = useRef(true);

  const load = useCallback(async () => {
    // No token means we just signed out: firing the request would only produce a
    // 401 that tears the session down again.
    if (!getToken()) return;
    try {
      const { data } = await api.get("/notifications");
      if (!alive.current) return;
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {
      /* silent — the badge just stays as it was */
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(t);
    };
  }, [load]);

  return { items, unread, setUnread, setItems, load };
}
