import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, errMsg } from "../lib/api.js";
import { homeFor } from "../lib/ui.js";
import { useToast } from "../components/Toast.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Field from "../components/ui/Field.jsx";

const DEMO_CREDS = [
  { label: "Admin", email: "admin@campuscareschool.org", pass: "admin123" },
  { label: "Teacher", email: "aarav.sharma@campuscare.test", pass: "user123" },
  { label: "Parent", email: "priya.patel@campuscare.test", pass: "user123" },
  { label: "Worker", email: "mohammad.ali@campuscare.test", pass: "user123" },
];

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login"); // "login" | "forgot"
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        if (!resetToken) {
          const { data } = await api.post("/auth/forgot-password", { email: form.email });
          if (data.devToken) {
            setResetToken(data.devToken);
            toast("success", data.message || "Reset link sent");
          } else {
            toast("success", data.message || `Reset link sent to ${form.email}`);
            setMode("login");
            setForm((f) => ({ ...f, password: "" }));
          }
        } else {
          await api.post("/auth/reset-password", { token: resetToken, password: form.password });
          toast("success", "Password reset successful. Sign in with your new password.");
          setResetToken("");
          setMode("login");
          setForm((f) => ({ ...f, password: "" }));
        }
        return;
      }
      const res = await login(form.email, form.password);
      toast("success", `Welcome back, ${res.name}!`);
      navigate(location.state?.from?.pathname || homeFor(res), { replace: true });
    } catch (err) {
      toast("error", errMsg(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  const showPasswordField = mode !== "forgot" || resetToken;

  return (
    <AuthShell>
      <div className="glass rounded-3xl p-6 shadow-2xl sm:p-8">
        <h2 className="text-center font-display text-xl font-bold text-slate-900 dark:text-white">
          {mode === "forgot" ? "Forgot password?" : "Welcome back"}
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === "forgot"
            ? "Enter your email and we'll help you reset it"
            : "Sign in to track your school facility issues"}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@school.edu"
            value={form.email}
            onChange={set("email")}
            required
          />

          {resetToken && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              Email service not configured — demo reset token (valid 1 hour):
              <code className="mt-1 block break-all font-mono text-[11px] font-semibold">{resetToken}</code>
            </div>
          )}

          {showPasswordField && (
            <div>
              <Field
                label={resetToken ? "New password" : "Password"}
                type={showPass ? "text" : "password"}
                icon={Lock}
                placeholder={resetToken ? "Min. 6 characters" : "Your password"}
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
              {mode === "login" && (
                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setResetToken("");
                      setForm((f) => ({ ...f, password: "" }));
                    }}
                    className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === "forgot" ? (
              resetToken ? "Reset password" : "Send reset link"
            ) : (
              "Sign in"
            )}
            {!busy && <ArrowRight size={16} />}
          </motion.button>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setResetToken("");
              }}
              className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              <ArrowRight size={12} className="rotate-180" /> Back to sign in
            </button>
          )}
        </form>

        {mode === "login" && (
          <>
            <div className="mt-6">
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Demo accounts — one-click login
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DEMO_CREDS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setForm({ email: d.email, password: d.pass })}
                    className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white/70 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-brand-500"
                  >
                    <Building2 size={14} className="text-brand-500" />
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
                Demo passwords: admin123 / user123
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Create one
              </Link>
            </p>
          </>
        )}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <CheckCircle2 size={13} className="text-emerald-500" />
        Secured with JWT authentication &amp; encrypted passwords
      </p>
    </AuthShell>
  );
}
