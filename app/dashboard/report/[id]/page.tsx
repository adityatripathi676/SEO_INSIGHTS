"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import {
  getSpinnerColor,
  getProgressPercentage,
  getProgressBarStyle,
  getReportTitle,
  getStatusMessage,
  formatDateTime,
} from "@/lib/status-utils";

interface Job {
  id: string;
  original_prompt: string;
  snapshot_id?: string;
  status: "pending" | "running" | "analyzing" | "completed" | "failed";
  created_at: number;
  completed_at?: number;
  error?: string;
  results?: unknown[];
}

/* ── Small detail row ─────────────────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 size-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`text-sm text-foreground mt-0.5 truncate ${mono ? "font-mono text-xs" : "font-medium"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (res.status === 404) { setJob(null); return; }
      if (res.ok) setJob(await res.json());
    } catch { /* silently fail */ }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchJob();
    const interval = setInterval(() => {
      if (job?.status === "completed" || job?.status === "failed") {
        clearInterval(interval);
        return;
      }
      fetchJob();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, job?.status, fetchJob]);

  // Auto-redirect when completed
  useEffect(() => {
    if (job?.status === "completed" && id) {
      setTimeout(() => router.push(`/dashboard/report/${id}/summary`), 800);
    }
  }, [job?.status, id, router]);

  const handleRetry = async () => {
    if (!job) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: job.original_prompt }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/dashboard/report/${data.jobId}`);
      else setRetryError(data.error || "Failed to retry");
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsRetrying(false);
    }
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/report/${id}/cancel`, { method: "POST" });
      if (res.ok) fetchJob();
    } catch { /* silently fail */ }
    finally { setIsCancelling(false); }
  };

  /* ── Loading ─────────────────────────────────────────────────── */
  if (!id || job === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  /* ── Not found ───────────────────────────────────────────────── */
  if (job === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-3" />
          <p className="font-semibold text-foreground">Report not found</p>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mt-4 text-sm">
              <ArrowLeft className="size-3.5 mr-1.5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = ["pending", "running", "analyzing"].includes(job.status);
  const progressPct = getProgressPercentage(job.status);

  return (
    <div className="page-enter px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">

        {/* ── Back nav ─────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>

        {/* ── Status card ──────────────────────────────────────── */}
        <div className="glass-strong rounded-2xl shadow-apple-md overflow-hidden">

          {/* Top section */}
          <div className="px-6 pt-8 pb-6 text-center">
            {/* Spinner / icon */}
            <div className="flex justify-center mb-4">
              {isActive ? (
                <div className="relative size-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
                    style={{ animationDuration: "0.9s" }}
                  />
                  <Loader2 className={`size-6 animate-spin ${getSpinnerColor(job.status)}`} />
                </div>
              ) : job.status === "completed" ? (
                <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-green-500" />
                </div>
              ) : (
                <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="size-8 text-red-500" />
                </div>
              )}
            </div>

            <StatusBadge status={job.status} showIcon={false} />

            <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              {getReportTitle(job.status)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {getStatusMessage(job.status)}
            </p>

            {/* Progress bar */}
            {isActive && (
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium tabular-nums">{progressPct}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getProgressBarStyle(job.status)}`}
                    style={{ width: progressPct }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Details grid ─────────────────────────────────────── */}
          <div className="px-6 pb-6 border-t border-border/60">
            <div className="pt-5 grid sm:grid-cols-2 gap-4">
              <DetailRow
                icon={FileText}
                label="Query"
                value={job.original_prompt}
              />
              <DetailRow
                icon={Calendar}
                label="Started"
                value={formatDateTime(job.created_at)}
              />
              {job.completed_at && (
                <DetailRow
                  icon={CheckCircle2}
                  label="Completed"
                  value={formatDateTime(job.completed_at)}
                />
              )}
              {job.snapshot_id && (
                <DetailRow
                  icon={BarChart3}
                  label="Snapshot ID"
                  value={job.snapshot_id}
                  mono
                />
              )}
            </div>

            {/* Error box */}
            {job.error && (
              <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20">
                <XCircle className="size-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-0.5">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {job.error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────────── */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2.5">
            {job.status === "completed" && (
              <Link href={`/dashboard/report/${id}/summary`} className="flex-1">
                <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white border-0 font-semibold text-sm shadow-apple">
                  View Full Report
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            )}

            {job.status === "failed" && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white border-0 font-semibold text-sm"
              >
                {isRetrying ? (
                  <><Loader2 className="size-4 animate-spin mr-2" />Retrying…</>
                ) : (
                  "Retry Analysis"
                )}
              </Button>
            )}

            {isActive && (
              <Button
                onClick={handleCancel}
                disabled={isCancelling}
                variant="destructive"
                className="flex-1 h-11 rounded-xl font-semibold text-sm bg-red-500 hover:bg-red-600 border-0"
              >
                {isCancelling ? (
                  <><Loader2 className="size-4 animate-spin mr-2" />Stopping…</>
                ) : (
                  "Stop Generation"
                )}
              </Button>
            )}

            <Link href="/dashboard" className={isActive ? "" : "flex-1"}>
              <Button
                variant="ghost"
                className="w-full h-11 px-5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              >
                <ArrowLeft className="size-4 mr-1.5" />
                Dashboard
              </Button>
            </Link>
          </div>

          {retryError && (
            <p className="px-6 pb-4 text-sm text-red-600 dark:text-red-400 text-center">
              {retryError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
