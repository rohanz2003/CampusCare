import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Camera } from "lucide-react";
import { PriorityBadge, CATEGORY_META } from "./Badges.jsx";
import { timeAgo } from "../lib/api.js";

const STATUS_DOT = {
  Pending: "bg-amber-500",
  "In Progress": "bg-sky-500",
  Resolved: "bg-emerald-500",
};

const STATUS_TEXT = {
  Pending: "text-amber-600 dark:text-amber-400",
  "In Progress": "text-sky-600 dark:text-sky-400",
  Resolved: "text-emerald-600 dark:text-emerald-400",
};

function CategoryCell({ category }) {
  const meta = CATEGORY_META[category];
  const Icon = (meta || CATEGORY_META.other).icon;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
      <Icon size={13} className="text-slate-400" /> {meta?.label || category}
    </span>
  );
}

export default function IssueTable({ issues, linkTo = "/issues/", max = null, showLocation = true }) {
  const rows = max ? issues.slice(0, max) : issues;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center">
        <p className="font-display text-lg font-bold text-slate-700 dark:text-white">No issues to show</p>
        <p className="text-sm text-slate-400">Issues will appear here once they're reported.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 dark:border-slate-700">
            <th className="py-3 pr-4 font-semibold">Issue</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Category</th>
            <th className={`px-4 py-3 font-semibold ${showLocation ? "hidden lg:table-cell" : "hidden"}`}>Location</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Priority</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Reported</th>
            <th className="py-3 pl-4" />
          </tr>
        </thead>
        <tbody>
          {rows.map((issue) => (
            <tr key={issue.id} className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
              <td className="py-3.5 pr-4">
                <Link to={`${linkTo}${issue.id}`} className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-400">{issue.id}</span>
                  <span className="max-w-xs truncate font-semibold text-slate-800 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
                    {issue.title}
                  </span>
                  {issue.images?.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <Camera size={11} /> {issue.images.length}
                    </span>
                  )}
                </Link>
              </td>
              <td className="hidden px-4 py-3.5 md:table-cell">
                <CategoryCell category={issue.category} />
              </td>
              <td className={`px-4 py-3.5 ${showLocation ? "hidden lg:table-cell" : "hidden"}`}>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <MapPin size={12} className="text-slate-400" /> {issue.location}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${STATUS_TEXT[issue.status] || "text-slate-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[issue.status] || "bg-slate-400"}`} />
                  {issue.status}
                </span>
              </td>
              <td className="hidden px-4 py-3.5 sm:table-cell">
                <PriorityBadge priority={issue.priority} />
              </td>
              <td className="hidden px-4 py-3.5 text-xs text-slate-400 sm:table-cell">{timeAgo(issue.createdAt)}</td>
              <td className="py-3.5 pl-4 text-right">
                <ChevronRight size={15} className="ml-auto text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-slate-600" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}