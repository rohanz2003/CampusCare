import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Mail, School, CalendarDays, User as UserIcon, ShieldCheck, ClipboardList } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/issues/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const rows = [
    { icon: UserIcon, label: "Full name", value: user?.name },
    { icon: Mail, label: "Email address", value: user?.email },
    { icon: ShieldCheck, label: "Role", value: user?.role },
    { icon: School, label: "School", value: user?.school },
    { icon: CalendarDays, label: "Member since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—" },
  ];

  const logoutNow = () => {
    logout();
    toast("info", "You have been signed out");
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500">
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="-mt-10 px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white text-2xl font-extrabold text-white shadow-xl dark:border-slate-900"
                style={{ background: user?.avatarColor || "#6366f1" }}
              >
                {initials}
              </div>
              <div className="pb-1">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{user?.role} · {user?.school}</p>
              </div>
            </div>
            <button onClick={logoutNow} className="btn-ghost text-xs">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-slate-800 dark:text-white">Account details</h3>
          <div className="space-y-3">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <Icon size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="truncate text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
            <ClipboardList size={15} className="text-brand-500" /> Engagement snapshot
          </h3>
          {!loaded ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 p-4 text-white shadow-lg shadow-brand-500/25">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                  {user?.role === "admin" ? "Issues reported platform-wide" : "Your reported issues"}
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold">{stats?.total ?? 0}</p>
                <p className="mt-1 text-xs text-white/75">{stats?.resolutionRate ?? 0}% resolved in an average of {stats?.avgResolutionDays ?? 0} days</p>
              </div>
              {user?.role === "admin" && (
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/25">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Community contributors</p>
                  <p className="mt-1 font-display text-3xl font-extrabold">{stats?.totalUsers ?? 0}</p>
                  <p className="mt-1 text-xs text-white/75">Parents & teachers actively reporting</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}