import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, ImagePlus, X, Loader2, MapPin, AlertCircle, Star } from "lucide-react";
import { api, errMsg } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import { CATEGORY_META } from "../components/Badges.jsx";

const PRIORITY_INFO = {
  Low: { desc: "Minor issue — can be fixed during routine maintenance", tone: "border-slate-300 dark:border-slate-600" },
  Medium: { desc: "Noticeable issue — should be fixed within a week", tone: "border-amber-400" },
  High: { desc: "Affects daily school activity — needs prompt action", tone: "border-orange-400" },
  Critical: { desc: "Safety hazard — requires immediate attention", tone: "border-rose-500" },
};

const SUGGESTED_LOCATIONS = ["Classroom", "Computer Lab", "Science Lab", "Library", "Toilet Block", "Corridor", "Playground", "Staff Room", "Assembly Hall", "Drinking Water Station"];

export default function ReportIssue() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [meta, setMeta] = useState({ categories: [], priorities: ["Low", "Medium", "High", "Critical"] });
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "", priority: "Medium" });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get("/issues/meta").then(({ data }) => setMeta(data)).catch(() => {});
  }, []);

  const addFiles = (list) => {
    const media = [...list].filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/")).slice(0, 4 - files.length);
    setFiles((prev) => [...prev, ...media]);
  };

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 8) e.title = "Give a clear title (at least 8 characters)";
    if (form.description.trim().length < 10) e.description = "Describe the issue in detail (at least 10 characters)";
    if (!form.category) e.category = "Select a category";
    if (form.location.trim().length < 3) e.location = "Specify the location within the school";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const { data } = await api.post("/issues", form);
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        try {
          const up = await api.post(`/issues/${data.issue.id}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
          data.issue = up.data.issue;
        } catch (e2) {
          toast("error", "Issue saved but image upload failed");
        }
      }
      toast("success", `Issue ${data.issue.id} reported successfully!`);
      navigate(`/issues/${data.issue.id}`);
    } catch (err) {
      toast("error", errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid-bg relative mb-6 overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-r from-brand-600 to-accent-500 p-6 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <h2 className="font-display text-2xl font-extrabold">Report a Facility Issue</h2>
        <p className="mt-1.5 max-w-xl text-sm text-white/85">
          Help us keep the school safe and comfortable. Describe the problem, add photos and set a priority — the administration will take it from there.
        </p>
      </motion.div>

      <form onSubmit={submit} className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
            <Star size={15} className="text-brand-500" /> Issue Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input
                className="input"
                placeholder="e.g. Broken classroom desk in Room 204"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              {errors.title && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {Object.entries(CATEGORY_META).map(([id, c]) => (
                    <option key={id} value={id}>{c.icon} {c.label}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.category}</p>}
              </div>
              <div>
                <label className="label">Location within school *</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9" list="locations" placeholder="e.g. Classroom 204" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                  <datalist id="locations">
                    {SUGGESTED_LOCATIONS.map((l) => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                </div>
                {errors.location && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.location}</p>}
              </div>
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea
                className="input min-h-28 resize-y"
                placeholder="Describe what is broken, since when, and any safety concern..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              {errors.description && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.description}</p>}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-slate-800 dark:text-white">Priority Level</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {meta.priorities.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm((f) => ({ ...f, priority: p }))}
                className={`rounded-2xl border-2 p-3.5 text-left transition-all ${
                  form.priority === p
                    ? "border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10 dark:bg-brand-500/10"
                    : `${PRIORITY_INFO[p].tone} bg-white/60 hover:-translate-y-0.5 dark:bg-slate-800/60`
                }`}
              >
                <p className={`text-sm font-bold ${form.priority === p ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-200"}`}>{p}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{PRIORITY_INFO[p].desc}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card p-6">
          <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-bold text-slate-800 dark:text-white">
            <ImagePlus size={15} className="text-brand-500" /> Photos / Videos
          </h3>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Up to 4 files (photos or short videos, max 25 MB each). Media helps the repair team plan faster.</p>

          {files.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {files.map((f, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  {f.type.startsWith("video/") ? (
                    <video src={URL.createObjectURL(f)} className="h-24 w-full object-cover" muted />
                  ) : (
                    <img src={URL.createObjectURL(f)} alt={`Evidence ${i + 1}`} className="h-24 w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-8 text-slate-400 transition-all hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-500 dark:border-slate-700 dark:hover:bg-brand-500/5"
          >
            <ImagePlus size={28} />
            <span className="text-sm font-semibold">Click to upload photos or videos</span>
            <span className="text-xs">JPG, PNG, WebP · MP4, WebM (max 25 MB each)</span>
          </button>
        </motion.div>

        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base">
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} />}
          {busy ? "Submitting report..." : "Submit Issue Report"}
        </motion.button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <AlertCircle size={12} /> Your report is immediately visible to the school administration for review.
        </p>
      </form>
    </div>
  );
}