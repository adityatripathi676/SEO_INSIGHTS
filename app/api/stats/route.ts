// app/api/stats/route.ts
// GET /api/stats — Live aggregated dashboard metrics from SQLite
import { NextResponse } from "next/server";
import { getAllJobs } from "@/lib/db";

export interface DashboardStats {
  totalReports: number;
  completedReports: number;
  failedReports: number;
  activeJobs: number;
  avgSeoScore: number;
  cacheHits: number;
  successRate: number;
}

const ZERO_STATS: DashboardStats = {
  totalReports: 0,
  completedReports: 0,
  failedReports: 0,
  activeJobs: 0,
  avgSeoScore: 0,
  cacheHits: 0,
  successRate: 0,
};

export async function GET() {
  try {
    const allJobs = getAllJobs();

    // Exclude demo seed jobs from live stats
    const liveJobs = allJobs.filter(
      (j) => !j.original_prompt.startsWith("[DEMO]")
    );

    if (liveJobs.length === 0) {
      return NextResponse.json(ZERO_STATS);
    }

    const completed = liveJobs.filter((j) => j.status === "completed");
    const failed = liveJobs.filter((j) => j.status === "failed");
    const active = liveJobs.filter((j) =>
      ["pending", "running", "analyzing"].includes(j.status)
    );

    // Calculate average SEO score from completed reports
    let scoreSum = 0;
    let scoreCount = 0;
    for (const job of completed) {
      try {
        const report = job.seo_report as { summary?: { overall_seo_score?: number } } | null;
        const score = report?.summary?.overall_seo_score;
        if (typeof score === "number" && score >= 0 && score <= 100) {
          scoreSum += score;
          scoreCount++;
        }
      } catch {
        // skip malformed reports
      }
    }

    const avgSeoScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
    const successRate =
      liveJobs.length > 0
        ? Math.round((completed.length / liveJobs.length) * 100)
        : 0;

    // Approximate cache hits: completed jobs that were created within 1s of completion
    const cacheHits = completed.filter((j) => {
      const created = j.created_at ?? 0;
      const done = j.completed_at ?? 0;
      return done - created < 2000; // under 2s = cache hit
    }).length;

    const stats: DashboardStats = {
      totalReports: liveJobs.length,
      completedReports: completed.length,
      failedReports: failed.length,
      activeJobs: active.length,
      avgSeoScore,
      cacheHits,
      successRate,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Stats] Failed to compute stats:", error);
    return NextResponse.json(ZERO_STATS);
  }
}
