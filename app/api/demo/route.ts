// app/api/demo/route.ts
// POST /api/demo — Seeds a pre-built demo SEO report into the local SQLite DB.
// No API calls to Bright Data or Gemini — instant result for demos.
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createJob, saveSeoReport, saveRawResults, completeJob, getAllJobs, deleteJob } from "@/lib/db";
import { DEMO_REPORT } from "@/lib/demo-report";

export async function POST() {
  try {
    // Remove any existing demo jobs to keep dashboard clean
    const existing = getAllJobs();
    for (const job of existing) {
      if (job.original_prompt.startsWith("[DEMO]")) {
        deleteJob(job.id);
      }
    }

    const jobId = uuidv4();

    // Create the job record
    createJob(jobId, "[DEMO] Google — SEO Analysis Demo");

    // Inject mock raw results so "retry analysis" also works
    saveRawResults(jobId, [
      {
        prompt: "Comprehensive SEO analysis of Google",
        answer_text: "Google is the world's most visited website and dominant search engine...",
        sources: [{ title: "Google Homepage", url: "https://google.com", description: "Official Google search portal" }],
        timestamp: new Date().toISOString(),
        url: "https://www.perplexity.ai",
      },
    ]);

    // Inject the pre-built report and mark complete
    saveSeoReport(jobId, DEMO_REPORT);
    completeJob(jobId);

    return NextResponse.json({ jobId, message: "Demo report created" });
  } catch (error) {
    console.error("[Demo] Error seeding demo report:", error);
    return NextResponse.json({ error: "Failed to create demo report" }, { status: 500 });
  }
}
