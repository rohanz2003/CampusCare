import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unread } = useNotifications(user?.id);

  const links = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
        { to: "/notifications", label: "Notifications", icon: Bell, badge: unread },
        { to: "/profile", label: "My Profile", icon: User },
      ];
    }
    return [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
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
                <Icon size={18} className={isActive ? "" : "text-slate-400 group-hover:text-brand-500"} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-white text-brand-600" : "bg-brand-500 text-white"}`}>
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
            style={{ background: user?.avatarColor || "#6366f1" }}
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl dark:bg-slate-900"
          >
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18} />
            </button>
            {sidebar}
          </motion.aside>
        </motion.div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
              <Menu size={20} />
            </button>
            <div className="flex-1">
              <p className="text-sm font-semibold capitalize text-slate-500 dark:text-slate-400">
                {location.pathname === "/" ? "Good day" : location.pathname.split("/")[1] === "" ? "" : ""}
              </p>
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {location.pathname === "/" && "Dashboard"}
                {location.pathname === "/report" && "Report an Issue"}
                {location.pathname.startsWith("/issues") && "Repair Tracking"}
                {location.pathname === "/notifications" && "Notifications"}
                {location.pathname === "/admin" && "Admin Panel"}
                {location.pathname === "/profile" && "My Profile"}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}