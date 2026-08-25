import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  ShieldCheck,
  LogOut,
  User,
  Menu,
  X,
  School,
} from "lucide-react";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../hooks/useNotifications.js";

const TITLES = [
  { path: "/dashboard", label: "Dashboard", eyebrow: "Overview" },
  { path: "/report", label: "Report an Issue", eyebrow: "New report" },
  { path: "/issues", label: "Repair Tracking", eyebrow: "Your issues" },
  { path: "/notifications", label: "Notifications", eyebrow: "Activity" },
  { path: "/admin", label: "Admin Panel", eyebrow: "Management" },
  { path: "/profile", label: "My Profile", eyebrow: "Account" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unread } = useNotifications(user?.id);

  if (user?.role === "worker") return <Navigate to="/worker" replace />;

  const links = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
        { to: "/notifications", label: "Notifications", icon: Bell, badge: unread },
        { to: "/profile", label: "My Profile", icon: User },
      ];
    }
    return [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/report", label: "Report Issue", icon: PlusCircle },
      { to: "/issues", label: "Track Issues", icon: ClipboardList },
      { to: "/notifications", label: "Notifications", icon: Bell, badge: unread },
      { to: "/profile", label: "My Profile", icon: User },
    ];
  }, [user, unread]);

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const current =
    TITLES.find((t) => location.pathname === t.path || location.pathname.startsWith(t.path + "/")) ||
    (location.pathname.startsWith("/issues") ? { label: "Repair Tracking", eyebrow: "Your issues" } : null);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-2 pt-5">
        <Logo />
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
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500"
                    transition={{ type: "spring", damping: 24, stiffness: 300 }}
                  />
                )}
                <Icon size={18} className={isActive ? "" : "text-slate-400 group-hover:text-brand-500"} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? "bg-white text-brand-600" : "bg-brand-500 text-white"
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
            style={{ background: user?.avatarColor || "#2563eb" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="flex items-center gap-1 truncate text-[11px] capitalize text-slate-500 dark:text-slate-400">
              <School size={11} /> {user?.role}
            </p>
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
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                {current?.eyebrow || "CampusCare"}
              </p>
              <h1 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white">
                {current?.label || "CampusCare"}
              </h1>
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
