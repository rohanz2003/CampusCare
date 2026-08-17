const STYLES = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "In Progress": "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

const DOTS = {
  Pending: "bg-amber-500",
  "In Progress": "bg-sky-500",
  Resolved: "bg-emerald-500",
};

export function StatusBadge({ status }) {
  return (
    <span className={`chip ${STYLES[status] || "bg-slate-100 text-slate-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}

const PRIO = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  Critical: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export function PriorityBadge({ priority }) {
  return <span className={`chip ${PRIO[priority] || PRIO.Medium}`}>{priority}</span>;
}

export const CATEGORY_META = {
  furniture: { label: "Classroom Furniture", icon: "🪑" },
  electrical: { label: "Electrical / Wiring", icon: "⚡" },
  sanitation: { label: "Sanitation & Toilets", icon: "🚻" },
  plumbing: { label: "Plumbing / Water", icon: "🚰" },
  safety: { label: "Safety & Security", icon: "🛡️" },
  infrastructure: { label: "Building / Infrastructure", icon: "🏫" },
  other: { label: "Other", icon: "📋" },
};

export function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.other;
  return (
    <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
      {meta.icon} {meta.label}
    </span>
  );
}