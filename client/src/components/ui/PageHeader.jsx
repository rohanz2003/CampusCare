import { motion } from "framer-motion";

// Standard in-app page header: gradient icon tile + title/subtitle on the left,
// optional actions on the right. Replaces the duplicated header blocks per page.
const TONES = {
  brand: "from-brand-600 to-accent-500 shadow-brand-500/30",
  worker: "from-cyan-600 to-teal-500 shadow-cyan-500/30",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/30",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
};

export default function PageHeader({ icon: Icon, title, subtitle, actions, tone = "brand", className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${
              TONES[tone] || TONES.brand
            }`}
          >
            <Icon size={22} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.7rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
