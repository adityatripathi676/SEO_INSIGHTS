"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  SpinnerGap,
  FileText,
  Trash,
  CaretRight,
  CheckCircle,
  Clock,
  WarningCircle,
  Pulse,
} from "@phosphor-icons/react";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, getSpinnerColor } from "@/lib/status-utils";
import { EmptyState } from "@/components/EmptyState";

interface Job {
  id: string;
  original_prompt: string;
  snapshot_id?: string;
  status: "pending" | "running" | "analyzing" | "completed" | "failed";
  created_at: number;
  completed_at?: number;
  error?: string;
}

const statusMeta = {
  completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  failed:    { icon: WarningCircle,  color: "text-red-500",   bg: "bg-red-500/10"   },
  analyzing: { icon: Pulse,     color: "text-blue-500",  bg: "bg-blue-500/10"  },
  running:   { icon: Pulse,     color: "text-blue-500",  bg: "bg-blue-500/10"  },
  pending:   { icon: Clock,        color: "text-amber-500", bg: "bg-amber-500/10" },
};

export default function ReportsTable({ filterDemo = false }: { filterDemo?: boolean }) {
  const [allJobs, setAllJobs] = useState<Job[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) setAllJobs(await res.json());
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  // Apply demo filter
  const jobs = filterDemo
    ? (allJobs ?? []).filter((j) => !j.original_prompt.startsWith("[DEMO]"))
    : (allJobs ?? []);


  const handleRowClick = (job: Job) => {
    router.push(`/dashboard/report/${job.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this report? This cannot be undone.")) return;
    setDeletingId(jobId);
    try {
      await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      setAllJobs((prev) => prev?.filter((j) => j.id !== jobId) ?? null);
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all live reports? This cannot be undone.")) return;
    setIsClearing(true);
    try {
      await fetch("/api/jobs", { method: "DELETE" });
      setAllJobs((prev) => prev?.filter((j) => j.original_prompt.startsWith("[DEMO]")) ?? null);
    } catch {
      alert("Failed to clear reports. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  /* ── Loading skeleton ────────────────────────────────────────── */
  if (allJobs === null) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  /* ── Empty state ─────────────────────────────────────────────── */
  if (jobs.length === 0) {
    return (
      <div className="py-8 px-6">
        <EmptyState
          icon={FileText}
          title={filterDemo ? "No Live Reports Yet" : "No Reports Generated Yet"}
          description={filterDemo
            ? "Run your first live SEO audit using the form above. Real-time data from Bright Data will appear here."
            : "Enter a brand, product, or website URL in the search bar above to generate your first SEO report."
          }
        />
      </div>
    );
  }

  /* ── Reports list ────────────────────────────────────────────── */
  const completed = jobs.filter((j) => j.status === "completed").length;
  const inProgress = jobs.filter((j) =>
    ["pending", "running", "analyzing"].includes(j.status)
  ).length;

  return (
    <div>
      {/* Table — responsive */}
      <div className="divide-y divide-border/50">
        {jobs.map((job) => {
          const meta = statusMeta[job.status] ?? statusMeta.pending;
          const StatusIcon = meta.icon;
          const isActive = ["pending", "running", "analyzing"].includes(job.status);

          return (
            <div
              key={job.id}
              onClick={() => handleRowClick(job)}
              className="group flex items-center gap-3 px-5 py-3.5 cursor-pointer
                         hover:bg-black/[0.02] dark:hover:bg-white/[0.02]
                         transition-colors duration-100"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 size-9 rounded-xl flex items-center justify-center ${meta.bg}`}>
                {isActive ? (
                  <SpinnerGap
                    weight="bold"
                    className={`size-4 animate-spin ${getSpinnerColor(job.status)}`}
                  />
                ) : (
                  <StatusIcon weight="bold" className={`size-4 ${meta.color}`} />
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {job.original_prompt}
                  </span>
                  {isActive && (
                    <span className="flex-shrink-0 size-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(job.created_at)}
                  </span>
                  {job.completed_at && (
                    <>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <span className="text-xs text-muted-foreground">
                        Completed {formatDate(job.completed_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge — hidden on mobile */}
              <div className="hidden sm:block flex-shrink-0">
                <StatusBadge status={job.status} showIcon={false} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(e, job.id)}
                  disabled={deletingId === job.id}
                  className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                             hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                >
                  {deletingId === job.id ? (
                    <SpinnerGap weight="bold" className="size-3.5 animate-spin" />
                  ) : (
                    <Trash weight="bold" className="size-3.5" />
                  )}
                </Button>
                <CaretRight weight="bold" className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{jobs.length} report{jobs.length !== 1 ? "s" : ""}</span>
          {jobs.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {completed > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              {completed} completed
            </span>
          )}
          {inProgress > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
              {inProgress} in progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
