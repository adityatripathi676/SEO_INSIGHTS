// app/api/scrape/route.ts
// POST /api/scrape — Fast agentic multi-layer SEO crawl & analysis
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createJob,
  failJob,
  saveRawResults,
  findCachedJobByPrompt,
  createJobFromCache,
} from "@/lib/db";
import { runFullCrawl, formatCrawlResultForAnalysis } from "@/lib/crawler";
import { runAnalysis } from "@/lib/analysis";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();

    // Check for cached completed report within 48h
    const cachedJob = findCachedJobByPrompt(cleanPrompt);
    if (cachedJob && cachedJob.seo_report) {
      const cachedJobId = uuidv4();
      createJobFromCache(cachedJobId, cleanPrompt, cachedJob);
      console.log(`[Scrape] Domain cache hit for "${cleanPrompt}" -> Created job ${cachedJobId}`);
      return NextResponse.json({
        jobId: cachedJobId,
        cached: true,
        status: "completed",
      });
    }

    if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    // Create job record in SQLite
    const jobId = uuidv4();
    const job = createJob(jobId, cleanPrompt);
    console.log(`[Scrape] Created job ${jobId} for prompt: "${cleanPrompt}"`);

    // Execute background agentic crawl & analysis
    // We run the crawl in background and return jobId immediately for real-time polling UI
    (async () => {
      try {
        console.log(`[Scrape] Starting agentic crawler pipeline for job ${jobId}...`);
        const crawlResult = await runFullCrawl(cleanPrompt);
        const formattedResults = formatCrawlResultForAnalysis(crawlResult);

        // Save raw crawl results to SQLite
        saveRawResults(jobId, formattedResults);

        // Run AI analysis with Groq Llama 3.3
        await runAnalysis(jobId, crawlResult);
      } catch (err) {
        console.error(`[Scrape] Agentic crawl pipeline failed for job ${jobId}:`, err);
        failJob(
          jobId,
          err instanceof Error ? err.message : "Agentic crawl failed"
        );
      }
    })();

    return NextResponse.json({
      jobId,
      status: job.status,
    });
  } catch (error) {
    console.error("[Scrape] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
