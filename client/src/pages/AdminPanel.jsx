import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, FileBarChart2, Search, Loader2, Wrench,
  School, CheckCircle2, Clock, AlertTriangle, TrendingUp, Filter, Download,
  UserCheck, UserX, Inbox, HardHat,
} from "lucide-react";
import { api, errMsg, timeAgo } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import StatCard from "../components/StatCard.jsx";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../components/Badges.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "issues", label: "Manage Issues", icon: ClipboardList },
  { id: "requests", label: "Registration Requests", icon: Inbox },
  { id: "reports", label: "Reports & KPIs", icon: FileBarChart2 },
];

const WORKER_TYPE_LABELS = {
  carpenter: "Carpenter",
  electrician: "Electrician",
  plumber: "Plumber",
  sanitation: "Sanitation Staff",
  general: "General Maintenance",
};

export default function AdminPanel() {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [issues, setIssues] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyReq, setBusyReq] = useState(null);

  const loadAll = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/reports/summary").then(({ data }) => setReport(data)).catch(() => {});
    api.get("/issues").then(({ data }) => setIssues(data.issues)).catch((e) => toast("error", errMsg(e)));
    api.get("/admin/workers").then(({ data }) => setWorkers(data.workers)).catch(() => {});
    api.get("/admin/users?status=pending").then(({ data }) => setRequests(data.users)).catch(() => {});
  };

  useEffect(loadAll, []);

  const quickUpdate = async (id, body) => {
    setBusyId(id);
    try {
      const { data } = await api.patch(`/admin/${id}`, body);
      setIssues((prev) => prev.map((i) => (i.id === id ? data.issue : i)));
      loadAll();
      toast("success", "Updated");
    } catch (e) {
      toast("error", errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  const decide = async (userId, action) => {
    setBusyReq(userId);
    try {
      await api.patch(`/admin/users/${userId}/decision`, { action });
      setRequests((prev) => prev.filter((u) => u.id !== userId));
      loadAll();
      toast("success", action === "approve" ? "Registration approved" : "Registration rejected");
    } catch (e) {
      toast("error", errMsg(e));
    } finally {
      setBusyReq(null);
    }
  };

  const workersByType = useMemo(() => {
    const groups = {};
    workers.forEach((w) => {
      const key = w.workerType || "general";
      (groups[key] = groups[key] || []).push(w);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [workers]);

  const filtered = useMemo(() => {
    if (!issues) return [];
    return issues.filter((i) => {
      if (statusF && i.status !== statusF) return false;
      if (q) {
        const needle = q.toLowerCase();
        return i.title.toLowerCase().includes(needle) || i.id.toLowerCase().includes(needle) || i.location.toLowerCase().includes(needle);
      }
      return true;
    });
  }, [issues, q, statusF]);

  const kpiCards = stats && [
    { title: "Total Issues", value: stats.total, icon: ClipboardList, tone: "brand", trend: 12, trendLabel: "platform-wide" },
    { title: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: TrendingUp, tone: "emerald", sub: `avg ${stats.avgResolutionDays} days to resolve` },
    { title: "Pending Work", value: stats.pending, icon: AlertTriangle, tone: "amber", sub: "awaiting assignment" },
    { title: "Active Contributors", value: stats.totalUsers, icon: School, tone: "sky", sub: "approved parents, teachers & workers" },
  ];

  const downloadCsv = () => {
    if (!report) return;
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["School", "Total Issues", "Pending", "In Progress", "Resolved", "Resolution Rate %"],
      ...report.bySchool.map((s) => [s.name, s.total, s.pending, s.inProgress, s.resolved, s.total ? Math.round((s.resolved / s.total) * 100) : 0]),
      [],
      ["Staff Member", "Active Assignments"],
      ...Object.entries(report.staffWorkload).map(([name, n]) => [name, n]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuscareschool-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Administration Panel</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Assign repair tasks, update statuses and monitor school performance</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                tab === id ? "bg-white text-brand-600 shadow dark:bg-slate-900 dark:text-brand-400" : "text-slate-500"
              }`}
            >
              <Icon size={15} /> {label}
              {id === "requests" && requests.length > 0 && (
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${tab === id ? "bg-brand-600 text-white" : "bg-amber-500 text-white"}`}>
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <>
          {!stats ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand-500" /></div>
          ) : (
            <>
              <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((k, i) => (
                  <StatCard key={k.title} index={i} {...k} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
                  <h3 className="mb-4 font-display text-sm font-bold text-slate-800 dark:text-white">Status distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }} />
                        <Bar dataKey="value" name="Issues" radius={[8, 8, 0, 0]}>
                          {Object.entries(stats.byStatus).map(([name]) => (
                            <Cell key={name} fill={name === "Resolved" ? "#10b981" : name === "In Progress" ? "#0ea5e9" : "#f59e0b"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
                  <h3 className="mb-4 font-display text-sm font-bold text-slate-800 dark:text-white">Recent activity</h3>
                  <div className="space-y-3">
                    {report?.recentActivity?.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.type === "resolved" ? "bg-emerald-500" : a.type === "progress" ? "bg-sky-500" : "bg-amber-500"}`} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{a.title}</p>
                          <p className="truncate text-xs text-slate-400">{a.message} · {timeAgo(a.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </>
      )}

      {tab === "issues" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" placeholder="Search issues..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="w-48">
              <select className="input" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
                <option value="">All statuses</option>
                {["Pending", "In Progress", "Resolved"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-700">
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assign Team</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!issues ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 size={22} className="mx-auto animate-spin text-brand-500" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No issues match</td></tr>
                ) : (
                  filtered.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="max-w-xs px-4 py-3">
                        <Link to={`/issues/${i.id}`} className="font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400">
                          {i.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className="font-mono text-[10px] text-slate-400">{i.id}</span>
                          <PriorityBadge priority={i.priority} />
                          <CategoryBadge category={i.category} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 dark:text-slate-200">{i.reporterName}</p>
                        <p className="text-[11px] capitalize text-slate-400">{i.reporterRole} · {timeAgo(i.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="input w-36 !py-1.5 text-xs"
                          value={i.status}
                          disabled={busyId === i.id}
                          onChange={(e) => quickUpdate(i.id, { status: e.target.value })}
                        >
                          {["Pending", "In Progress", "Resolved"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="input w-56 !py-1.5 text-xs"
                          value={i.assignedToId || ""}
                          disabled={busyId === i.id}
                          onChange={(e) => quickUpdate(i.id, { assignedToId: e.target.value })}
                        >
                          <option value="">Unassigned</option>
                          {workersByType.map(([type, list]) => (
                            <optgroup key={type} label={WORKER_TYPE_LABELS[type] || type}>
                              {list.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name} ({w.activeAssignments} active)
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {i.assignedToName && (
                          <p className="mt-1 text-[10px] font-medium text-slate-400">{i.assignedToName} · {WORKER_TYPE_LABELS[i.assignedToType] || i.assignedToType}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {busyId === i.id ? (
                          <Loader2 size={15} className="animate-spin text-brand-500" />
                        ) : (
                          <Link to={`/issues/${i.id}`} className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                            Details →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "requests" && (
        <>
          <div className="flex items-center gap-2">
            <HardHat size={15} className="text-brand-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New parent, teacher and worker registrations awaiting your approval. They can only sign in after approval.
            </p>
          </div>
          {requests.length === 0 ? (
            <div className="card flex flex-col items-center gap-2 py-16 text-center">
              <Inbox size={32} className="text-slate-300 dark:text-slate-600" />
              <p className="font-display text-lg font-bold text-slate-700 dark:text-white">No pending requests</p>
              <p className="text-sm text-slate-400">All registrations have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow" style={{ background: u.avatarColor || "#6366f1" }}>
                      {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800 dark:text-white">{u.name}</p>
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="chip bg-brand-50 capitalize text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{u.role}</span>
                        {u.role === "worker" && (
                          <span className="chip bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                            <HardHat size={11} /> {WORKER_TYPE_LABELS[u.workerType] || u.workerType}
                          </span>
                        )}
                        {u.school && u.school !== "Not Specified" && u.school !== "Unregistered School" && (
                          <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><School size={11} /> {u.school}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">Requested {timeAgo(u.createdAt)}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => decide(u.id, "approve")}
                      disabled={busyReq === u.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {busyReq === u.id ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />} Approve
                    </button>
                    <button
                      onClick={() => decide(u.id, "reject")}
                      disabled={busyReq === u.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-60 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                    >
                      <UserX size={13} /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "reports" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">KPIs, school performance and staff workload — downloadable as CSV.</p>
            <button onClick={downloadCsv} className="btn-primary text-xs">
              <Download size={14} /> Export CSV report
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
                <School size={15} className="text-brand-500" /> Performance by school
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report?.bySchool || []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }} />
                    <Bar dataKey="total" name="Total" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#0ea5e9" />
                    <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
                <Wrench size={15} className="text-sky-500" /> Staff workload
              </h3>
              <div className="space-y-3.5">
                {Object.entries(report?.staffWorkload || {}).map(([staff, n]) => (
                  <div key={staff}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{staff}</span>
                      <span className="font-bold text-slate-500">{n} active</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((n / Math.max(1, Math.max(...Object.values(report.staffWorkload)))) * 100, 100)}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(report?.staffWorkload || {}).length === 0 && <p className="py-6 text-center text-sm text-slate-400">No assignments yet.</p>}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card overflow-x-auto p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
              <Filter size={15} className="text-emerald-500" /> School-wise summary table
            </h3>
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-700">
                  <th className="py-2.5 pr-4">School</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">Pending</th>
                  <th className="px-4 py-2.5">In Progress</th>
                  <th className="px-4 py-2.5">Resolved</th>
                  <th className="px-4 py-2.5">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(report?.bySchool || []).map((s) => (
                  <tr key={s.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">{s.name}</td>
                    <td className="px-4 py-3">{s.total}</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{s.pending}</td>
                    <td className="px-4 py-3 text-sky-600 dark:text-sky-400">{s.inProgress}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{s.resolved}</td>
                    <td className="px-4 py-3">
                      <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 size={11} /> {s.total ? Math.round((s.resolved / s.total) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      )}
    </div>
  );
}