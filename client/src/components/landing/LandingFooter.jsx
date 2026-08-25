import { Link } from "react-router-dom";
import { Mail, MapPin, Github, Heart } from "lucide-react";
import Logo from "../Logo.jsx";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "For everyone", href: "#roles" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create account", to: "/register" },
      { label: "Sign in", to: "/login" },
      { label: "Report an issue", to: "/login" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="section py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              A modern portal to report, track and resolve school facility issues — keeping every campus safe,
              functional and well-maintained.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link
                        to={l.to}
                        className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-brand-500" /> support@campuscare.school
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-brand-500" /> Campus Facilities Office
              </li>
              <li className="flex items-center gap-2">
                <Github size={15} className="text-brand-500" /> github.com/campuscare
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} CampusCare. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={14} className="text-rose-500" fill="currentColor" /> for safer schools
          </p>
        </div>
      </div>
    </footer>
  );
}
