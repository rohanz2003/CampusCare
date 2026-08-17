import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bell, BellRing, CheckCheck, Wrench, CheckCircle2, Clock, Inbox, Loader2 } from "lucide-react";
import { api } from "../lib/api.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { timeAgo } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";

const ICONS = {
  pending: <Clock size={16} className="text-amber-500" />,
  progress: <Wrench size={16} className="text-sky-500" />,
  resolved: <CheckCircle2 size={16} className="text-emerald-500" />,
};

export default function NotificationsPage() {
  const { items, unread, setUnread, setItems, load } = useNotifications();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await api.post("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast("success", "All notifications marked as read");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25">
              <Bell size={20} />
            </div>
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                {unread}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "You're all caught up"}</p>
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAll} disabled={busy} className="btn-ghost text-xs">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={14} />} Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <Inbox size={36} className="text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-500 dark:text-slate-400">No notifications yet</p>
          <p className="max-w-xs text-xs text-slate-400 dark:text-slate-500">You'll be alerted here when issue statuses change or repairs are completed.</p>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {items.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card flex items-start gap-4 p-4 transition-all hover:shadow-lg ${
                n.read ? "opacity-70" : "border-l-4 border-l-brand-500"
              }`}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {ICONS[n.type] || <BellRing size={16} className="text-brand-500" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                {n.issueId && (
                  <Link to={`/issues/${n.issueId}`} onClick={() => markRead(n.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    View issue {n.issueId} →
                  </Link>
                )}
              </div>
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs font-semibold text-brand-500 hover:underline">Mark read</button>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}