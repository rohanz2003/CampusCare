import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { LayoutDashboard, ClipboardList, Bell, LogOut, User, Menu, X, HardHat } from "lucide-react";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import { workerTypeLabel } from "../lib/ui.js";

const TITLES = [
  { path: "/worker", label: "Worker Dashboard", eyebrow: "Overview", exact: true },
  { path: "/worker/work", label: "My Assigned Work", eyebrow: "Repairs" },
  { path: "/worker/notifications", label: "Notifications", eyebrow: "Activity" },
  { path: "/worker/profile", label: "My Profile", eyebrow: "Account" },
];

export default function WorkerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unread } = useNotifications();

  const links = useMemo(
    () => [
      { to: "/worker", label: "My Dashboard", icon: LayoutDashboard, end: true },
      { to: "/worker/work", label: "My Work", icon: ClipboardList },
      { to: "/worker/notifications", label: "Notifications", icon: Bell, badge: unread },
      { to: "/worker/profile", label: "My Profile", icon: User },
    ],
    [unread]
  );

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const current =
    TITLES.find((t) => (t.exact ? location.pathname === t.path : location.pathname.startsWith(t.path))) || TITLES[0];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-2 pt-5">
        <Logo />
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-3 py-1 text-[11px] font-bold text-white shadow">
          <HardHat size={12} /> Worker · {workerTypeLabel(user?.workerType)}
        </span>
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="worker-nav-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500"
                    transition={{ type: "spring", damping: 24, stiffness: 300 }}
                  />
                )}
                <Icon size={18} className={isActive ? "" : "text-slate-400 group-hover:text-cyan-500"} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? "bg-white text-cyan-600" : "bg-cyan-500 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow"
            style={{ background: user?.avatarColor || "#06b6d4" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{workerTypeLabel(user?.workerType)}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white/80 backdrop-blur-xl lg:block dark:border-slate-800 dark:bg-slate-900/70">
        {sidebar}
      </aside>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 left-0 w-[17rem] max-w-[82vw] bg-white shadow-2xl dark:bg-slate-900"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
            {sidebar}
          </motion.aside>
        </motion.div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
                {current.eyebrow}
              </p>
              <h1 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white">{current.label}</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
