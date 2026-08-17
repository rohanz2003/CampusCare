import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ClipboardList, X, Loader2 } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import IssueCard from "../components/IssueCard.jsx";
import { StatusBadge } from "../components/Badges.jsx";

const FILTER_BUTTON = (active) =>
  `rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
    active ? "bg-brand-600 text-white shadow-md shadow-brand-500/25" : "bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
  }`;

export default function Tracking() {
  const { user } = useAuth();
  const [issues, setIssues] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", category: "", q: "" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api
      .get("/issues")
      .then(({ data }) => setIssues(data.issues))
      .catch(() => setIssues([]));
  }, [user]);

  const counts = useMemo(() => {
    const base = issues || [];
    return {
      all: base.length,
      Pending: base.filter((i) => i.status === "Pending").length,
      "In Progress": base.filter((i) => i.status === "In Progress").length,
      Resolved: base.filter((i) => i.status === "Resolved").length,
    };
  }, [issues]);

  const filtered = useMemo(() => {
    if (!issues) return [];
    return issues.filter((i) => {
      if (filters.status && i.status !== filters.status) return false;
      if (filters.priority && i.priority !== filters.priority) return false;
      if (filters.category && i.category !== filters.category) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!i.title.toLowerCase().includes(q) && !i.location.toLowerCase().includes(q) && !i.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [issues, filters]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Repair Tracking</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user?.role === "admin" ? "All issues across your schools" : "Follow the lifecycle of every issue you reported"}
          </p>
        </div>
        <div className="flex gap-2">
          {[
            ["", "All", counts.all],
            ["Pending", "Pending", counts.Pending],
            ["In Progress", "In Progress", counts["In Progress"]],
            ["Resolved", "Resolved", counts.Resolved],
          ].map(([val, label, n]) => (
            <button key={val} onClick={() => setFilters((f) => ({ ...f, status: val }))} className={FILTER_BUTTON(filters.status === val)}>
              {label} <span className="opacity-70">({n})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by title, location or issue ID..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
        </div>
        <button onClick={() => setShowFilters((s) => !s)} className={`btn-ghost ${showFilters ? "border-brand-500 text-brand-600" : ""}`}>
          <Filter size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card flex flex-wrap items-end gap-4 p-4">
          <div className="w-44">
            <label className="label">Priority</label>
            <select className="input" value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
              <option value="">All priorities</option>
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="w-52">
            <label className="label">Category</label>
            <select className="input" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
              <option value="">All categories</option>
              {["furniture", "electrical", "sanitation", "plumbing", "safety", "infrastructure", "other"].map((c) => (
                <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setFilters({ status: "", priority: "", category: "", q: "" })}
            className="btn-ghost text-xs"
          >
            <X size={13} /> Clear filters
          </button>
        </motion.div>
      )}

      {issues === null ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <ClipboardList size={36} className="text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-500 dark:text-slate-400">No issues match your filters</p>
          <p className="max-w-xs text-xs text-slate-400 dark:text-slate-500">Try clearing filters or report a new issue to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}