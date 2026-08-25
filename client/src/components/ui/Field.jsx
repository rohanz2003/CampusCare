import { forwardRef } from "react";

// Labelled input with optional leading icon, right-side element (e.g. show-password
// toggle), and error/hint text. Builds on the .input / .label CSS primitives.
const Field = forwardRef(function Field(
  { label, icon: Icon, error, hint, rightElement, className = "", containerClassName = "", ...props },
  ref
) {
  return (
    <div className={containerClassName}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          ref={ref}
          className={`input ${Icon ? "pl-10" : ""} ${rightElement ? "pr-11" : ""} ${
            error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15" : ""
          } ${className}`}
          {...props}
        />
        {rightElement && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
});

export default Field;
