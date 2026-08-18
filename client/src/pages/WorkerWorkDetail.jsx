import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, MapPin, HardHat, Send, ImagePlus, Video, Clock, User } from "lucide-react";
import { api, errMsg, timeAgo } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import { StatusBadge, PriorityBadge, CategoryBadge } from "../components/Badges.jsx";

export default function WorkerWorkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { toast } = useToast();
  const [issue, setIssue] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/worker/issues/${id}`).then(({ data }) => {
      setIssue(data.issue);
      setStatus(data.issue.status);
    }).catch((e) => toast("error", errMsg(e, "Could not load task")));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (files.length === 0 && note.trim().length < 2 && status === issue.status) {
      toast("error", "Add a progress note, a photo, or change the status");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("status", status);
      if (note.trim()) fd.append("note", note.trim());
      files.forEach((f) => fd.append("images", f));
      const { data } = await api.post(`/worker/issues/${id}/progress`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setIssue(data.issue);
      setFiles([]);
      setNote("");
      toast("success", "Progress updated");
    } catch (err) {
      toast("error", errMsg(err, "Update failed"));
    } finally {
      setBusy(false);
    }
  };

  const statusFlow = useMemo(() => {
    if (!issue) return [];
    if (issue.status === "Pending") return ["In Progress"];
    if (issue.status === "In Progress") return ["Resolved"];
    return ["Pending"];
  }, [issue]);

  if (!issue) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/worker/work")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-600 dark:text-slate-400">
          <ArrowLeft size={16} /> Back to My Work
        </button>
        <div className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <button onClick={() => navigate("/worker/work")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-600 dark:text-slate-400">
        <ArrowLeft size={16} /> Back to My Work
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50/50 p-5 sm:p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">{issue.id}</span>
            <StatusBadge status={issue.status} />
            <CategoryBadge category={issue.category} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <h2 className="mt-3 font-display text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">{issue.title}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{issue.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><MapPin size={14} className="text-cyan-500" /> {issue.location || "School campus"}</span>
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><User size={14} className="text-cyan-500" /> Reported by {issue.reporterName} ({issue.reporterRole})</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><Clock size={12} /> Reported {timeAgo(issue.createdAt)}</span>
          </div>
        </div>

        {issue.images?.length > 0 && (
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
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

        {issue.progressImages?.length > 0 && (
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-500">Progress Photos & Videos</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {issue.progressImages.map((file) =>
                /\.(mp4|webm|mov|ogg|avi)$/i.test(file) ? (
                  <video key={file} src={file} controls className="h-28 w-full rounded-xl border border-slate-200 bg-slate-900 object-cover dark:border-slate-700" />
                ) : (
                  <a key={file} href={file} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 transition-transform hover:scale-[1.03] dark:border-slate-700">
                    <img src={file} alt="Progress" className="h-28 w-full object-cover" />
                  </a>
                )
              )}
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
            <Clock size={15} className="text-cyan-500" /> Task History
          </h3>
          <div className="relative space-y-5 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-teal-400 before:to-emerald-500">
            {[...issue.timeline].reverse().map((t, i) => (
              <div key={i} className="relative pl-6">
                <span
                  className={`absolute left-0 top-1 flex h-[11px] w-[11px] items-center justify-center rounded-full ring-4 ${
                    i === 0
                      ? "bg-cyan-500 ring-cyan-500/20"
                      : t.action.toLowerCase().includes("resolved") || t.action.toLowerCase().includes("completed")
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
        </div>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={submit} className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-cyan-500" />
          <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white">Update Progress</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Task status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value={issue.status}>Keep: {issue.status}</option>
              {statusFlow.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {issue.status === "Pending" && "Start work to move it to In Progress."}
              {issue.status === "In Progress" && "Mark as Resolved once the repair is complete."}
              {issue.status === "Resolved" && "Reopen the task if the problem returns."}
            </p>
          </div>
          <div>
            <label className="label">Progress photos / videos</label>
            <button type="button" onClick={() => fileRef.current?.click()} className="input flex w-full items-center justify-center gap-2 border-dashed py-3 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10">
              <ImagePlus size={16} /> {files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Attach photos or videos"}
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => setFiles([...e.target.files])} />
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {[...files].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {f.type.startsWith("video") ? <Video size={12} className="text-rose-400" /> : <ImagePlus size={12} className="text-emerald-400" />}
                    {f.name}
                    <button type="button" className="ml-1 text-slate-400 hover:text-rose-500" onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="label">Work note</label>
          <textarea className="input min-h-24 resize-y" placeholder="Describe what you did, what you found, materials used..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex items-center justify-end gap-3">
          <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Post Update
          </button>
        </div>
      </motion.form>
    </div>
  );
}