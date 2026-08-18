import { motion } from "framer-motion";
import { MapPin, Clock, ChevronRight, Camera, HardHat, ImagePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge, PriorityBadge, CategoryBadge } from "./Badges.jsx";
import { timeAgo } from "../lib/api.js";

export default function IssueCard({ issue, index = 0, linkTo = "/issues/" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`${linkTo}${issue.id}`}
        className="card group block overflow-hidden p-4 transition-shadow hover:shadow-xl hover:shadow-brand-500/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-brand-600 dark:text-brand-400">{issue.id}</span>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
            <h3 className="mt-2 truncate font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {issue.title}
            </h3>
          </div>
          <ChevronRight size={18} className="mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500 dark:text-slate-600" />
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{issue.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} className="text-brand-500" /> {issue.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} className="text-brand-500" /> {timeAgo(issue.createdAt)}
          </span>
          {issue.images?.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Camera size={12} className="text-brand-500" /> {issue.images.length} photo{issue.images.length > 1 ? "s" : ""}
            </span>
          )}
          {issue.progressImages?.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-emerald-500">
              <ImagePlus size={12} /> {issue.progressImages.length} progress
            </span>
          )}
          <CategoryBadge category={issue.category} />
        </div>

        {issue.assignedToName && (
          <div className="mt-3 border-t border-dashed border-slate-200 pt-2.5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <HardHat size={12} className="text-cyan-500" /> {issue.assignedToName}
            </span>
            {issue.assignedToType && (
              <span className="ml-1.5 capitalize">({issue.assignedToType})</span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}