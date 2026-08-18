import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, User, Loader2, ShieldCheck, ClipboardCheck, Bell, Eye, EyeOff, ArrowRight, Building2, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, errMsg } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Logo from "../components/Logo.jsx";

const FEATURES = [
  { icon: ClipboardCheck, text: "Report facility issues in under a minute" },
  { icon: Wrench, text: "Track repairs from pending to resolved" },
  { icon: Bell, text: "Real-time status notifications" },
  { icon: ShieldCheck, text: "Admin-controlled accountability" },
];

const DEMO_CREDS = [
  { label: "Admin", email: "admin@campuscareschool.org", pass: "admin123" },
  { label: "Teacher", email: "aarav.sharma@campuscare.test", pass: "user123" },
  { label: "Parent", email: "priya.patel@campuscare.test", pass: "user123" },
  { label: "Worker", email: "mohammad.ali@campuscare.test", pass: "user123" },
];

export default function Login() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "parent", workerType: "" });
  const [workerTypes, setWorkerTypes] = useState([]);

  useEffect(() => {
    api.get("/issues/meta").then(({ data }) => {
      setWorkerTypes(data.workerTypes || []);
    }).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = mode === "login" ? await login(form.email, form.password) : await register(form);
      if (mode === "register") {
        toast("success", "Registration submitted! You can sign in once the school administration approves your account.");
        setMode("login");
        setForm((f) => ({ ...f, password: "" }));
      } else {
        toast("success", `Welcome back, ${res.name}!`);
        navigate(location.state?.from?.pathname || "/");
      }
    } catch (err) {
      toast("error", errMsg(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-3xl dark:bg-accent-500/10" />

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:flex-row lg:items-center lg:gap-16">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden flex-1 lg:block">
          <div className="animate-float inline-block">
            <Logo size={64} />
          </div>
          <h1 className="mt-8 font-display text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
            Keep your school <span className="text-gradient">safe, clean &amp; functional</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-slate-600 dark:text-slate-300">
            One portal for parents, teachers and administrators to report, track and resolve every facility issue.
          </p>
          <div className="stagger mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow">
                  <Icon size={16} />
                </span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-md">
          <div className="glass rounded-3xl p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="lg:hidden">
                <Logo size={40} showText={false} />
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {["login", "register"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-lg px-5 py-1.5 text-sm font-semibold capitalize transition-all ${mode === m ? "bg-white text-brand-600 shadow dark:bg-slate-900 dark:text-brand-400" : "text-slate-500"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {mode === "login" ? "Welcome back" : "Join CampusCare"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === "login" ? "Sign in to track school facility issues" : "Create an account to start reporting"}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="label">Full name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className="input pl-10" placeholder="e.g. Ananya Gupta" value={form.name} onChange={set("name")} required minLength={3} />
                    </div>
                  </div>
                  <div>
                    <label className="label">I am a</label>
                    <select className="input capitalize" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value, workerType: "" }))}>
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                      <option value="worker">Worker</option>
                    </select>
                  </div>
                  {form.role === "worker" && (
                    <div>
                      <label className="label">Worker trade category</label>
                      <select className="input" value={form.workerType} onChange={set("workerType")} required>
                        <option value="">Select your trade</option>
                        {workerTypes.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    All registrations are reviewed by the school administration. You can sign in only after your account is approved.
                  </p>
                </>
              )}

              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" className="input pl-10" placeholder="you@school.edu" value={form.email} onChange={set("email")} required />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="input pl-10 pr-11"
                    placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
                    value={form.password}
                    onChange={set("password")}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <Loader2 size={18} className="animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
                {!busy && <ArrowRight size={16} />}
              </motion.button>
            </form>

            <div className="mt-6">
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">Demo accounts — one-click login</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DEMO_CREDS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => {
                      setForm((f) => ({ ...f, email: d.email, password: d.pass }));
                      setMode("login");
                    }}
                    className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white/70 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-brand-500"
                  >
                    <Building2 size={14} className="text-brand-500" />
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">Demo passwords: admin123 / user123</p>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Secured with JWT authentication &amp; encrypted passwords
          </p>
        </motion.div>
      </div>
    </div>
  );
}