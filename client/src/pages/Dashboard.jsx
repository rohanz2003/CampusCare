import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, PlusCircle, ArrowRight, Wrench, Users, PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import IssueCard from "../components/IssueCard.jsx";
import { CATEGORY_META } from "../components/Badges.jsx";

const STATUS_COLORS = { Pending: "#f59e0b", "In Progress": "#0ea5e9", Resolved: "#10b981" };
const PRIO_COLORS = { Low: "#94a3b8", Medium: "#f59e0b", High: "#f97316", Critical: "#f43f5e" };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/issues/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/issues").then(({ data }) => setRecent(data.issues.slice(0, 5))).catch(() => {});
  }, [user]);

  const statusData = stats ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })) : [];
  const priorityData = stats ? Object.entries(stats.byPriority).map(([name, value]) => ({ name, value })) : [];
  const categoryData = stats ? Object.entries(stats.byCategory).map(([id, c]) => ({ name: CATEGORY_META[id]?.label || id, value: c.count, icon: CATEGORY_META[id]?.icon || "📋" })) : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid-bg relative overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 p-6 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Welcome back, {user?.name?.split(" ")[0]} 👋</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              {user?.role === "admin" ? "School Maintenance Command Center" : "Your School, Your Voice"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              {user?.role === "admin"
                ? "Monitor every reported issue across all schools, assign repair teams and drive resolution."
                : "Spot a broken desk, faulty light or sanitation problem? Report it now and watch it get fixed."}
            </p>
            {user?.role === "admin" ? (
              <Link to="/admin" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                <BarChart3 size={16} /> Open Admin Panel
              </Link>
            ) : (
              <Link to="/report" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                <PlusCircle size={16} /> Report an Issue
              </Link>
            )}
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="animate-float rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/75">Resolution rate</p>
              <p className="mt-1 font-display text-4xl font-extrabold">{stats ? `${stats.resolutionRate}%` : "—"}</p>
              <p className="mt-1 text-xs text-white/75">{stats?.resolved} of {stats?.total} issues resolved</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} title="Total Issues" value={stats?.total ?? "—"} trend={12} trendLabel="+12% this month" />
        <StatCard index={1} title="Pending" value={stats?.pending ?? "—"} sub="Awaiting repair assignment" />
        <StatCard index={2} title="In Progress" value={stats?.inProgress ?? "—"} sub="Repair teams on site" />
        <StatCard index={3} title="Resolved" value={stats?.resolved ?? "—"} trend={25} trendLabel={`${stats?.resolutionRate ?? 0}% resolution rate`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon size={16} className="text-brand-500" />
            <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">Issue Status Overview</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4} strokeWidth={0}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {statusData.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">Priority Distribution</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={64} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                  {priorityData.map((p) => (
                    <Cell key={p.name} fill={PRIO_COLORS[p.name]} />
                  ))}
                </Bar>
                <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Users size={16} className="text-emerald-500" />
            <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">Category Breakdown</h3>
          </div>
          <div className="h-52 space-y-2.5 overflow-y-auto pr-1">
            {categoryData
              .filter((c) => c.value > 0)
              .sort((a, b) => b.value - a.value)
              .map((c, i) => (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{c.icon} {c.name}</span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">{c.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.value / Math.max(...categoryData.map((x) => x.value))) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                    />
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">Recently Reported Issues</h3>
          <Link to={user?.role === "admin" ? "/admin" : "/issues"} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No issues reported yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}