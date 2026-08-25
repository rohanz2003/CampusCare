import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, Wrench, Bell, ShieldCheck } from "lucide-react";
import Logo from "../Logo.jsx";
import ThemeToggle from "../ThemeToggle.jsx";

const DEFAULT_FEATURES = [
  { icon: ClipboardCheck, text: "Report facility issues in under a minute" },
  { icon: Wrench, text: "Track repairs from pending to resolved" },
  { icon: Bell, text: "Real-time status notifications" },
  { icon: ShieldCheck, text: "Admin-controlled accountability" },
];

// Branded split-screen wrapper for auth pages: animated brand panel (left, lg+)
// and the form card (right, passed as children).
export default function AuthShell({
  children,
  headline = (
    <>
      Keep your school <span className="text-gradient">safe, clean &amp; functional</span>
    </>
  ),
  subhead = "One portal for parents, teachers and administrators to report, track and resolve every facility issue.",
  features = DEFAULT_FEATURES,
}) {
  return (
    <div className="grid-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl animate-blob dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-3xl animate-blob dark:bg-accent-500/10" style={{ animationDelay: "3s" }} />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/60 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-brand-400"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-20 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="hidden flex-1 lg:block"
        >
          <div className="animate-float inline-block">
            <Logo size={64} />
          </div>
          <h1 className="mt-8 font-display text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">{headline}</h1>
          <p className="mt-4 max-w-md text-lg text-slate-600 dark:text-slate-300">{subhead}</p>
          <div className="stagger mt-8 space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow">
                  <Icon size={16} />
                </span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
