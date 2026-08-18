import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, HardHat } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import IssueCard from "../components/IssueCard.jsx";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [work, setWork] = useState([]);

  useEffect(() => {
    api.get("/worker/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/worker/issues").then(({ data }) => setWork(data.issues)).catch(() => {});
  }, []);

  const active = work.filter((i) => i.status !== "Resolved");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid-bg relative overflow-hidden rounded-3xl border border-cyan-200/60 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 p-6 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Welcome back, {user?.name?.split(" ")[0]} 👷</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Your Repair Workspace</h2>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              {active.length > 0
                ? `You have ${active.length} open task${active.length > 1 ? "s" : ""} awaiting your attention. Keep the school in top shape!`
                : "You're all caught up — no open tasks right now."}
            </p>
            <Link to="/worker/work" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-cyan-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <ClipboardList size={16} /> View My Work
            </Link>
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="animate-float rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur">
              <HardHat size={26} className="mb-1" />
              <p className="text-xs font-semibold uppercase tracking-widest text-white/75">Completion rate</p>
              <p className="mt-1 font-display text-4xl font-extrabold">{stats?.assigned ? Math.round((stats.resolved / stats.assigned) * 100) : 0}%</p>
              <p className="mt-1 text-xs text-white/75">{stats?.resolved} of {stats?.assigned} assigned tasks resolved</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} title="Assigned Tasks" value={stats?.assigned ?? "—"} sub="Total work assigned to you" />
        <StatCard index={1} title="Pending" value={stats?.pending ?? "—"} sub="Awaiting your start" />
        <StatCard index={2} title="In Progress" value={stats?.inProgress ?? "—"} sub="Currently working on" />
        <StatCard index={3} title="Resolved" value={stats?.resolved ?? "—"} sub="Completed repairs" />
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">My Assigned Issues</h3>
          <Link to="/worker/work" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {work.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No issues assigned to you yet. The admin will assign you work soon.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {work.slice(0, 6).map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} linkTo="/worker/work/" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}