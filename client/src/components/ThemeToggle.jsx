import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative flex h-9 w-16 items-center rounded-full border border-slate-300 bg-slate-200 p-1 transition-colors dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow transition-transform duration-300 dark:bg-slate-950 ${
          theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? <Moon size={14} className="text-brand-400" /> : <Sun size={14} className="text-amber-500" />}
      </span>
      <Sun size={13} className="absolute left-2 text-amber-500" />
      <Moon size={13} className="absolute right-2 text-brand-400" />
    </button>
  );
}