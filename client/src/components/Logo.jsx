import { Wrench } from "lucide-react";

export default function Logo({ size = 44, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-lg">
          <defs>
            <linearGradient id="ccg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="1" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#ccg)" />
          <path d="M32 11 L47 18 v13 c0 10.5-6.5 18-15 21 c-8.5-3-15-10.5-15-21 V18 Z" fill="#fff" opacity="0.95" />
          <path d="M32 22 L40 26 v6.5 c0 5.5-3.4 9.4-8 11 c-4.6-1.6-8-5.5-8-11 V26 Z" fill="url(#ccg)" />
          <rect x="29.5" y="42" width="5" height="9" rx="2.5" fill="#fff" />
        </svg>
        <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-900 dark:border-slate-900 dark:bg-white">
          <Wrench size={11} className="text-brand-400 dark:text-brand-600" />
        </div>
      </div>
      {showText && (
        <div className="leading-tight">
          <p className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Campus<span className="text-gradient">Care</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            School Facility Portal
          </p>
        </div>
      )}
    </div>
  );
}