import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

const TONES = {
  brand: "from-brand-500 to-brand-600 shadow-brand-500/30",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/30",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
  sky: "from-sky-500 to-cyan-500 shadow-sky-500/30",
};

export default function StatCard({ title, value, sub, icon: Icon, tone = "brand", trend, trendLabel, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      className="card group relative overflow-hidden p-5"
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-25 ${TONES[tone]}`} />
      <div className={`flex items-start ${Icon ? "justify-between" : ""}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1.5 font-display text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${TONES[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          {trend >= 0 ? (
            <ArrowUpRight size={14} className="text-emerald-500" />
          ) : (
            <ArrowDownRight size={14} className="text-rose-500" />
          )}
          <span className={trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>{trendLabel || `${Math.abs(trend)}%`}</span>
        </div>
      )}
      {sub && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </motion.div>
  );
}