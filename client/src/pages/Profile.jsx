import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut, Mail, School, CalendarDays, User as UserIcon, ShieldCheck, HardHat,
  BadgeCheck, ArrowRight, Activity, ClipboardList, Wrench, CheckCircle2, Clock,
  LayoutDashboard, Bell, Inbox,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import { api, timeAgo } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import ChartTooltip from "../components/ui/ChartTooltip.jsx";
import { STATUS_COLORS, workerTypeLabel } from "../lib/ui.js";

const ROLE_META = {
  admin: { label: "Administrator", desc: "School administration · full platform access", icon: ShieldCheck },
  teacher: { label: "Teacher", desc: "Faculty member · reports & tracks issues", icon: School },
  parent: { label: "Parent / Guardian", desc: "Community member · reports & tracks issues", icon: UserIcon },
  worker: { label: "Repair Worker", desc: "CampusCare field staff · executes assigned repairs", icon: HardHat },
};

function hasSchool(s) {
  return s && s !== "Not Specified" && s !== "Unregistered School";
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: notifications } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const isWorker = user?.role === "worker";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const endpoint = isWorker ? "/worker/stats" : "/issues/stats";
    api
      .get(endpoint)
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isWorker]);

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const roleMeta = ROLE_META[user?.role] || ROLE_META.parent;
  const RoleIcon = roleMeta.icon;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const total = stats?.total ?? stats?.assigned ?? 0;
  const resolved = stats?.resolved ?? 0;
  const inProgress = stats?.inProgress ?? 0;
  const pending = stats?.pending ?? 0;
  const resolvedPct = total ? Math.round((resolved / total) * 100) : 0;

  const donutData = [
    { name: "Resolved", value: resolved },
    { name: "In Progress", value: inProgress },
    { name: "Pending", value: pending },
  ].filter((d) => d.value > 0);

  const kpis = isWorker
    ? [
        { value: stats?.assigned ?? "—", label: "Tasks Assigned" },
        { value: pending, label: "Pending" },
        { value: inProgress, label: "In Progress" },
        { value: resolved, label: "Resolved" },
      ]
    : [
        { value: total, label: "Total Issues" },
        { value: `${resolvedPct}%`, label: "Resolution Rate" },
        { value: pending, label: "Pending" },
        { value: inProgress, label: "In Progress" },
      ];

  const accountInfo = [
    { icon: Mail, label: "Email address", value: user?.email },
    { icon: ShieldCheck, label: "Account role", value: roleMeta.label, chip: isWorker ? workerTypeLabel(user?.workerType) : null },
    ...(hasSchool(user?.school)
      ? [{ icon: School, label: "School", value: user?.school }]
      : isWorker
        ? [{ icon: HardHat, label: "Trade category", value: workerTypeLabel(user?.workerType) }]
        : []),
    { icon: CalendarDays, label: "Member since", value: memberSince },
  ];

  const actions = isWorker
    ? [
        { to: "/worker/work", label: "My Assigned Work", icon: ClipboardList, tone: "bg-sky-500" },
        { to: "/worker/notifications", label: "Notifications", icon: Bell, tone: "bg-violet-500" },
        { to: "/worker", label: "Dashboard", icon: LayoutDashboard, tone: "bg-slate-600" },
      ]
    : isAdmin
      ? [
          { to: "/admin", label: "Admin Panel", icon: ShieldCheck, tone: "bg-brand-600" },
          { to: "/notifications", label: "Notifications", icon: Bell, tone: "bg-violet-500" },
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tone: "bg-slate-600" },
        ]
      : [
          { to: "/report", label: "Report an Issue", icon: Wrench, tone: "bg-brand-600" },
          { to: "/issues", label: "Track Issues", icon: ClipboardList, tone: "bg-sky-500" },
          { to: "/notifications", label: "Notifications", icon: Bell, tone: "bg-violet-500" },
        ];

  const logoutNow = () => {
    logout();
    toast("info", "You have been signed out");
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-0">
        <div className="grid-bg relative h-32 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 right-40 h-36 w-36 rounded-full bg-white/10 blur-xl" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-4 sm:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
              {roleMeta.label} profile
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur sm:flex">
                <BadgeCheck size={13} /> Verified account
              </span>
              <button onClick={logoutNow} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur transition-colors hover:bg-white/25">
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="relative -mt-8 shrink-0">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-3xl font-extrabold tracking-tight text-white shadow-xl dark:border-slate-900 sm:h-28 sm:w-28"
                style={{ background: user?.avatarColor || "#2563eb" }}
              >
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 text-white shadow-lg dark:border-slate-900">
                <BadgeCheck size={13} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {user?.name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <RoleIcon size={11} className="text-brand-500" /> {roleMeta.label}
                </span>
                {isWorker && (
                  <span className="chip bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <HardHat size={11} /> {workerTypeLabel(user?.workerType)}
                  </span>
                )}
                {hasSchool(user?.school) && (
                  <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <School size={11} /> {user?.school}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{roleMeta.desc}</p>
            </div>
          </div>

          {loaded && (
            <div className="mt-6 grid grid-cols-2 divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60 py-4 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/40 sm:grid-cols-4 sm:divide-x">
              {kpis.map((k) => (
                <div key={k.label} className="px-4 py-1 text-center sm:py-0">
                  <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{k.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{k.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-6 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
            <UserIcon size={14} className="text-brand-500" /> Account information
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {accountInfo.map(({ icon: Icon, label, value, chip }) => (
              <div key={label} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <Icon size={11} className="text-brand-500" /> {label}
                </p>
                <p className="mt-1.5 flex items-center gap-2 truncate text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">
                  {value}
                  {chip && (
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                      {chip}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <h3 className="mb-3 mt-7 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
            <LayoutDashboard size={14} className="text-brand-500" /> Quick actions
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {actions.map(({ to, label, icon: Icon, tone }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-md ${tone}`}>
                  <Icon size={15} />
                </span>
                <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                <ArrowRight size={14} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="space-y-5">
          <div className="card p-6">
            <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
              <Activity size={14} className="text-emerald-500" /> {isWorker ? "Task completion" : "Report resolution"}
            </h3>
            <p className="text-xs text-slate-400">{isWorker ? "Share of assigned tasks you completed" : "Share of reported issues that got fixed"}</p>
            <div className="mt-4 flex items-center justify-center">
              {loaded && total > 0 ? (
                <div className="relative h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                        {donutData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{resolvedPct}%</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Resolved</p>
                  </div>
                </div>
              ) : (
                <p className="py-12 text-sm text-slate-400">{loaded ? "No activity yet" : "Loading..."}</p>
              )}
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              {donutData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
              <Inbox size={14} className="text-sky-500" /> Recent activity
            </h3>
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Nothing yet — your latest updates will appear here.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.type === "resolved" ? "bg-emerald-500" : n.type === "progress" ? "bg-sky-500" : "bg-amber-500"}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{n.title}</p>
                      <p className="truncate text-xs text-slate-400">{n.message} · {timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}