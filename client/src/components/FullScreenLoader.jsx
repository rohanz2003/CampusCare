import { Loader2 } from "lucide-react";

// Shown while the session is being verified. The route guards used to render
// null here, which looked exactly like a crashed app on slow connections.
export default function FullScreenLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <Loader2 size={26} className="animate-spin text-brand-500" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
