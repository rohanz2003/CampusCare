import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Users,
  GraduationCap,
  HardHat,
  Hammer,
  Zap,
  Droplets,
  Wrench,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, errMsg } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Field from "../components/ui/Field.jsx";
import Select from "../components/ui/Select.jsx";

const ROLE_OPTIONS = [
  { value: "parent", label: "Parent", icon: Users },
  { value: "teacher", label: "Teacher", icon: GraduationCap },
  { value: "worker", label: "Worker", icon: HardHat },
];

const TRADE_ICONS = {
  carpenter: Hammer,
  electrician: Zap,
  plumber: Wrench,
  sanitation: Droplets,
  general: Settings2,
};

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "parent", workerType: "" });
  const [workerTypes, setWorkerTypes] = useState([]);

  useEffect(() => {
    api
      .get("/issues/meta")
      .then(({ data }) => setWorkerTypes(data.workerTypes || []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.role === "worker" && !form.workerType) {
      toast("error", "Please select your trade category");
      return;
    }
    setBusy(true);
    try {
      await register(form);
      toast("success", "Registration submitted! You can sign in once the school administration approves your account.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast("error", errMsg(err, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      headline={
        <>
          Join the schools keeping campus <span className="text-gradient">safe &amp; well-maintained</span>
        </>
      }
      subhead="Create your account to start reporting and tracking facility issues. Registrations are reviewed by your school administration."
    >
      <div className="glass rounded-3xl p-6 shadow-2xl sm:p-8">
        <h2 className="text-center font-display text-xl font-bold text-slate-900 dark:text-white">Create your account</h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          A few details and you're ready to go
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label="Full name"
            icon={User}
            placeholder="e.g. Ananya Gupta"
            value={form.name}
            onChange={set("name")}
            required
            minLength={3}
          />

          <div>
            <label className="label">I am a</label>
            <Select
              value={form.role}
              onChange={(v) => setForm((f) => ({ ...f, role: v, workerType: "" }))}
              options={ROLE_OPTIONS}
              placeholder="Select your role"
            />
          </div>

          {form.role === "worker" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }}>
              <label className="label">Worker trade category</label>
              <Select
                value={form.workerType}
                onChange={(v) => setForm((f) => ({ ...f, workerType: v }))}
                options={workerTypes.map((t) => ({ value: t.id, label: t.label, icon: TRADE_ICONS[t.id] || Wrench }))}
                placeholder="Select your trade"
              />
            </motion.div>
          )}

          <Field
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@school.edu"
            value={form.email}
            onChange={set("email")}
            required
          />

          <Field
            label="Password"
            type={showPass ? "text" : "password"}
            icon={Lock}
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={set("password")}
            required
            minLength={6}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            All registrations are reviewed by the school administration. You can sign in only after your account is approved.
          </p>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 size={18} className="animate-spin" /> : "Create account"}
            {!busy && <ArrowRight size={16} />}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <CheckCircle2 size={13} className="text-emerald-500" />
        Secured with JWT authentication &amp; encrypted passwords
      </p>
    </AuthShell>
  );
}
