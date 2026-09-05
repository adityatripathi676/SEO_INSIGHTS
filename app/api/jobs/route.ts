// app/api/jobs/route.ts
// GET /api/jobs — List all scraping jobs
import { NextResponse } from "next/server";
import { getAllJobs, deleteAllJobs } from "@/lib/db";

export async function GET() {
  try {
    const jobs = getAllJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("[Jobs] Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Only deletes live reports, preserves demo reports
    deleteAllJobs(true);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Jobs] Error deleting all jobs:", error);
    return NextResponse.json(
      { error: "Failed to delete jobs" },
      { status: 500 }
    );
  }
}
