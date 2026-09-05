// lib/analysis.ts
// AI analysis using Groq — replaces Gemini for better free-tier performance
// Groq Free Tier: 14,400 req/day, high RPM, extremely fast
import Groq from "groq-sdk";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { buildAnalysisPrompt, systemPrompt } from "@/prompts/gpt";
import { seoReportSchema } from "@/lib/seo-schema";
import {
  getJobById,
  saveAnalysisPrompt,
  saveSeoReport,
  completeJob,
  failJob,
} from "@/lib/db";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// ─── Rate / Concurrency Limiter ──────────────────────────────────────────────
// Only 1 analysis runs at a time to avoid hammering the free-tier RPM limit.
let _analysisRunning = false;
const _analysisQueue: Array<() => void> = [];

function acquireLock(): Promise<void> {
  return new Promise((resolve) => {
    if (!_analysisRunning) {
      _analysisRunning = true;
      resolve();
    } else {
      _analysisQueue.push(resolve);
    }
  });
}

function releaseLock(): void {
  const next = _analysisQueue.shift();
  if (next) {
    next(); // hand lock to next waiter immediately
  } else {
    _analysisRunning = false;
  }
}

// ─── Token Budget Helper ─────────────────────────────────────────────────────
// Bright Data returns large answer_text blobs. We truncate aggressively to
// stay within Groq's token limits and minimize latency.
const MAX_ANSWER_CHARS = 8_000;  // per item
const MAX_SOURCES      = 15;      // max sources kept per item
const MAX_SOURCE_DESC  = 300;     // chars per source description

interface RawScrapingItem {
  prompt?: string;
  answer_text?: string;
  sources?: Array<{ title?: string; url?: string; description?: string }>;
  timestamp?: string;
  url?: string;
  [key: string]: unknown;
}

function trimScrapingData(raw: unknown[]): RawScrapingItem[] {
  return raw.map((item) => {
    const it = item as RawScrapingItem;
    return {
      prompt:      it.prompt      ?? "",
      answer_text: (it.answer_text ?? "").slice(0, MAX_ANSWER_CHARS),
      sources:     (it.sources    ?? [])
        .slice(0, MAX_SOURCES)
        .map((s) => ({
          title:       s.title ?? "",
          url:         s.url   ?? "",
          description: (s.description ?? "").slice(0, MAX_SOURCE_DESC),
        })),
      timestamp: it.timestamp ?? "",
      url:       it.url       ?? "",
    };
  });
}

// ─── Main Export ─────────────────────────────────────────────────────────────

import { FullCrawlResult } from "@/lib/crawler";

/**
 * Run Groq analysis on the raw scraping results for a given job.
 * Serialises via a concurrency lock so at most 1 call hits the API at a time.
 */
export async function runAnalysis(jobId: string, crawlResult?: FullCrawlResult): Promise<void> {
  console.log(`[Analysis] Queued job: ${jobId}`);

  await acquireLock();

  try {
    console.log(`[Analysis] Starting AI analysis for job: ${jobId} (Groq)`);

    const job = getJobById(jobId);
    if (!job) {
      console.error(`[Analysis] No job found for ID: ${jobId}`);
      return;
    }
    if (!job.results || job.results.length === 0) {
      failJob(jobId, "No scraping results available for analysis");
      return;
    }

    // Trim data to reduce token spend
    const trimmed  = trimScrapingData(job.results);
    const prompt   = buildAnalysisPrompt(trimmed as Parameters<typeof buildAnalysisPrompt>[0]);

    // Save prompt for debugging
    saveAnalysisPrompt(jobId, prompt);

    console.log(`[Analysis] Sending to AI Engine (${prompt.length} chars) for job: ${jobId}`);

    let content: string | null | undefined = null;
    let lastError: Error | null = null;

    // 1. Dynamic Groq Model Discovery
    let activeGroqModels: string[] = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "llama3-70b-8192",
      "gemma2-9b-it",
    ];

    try {
      const modelsList = await groq.models.list();
      if (modelsList && Array.isArray(modelsList.data) && modelsList.data.length > 0) {
        const fetched = modelsList.data
          .map((m) => m.id)
          .filter((id) => !id.includes("whisper") && !id.includes("decommissioned"));
        if (fetched.length > 0) {
          activeGroqModels = fetched;
          console.log(`[Analysis] Discovered ${fetched.length} active Groq models:`, fetched);
        }
      }
    } catch {
      console.warn("[Analysis] Dynamic Groq model listing failed, using default candidate list");
    }

    // 2. Try Groq Models
    for (const modelName of activeGroqModels) {
      try {
        console.log(`[Analysis] Attempting Groq model: ${modelName}`);
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt() },
            { role: "user", content: prompt },
          ],
          model: modelName,
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 4000,
        });

        content = chatCompletion.choices[0]?.message?.content;
        if (content) {
          console.log(`[Analysis] Successfully generated report using Groq model: ${modelName}`);
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[Analysis] Groq model ${modelName} failed:`, lastError.message);
      }
    }

    // 3. Fallback to Google Gemini if Groq fails
    if (!content && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        console.log("[Analysis] Groq unavailable — falling back to Google Gemini...");
        const geminiResult = await generateText({
          model: googleAI("gemini-1.5-flash"),
          system: systemPrompt(),
          prompt: prompt,
        });
        content = geminiResult.text;
        if (content) {
          // Clean JSON markdown codeblocks if wrapped
          content = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
          console.log("[Analysis] Successfully generated report using Google Gemini ✓");
        }
      } catch (geminiErr) {
        console.error("[Analysis] Google Gemini fallback failed:", geminiErr);
      }
    }

    if (!content) {
      throw lastError || new Error("All AI engines (Groq & Gemini) failed to return content");
    }

    let seoReport;
    try {
      seoReport = JSON.parse(content);
    } catch {
      console.error("[Analysis] Failed to parse Groq JSON response:", content);
      throw new Error("Groq returned invalid JSON");
    }

    // Inject exact crawl metrics if present
    if (crawlResult) {
      seoReport.performance = {
        mobile_score: crawlResult.performance.mobile.score,
        desktop_score: crawlResult.performance.desktop.score,
        lcp_ms: crawlResult.performance.mobile.lcp_ms,
        cls: crawlResult.performance.mobile.cls,
        ttfb_ms: crawlResult.performance.mobile.ttfb_ms,
        fcp_ms: crawlResult.performance.mobile.fcp_ms,
        speed_index_ms: crawlResult.performance.mobile.speed_index_ms,
        opportunities: crawlResult.performance.opportunities,
      };

      seoReport.technical = {
        is_https: crawlResult.technical.isHttps,
        ssl_valid: crawlResult.technical.sslValid,
        ssl_days_remaining: crawlResult.technical.sslDaysRemaining,
        has_robots_txt: crawlResult.technical.hasRobotsTxt,
        robots_disallows_all: crawlResult.technical.robotsDisallowsAll,
        has_sitemap: crawlResult.technical.hasSitemap,
        sitemap_url_count: crawlResult.technical.sitemapUrlCount,
        response_code: crawlResult.technical.responseCode,
        page_size_bytes: crawlResult.technical.pageSize_bytes,
        has_hreflang: crawlResult.technical.hasHreflang,
        has_structured_data: crawlResult.technical.hasStructuredData,
      };
    }

    console.log(`[Analysis] Report generated: ${seoReport.meta?.entity_name || "Unknown"}`);

    const validated = seoReportSchema.parse(seoReport);
    saveSeoReport(jobId, validated);
    completeJob(jobId);

    console.log(`[Analysis] Job ${jobId} completed ✓`);
  } catch (error) {
    console.error(`[Analysis] Error for job ${jobId}:`, error);
    failJob(
      jobId,
      error instanceof Error ? error.message : "Unknown analysis error"
    );
  } finally {
    releaseLock();
  }
}
