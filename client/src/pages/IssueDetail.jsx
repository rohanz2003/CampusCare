import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Send, User, Loader2, CalendarDays, Hammer, CheckCircle2, BellRing } from "lucide-react";
import { api, errMsg, timeAgo, fmtDate } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../components/Badges.jsx";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];
const STAFF = [
  "Ramesh Kumar (Maintenance)",
  "Sunita Devi (Electrician)",
  "Mohammad Ali (Plumber)",
  "Prakash Joshi (Carpenter)",
  "Deepa Rao (Sanitation Staff)",
  "Anil Yadav (General Helper)",
];

export default function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    api
      .get(`/issues/${id}`)
      .then(({ data }) => setIssue(data.issue))
      .catch((e) => {
        toast("error", errMsg(e, "Issue not found"));
        navigate("/issues");
      });
  }, [id]);

  const update = async (body) => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/${issue.id}`, body);
      setIssue(data.issue);
      toast("success", "Issue updated");
    } catch (e) {
      toast("error", errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 2) return;
    try {
      const { data } = await api.post(`/issues/${issue.id}/comments`, { text: comment.trim() });
      setIssue(data.issue);
      setComment("");
    } catch (err) {
      toast("error", errMsg(err));
    }
  };

  const sendReminder = async () => {
    try {
      const { data } = await api.post(`/issues/${issue.id}/remind`);
      setIssue(data.issue);
      toast("success", "Reminder sent to the administration");
    } catch (err) {
      toast("error", errMsg(err, "Could not send reminder"));
    }
  };

  if (!issue) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={30} className="animate-spin text-brand-500" />
      </div>
    );
  }

  const hasPendingRepair = issue.status === "Pending" || issue.status === "In Progress";
  const alreadyReminded = issue.timeline.some((t) => /^Reminder sent/.test(t.action));
  const progress = issue.status === "Resolved" ? 100 : issue.status === "In Progress" ? 60 : 20;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/issues" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400">
        <ArrowLeft size={15} /> Back to tracking
      </Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-5 text-white dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-white/70">{issue.id}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <CategoryBadge category={issue.category} />
            </div>
            {!isAdmin && hasPendingRepair && (
              <button
                onClick={sendReminder}
                disabled={alreadyReminded}
                title={alreadyReminded ? "A reminder was already sent in the last 24 hours" : "Nudge the administration about this pending repair"}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur transition-all hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <BellRing size={13} /> {alreadyReminded ? "Reminder sent" : "Send reminder"}
              </button>
            )}
          </div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">{issue.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/85">
            <span className="inline-flex items-center gap-1.5"><MapPin size={12} /> {issue.location}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={12} /> Reported {timeAgo(issue.createdAt)}</span>
            <span className="inline-flex items-center gap-1.5"><User size={12} /> {issue.reporterName} ({issue.reporterRole})</span>
            {issue.school && <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} /> {issue.school}</span>}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Repair progress</span>
              <span>
                {progress}%{" "}
                {issue.status === "Resolved" ? "— completed" : issue.status === "In Progress" ? "— work ongoing" : "— awaiting action"}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  issue.status === "Resolved"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : issue.status === "In Progress"
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500"
                      : "bg-gradient-to-r from-amber-400 to-orange-400"
                }`}
              />
            </div>
          </div>

          <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{issue.description}</p>

          {issue.images?.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Evidence Photos & Videos</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {issue.images.map((file) =>
                  /\.(mp4|webm|mov|ogg|avi)$/i.test(file) ? (
                    <video key={file} src={file} controls className="h-28 w-full rounded-xl border border-slate-200 bg-slate-900 object-cover dark:border-slate-700" />
                  ) : (
                    <a key={file} href={file} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 transition-transform hover:scale-[1.03] dark:border-slate-700">
                      <img src={file} alt="Evidence" className="h-28 w-full object-cover" />
                    </a>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Repair team</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{issue.assignedTo || "Not assigned yet"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Estimated resolution</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{issue.estimatedResolution || "—"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Resolved on</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{issue.resolvedAt ? fmtDate(issue.resolvedAt) : "—"}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-300">
                <Hammer size={15} /> Administration Controls
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={issue.status} disabled={saving} onChange={(e) => update({ status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Assign repair team</label>
                  <select className="input" value={issue.assignedTo || ""} disabled={saving} onChange={(e) => update({ assignedTo: e.target.value })}>
                    <option value="">Select staff</option>
                    {STAFF.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={issue.priority} disabled={saving} onChange={(e) => update({ priority: e.target.value })}>
                    {["Low", "Medium", "High", "Critical"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
            <Clock size={15} className="text-brand-500" /> Action Timeline
          </h3>
          <div className="relative space-y-5 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:via-accent-400 before:to-emerald-500">
            {[...issue.timeline].reverse().map((t, i) => (
              <div key={i} className="relative pl-6">
                <span
                  className={`absolute left-0 top-1 flex h-[11px] w-[11px] items-center justify-center rounded-full ring-4 ${
                    i === 0
                      ? "bg-brand-500 ring-brand-500/20"
                      : t.action.toLowerCase().includes("resolved") || t.action.toLowerCase().includes("closed")
                        ? "bg-emerald-500 ring-emerald-500/20"
                        : "bg-slate-300 ring-slate-300/20 dark:bg-slate-600 dark:ring-slate-600/20"
                  }`}
                />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.action}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {t.by} · {timeAgo(t.at)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
            <CheckCircle2 size={15} className="text-emerald-500" /> Updates & Comments
          </h3>
          {isAdmin ? (
            <form onSubmit={addComment} className="mb-4 flex gap-2">
              <input className="input" placeholder="Post an update for the reporter..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <button type="submit" className="btn-primary shrink-0" disabled={comment.trim().length < 2}>
                <Send size={15} />
              </button>
            </form>
          ) : (
            <p className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <BellRing size={13} className="text-brand-500" />
              Updates are posted by the school administration. You'll be notified as soon as something changes.
            </p>
          )}
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {issue.timeline
              .filter((t) => !/reported and logged|verified|assigned|started|requisitioned|completed on|quality check|closed and marked|reopened|Priority changed|Assigned to/.test(t.action))
              .reverse()
              .map((t, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t.action}</p>
                  <p className="mt-1 text-xs text-slate-400">{t.by} · {timeAgo(t.at)}</p>
                </div>
              ))}
            {issue.timeline.filter((t) => !/reported and logged|verified|assigned|started|requisitioned|completed on|quality check|closed and marked|reopened|Priority changed|Assigned to/.test(t.action)).length === 0 && (
              <p className="text-sm text-slate-400">No updates yet — the administration will post updates here.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}