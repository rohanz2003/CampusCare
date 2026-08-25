import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Loader2, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { api, errMsg } from "../lib/api.js";
import { useToast } from "../components/Toast.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Field from "../components/ui/Field.jsx";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast("success", "Password reset successful. Sign in with your new password.");
      navigate("/login");
    } catch (err) {
      toast("error", errMsg(err, "Reset failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      headline={
        <>
          Set a fresh password and get <span className="text-gradient">back on track</span>
        </>
      }
      subhead="Choose a new password for your CampusCare account. For your security, reset links expire after one hour."
    >
      <div className="glass rounded-3xl p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25">
            <KeyRound size={24} />
          </div>
        </div>

        <h2 className="text-center font-display text-xl font-bold text-slate-900 dark:text-white">Set a new password</h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">Choose a new password for your account</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label="New password"
            type={showPass ? "text" : "password"}
            icon={Lock}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoFocus
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

          {!token && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              This reset link is missing or invalid. Please request a new one.
            </p>
          )}

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={busy || !token} className="btn-primary w-full">
            {busy ? <Loader2 size={18} className="animate-spin" /> : "Reset password"}
            {!busy && <ArrowRight size={16} />}
          </motion.button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Back to sign in
          </Link>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck size={13} className="text-emerald-500" />
        Secured with JWT authentication &amp; encrypted passwords
      </p>
    </AuthShell>
  );
}
