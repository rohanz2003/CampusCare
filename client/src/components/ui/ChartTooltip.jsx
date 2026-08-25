// Dark-mode-aware tooltip for recharts. Pass as <Tooltip content={<ChartTooltip />} />.
// recharts injects `active`, `payload` and `label` props at render time.
export default function ChartTooltip({ active, payload, label, valueLabel }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      {label && <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name ? `${p.name}: ` : ""}
          <span className="font-bold text-slate-900 dark:text-white">{p.value}</span>
          {valueLabel ? ` ${valueLabel}` : ""}
        </p>
      ))}
    </div>
  );
}
