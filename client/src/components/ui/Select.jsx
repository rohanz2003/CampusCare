import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

// Animated single-select dropdown. options: [{ value, label, icon }].
export default function Select({ value, onChange, options, placeholder = "Select…", disabled = false }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 ${
          open
            ? "border-brand-500 ring-2 ring-brand-500/20"
            : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
        } ${selected ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}
      >
        <span className="flex items-center gap-2.5">
          {selected?.icon && <selected.icon size={15} className="text-brand-500" />}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <button type="button" aria-hidden className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} tabIndex={-1} />
      )}

      <AnimatePresence>
        {open && (
          <motion.ul
            key="options"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800"
          >
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    o.value === value
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  }`}
                >
                  {o.icon && <o.icon size={15} className={o.value === value ? "text-brand-500" : "text-slate-400"} />}
                  <span className="flex-1 text-left">{o.label}</span>
                  {o.value === value && <Check size={14} className="text-brand-500" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
