import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Camera,
  MapPin,
  Activity,
  Bell,
  ShieldCheck,
  BarChart3,
  Route,
  ClipboardList,
  UserCheck,
  Wrench,
  CheckCircle2,
  Users,
  GraduationCap,
  HardHat,
  Sparkles,
  ChevronDown,
  Clock,
} from "lucide-react";
import LandingNav from "../components/landing/LandingNav.jsx";
import LandingFooter from "../components/landing/LandingFooter.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import AnimatedCounter from "../components/ui/AnimatedCounter.jsx";

const EASE = [0.22, 1, 0.36, 1];

const STATS = [
  { value: 1240, suffix: "+", label: "Issues resolved" },
  { value: 18, suffix: "h", label: "Avg. response time" },
  { value: 45, suffix: "+", label: "Schools onboarded" },
  { value: 98, suffix: "%", label: "Satisfaction rate" },
];

const FEATURES = [
  { icon: Camera, title: "Report in seconds", desc: "Snap a photo, drop a location and pick a category. Anyone on campus can raise an issue in under a minute.", tone: "brand" },
  { icon: Activity, title: "Real-time tracking", desc: "Follow every report through Pending → In Progress → Resolved with a live status timeline.", tone: "sky" },
  { icon: Route, title: "Smart assignment", desc: "Admins route each issue to the right trade — carpenter, electrician, plumber or sanitation.", tone: "cyan" },
  { icon: Bell, title: "Instant notifications", desc: "Reporters and workers are alerted the moment a status changes or a repair is completed.", tone: "amber" },
  { icon: ShieldCheck, title: "Role-based access", desc: "Tailored dashboards for parents, teachers, administrators and repair staff — secure by design.", tone: "emerald" },
  { icon: BarChart3, title: "Insights & analytics", desc: "Spot recurring problems and track resolution performance with clear visual reports.", tone: "rose" },
];

const FEATURE_TONES = {
  brand: "from-brand-500 to-brand-600 shadow-brand-500/30",
  sky: "from-sky-500 to-cyan-500 shadow-sky-500/30",
  cyan: "from-cyan-500 to-teal-500 shadow-cyan-500/30",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/30",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
};

const STEPS = [
  { icon: ClipboardList, title: "Report the issue", desc: "A parent or teacher submits a facility problem with photos, location and priority." },
  { icon: UserCheck, title: "Review & assign", desc: "An administrator verifies the report and assigns it to the right repair specialist." },
  { icon: Wrench, title: "Repair in progress", desc: "The worker updates progress and uploads photos as the fix moves forward." },
  { icon: CheckCircle2, title: "Resolved & notified", desc: "Everyone involved is notified the moment the issue is marked resolved." },
];

const ROLES = [
  { icon: Users, title: "Parents", desc: "Report concerns about your child's school environment and track resolution transparently.", color: "text-brand-500" },
  { icon: GraduationCap, title: "Teachers", desc: "Flag classroom and facility issues quickly so learning is never interrupted.", color: "text-sky-500" },
  { icon: ShieldCheck, title: "Administrators", desc: "Triage, assign and oversee every repair with a full analytics dashboard.", color: "text-emerald-500" },
  { icon: HardHat, title: "Repair staff", desc: "Receive assigned jobs by trade, update progress and close out completed work.", color: "text-cyan-500" },
];

const FAQS = [
  { q: "Who can report an issue?", a: "Any registered parent or teacher can submit a facility issue. Administrators review and assign them to repair staff." },
  { q: "Is there a cost to use CampusCare?", a: "CampusCare is designed as a school facility portal — getting started and creating an account is free." },
  { q: "How are repair workers assigned?", a: "Administrators assign each issue to the appropriate trade — carpenter, electrician, plumber, sanitation or general maintenance — based on the problem." },
  { q: "Will I be notified about updates?", a: "Yes. Reporters and assigned workers receive in-app notifications whenever a status changes or a repair is completed." },
  { q: "Does it work on mobile?", a: "Absolutely. CampusCare is fully responsive and works beautifully on phones, tablets and desktops." },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-slate-800 dark:text-white">{faq.q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-brand-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating product mockup shown in the hero — a miniature of the real dashboard.
function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
      className="relative mx-auto w-full max-w-md lg:max-w-lg"
    >
      {/* glow */}
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand-500/30 to-accent-500/30 blur-3xl" />

      <div className="glass rounded-3xl p-4 shadow-elevated sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">Overview</p>
            <p className="font-display text-base font-bold text-slate-900 dark:text-white">Facility Dashboard</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg">
            <Activity size={16} />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Pending", value: 8, dot: "bg-amber-500", tint: "text-amber-600 dark:text-amber-400" },
            { label: "In Progress", value: 5, dot: "bg-sky-500", tint: "text-sky-600 dark:text-sky-400" },
            { label: "Resolved", value: 27, dot: "bg-emerald-500", tint: "text-emerald-600 dark:text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-800/50">
              <span className={`flex items-center gap-1 text-[10px] font-semibold ${s.tint}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
              </span>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {[
            { id: "#1042", title: "Broken window — Room 204", status: "Pending", dot: "bg-amber-500" },
            { id: "#1041", title: "Flickering lights — Lab B", status: "In Progress", dot: "bg-sky-500" },
            { id: "#1039", title: "Leaking tap — Washroom", status: "Resolved", dot: "bg-emerald-500" },
          ].map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-800/40">
              <span className="font-mono text-[10px] font-semibold text-brand-600 dark:text-brand-400">{r.id}</span>
              <span className="flex-1 truncate text-xs font-medium text-slate-700 dark:text-slate-200">{r.title}</span>
              <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} /> {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* floating chips */}
      <motion.div
        className="absolute -left-5 top-16 hidden rounded-2xl border border-slate-200/70 bg-white p-3 shadow-elevated sm:block dark:border-slate-700 dark:bg-slate-900"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 size={16} />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-800 dark:text-white">Repair complete</p>
            <p className="text-[9px] text-slate-400">2 minutes ago</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-4 bottom-14 hidden rounded-2xl border border-slate-200/70 bg-white p-3 shadow-elevated sm:block dark:border-slate-700 dark:bg-slate-900"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-brand-500">
            <Bell size={16} />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-800 dark:text-white">New assignment</p>
            <p className="text-[9px] text-slate-400">Electrician · Lab B</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNav />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        {/* decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl animate-blob dark:bg-brand-600/20" />
          <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-accent-400/30 blur-3xl animate-blob dark:bg-accent-500/20" style={{ animationDelay: "3s" }} />
        </div>

        <div className="section grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
            >
              <Sparkles size={14} /> School facility care, reimagined
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
              className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              Report, track & resolve <span className="text-gradient-animated">school facility</span> issues effortlessly.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg"
            >
              CampusCare connects parents, teachers, administrators and repair staff on one modern portal — so
              every broken window, flickering light and leaking tap gets fixed faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                Get started free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-ghost px-6 py-3 text-base">
                Sign in to your account
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
            >
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> Free to get started</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={15} className="text-brand-500" /> Set up in minutes</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-cyan-500" /> Role-based & secure</span>
            </motion.div>
          </div>

          <HeroMockup />
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="section grid grid-cols-2 gap-6 py-10 sm:py-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <p className="font-display text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="section scroll-mt-20 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">Features</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything you need to keep campus running
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            From the first report to the final fix, CampusCare gives every role the tools to act fast.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.1}>
              <div className="card-interactive h-full p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${FEATURE_TONES[f.tone]}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="scroll-mt-20 border-y border-slate-200 bg-slate-50/70 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-24">
        <div className="section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">How it works</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Four simple steps to a fix
            </h2>
          </Reveal>

          <div className="relative mt-14 grid gap-8 md:grid-cols-4">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent md:block dark:via-brand-500/40" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <s.icon size={24} className="text-brand-600 dark:text-brand-400" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 text-[11px] font-bold text-white shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ROLES ---------- */}
      <section id="roles" className="section scroll-mt-20 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">For everyone</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            One portal, built for every role
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Each person gets a dashboard tailored to what they do — nothing more, nothing less.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={(i % 4) * 0.08}>
              <div className="card-interactive group h-full p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-brand-50 dark:bg-slate-800 dark:group-hover:bg-brand-500/10">
                  <r.icon size={28} className={r.color} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-slate-50/70 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-24">
        <div className="section max-w-3xl">
          <Reveal className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-500">FAQ</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.05}>
                <FaqItem faq={faq} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section py-20 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 px-6 py-16 text-center shadow-elevated sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to make your campus safer?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-white/90">
              Join the schools already resolving facility issues faster with CampusCare. Create your account in
              minutes — it's free to get started.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn inline-flex bg-white px-6 py-3 text-base text-brand-700 shadow-lg hover:-translate-y-0.5 hover:bg-slate-50">
                Create free account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn inline-flex border border-white/40 px-6 py-3 text-base text-white hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  );
}
