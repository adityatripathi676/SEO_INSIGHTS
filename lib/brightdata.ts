// lib/brightdata.ts
// Bright Data polling logic - replaces webhook-based approach with direct polling
import { buildPerplexityPrompt } from "@/prompts/perplexity";
import {
  saveRawResults,
  failJob,
} from "@/lib/db";
import { runAnalysis } from "@/lib/analysis";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;
const DATASET_ID = "gd_m7dhdot1vw9a7gc1n";

/**
 * Trigger Bright Data scraping (no webhook — we'll poll for results)
 */
export async function triggerScraping(
  jobId: string,
  prompt: string,
  country: string = "US"
): Promise<{ snapshotId: string }> {
  const perplexityPrompt = buildPerplexityPrompt(prompt);

  // Trigger without a webhook endpoint since we're polling
  const triggerUrl = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${DATASET_ID}&format=json&uncompressed_webhook=true&include_errors=true`;

  const response = await fetch(triggerUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: [
        {
          url: "https://www.perplexity.ai",
          prompt: perplexityPrompt,
          country: country,
          index: 1,
        },
      ],
      custom_output_fields: [
        "url",
        "prompt",
        "answer_text",
        "sources",
        "citations",
        "timestamp",
        "input",
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Bright Data trigger failed: HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`
    );
  }

  const data = await response.json();
  if (!data.snapshot_id) {
    throw new Error("Bright Data did not return a snapshot_id");
  }

  return { snapshotId: data.snapshot_id };
}

/**
 * Poll Bright Data until the snapshot is ready, then run analysis.
 * This runs entirely in background — does not block the API response.
 */
export async function pollAndProcess(
  jobId: string,
  snapshotId: string,
  maxWaitMs: number = 10 * 60 * 1000, // 10 minutes max
  intervalMs: number = 4000 // poll every 4 seconds for faster detection
): Promise<void> {
  const startTime = Date.now();
  const snapshotUrl = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

  console.log(`[BrightData] Starting poll for snapshot: ${snapshotId}`);

  while (Date.now() - startTime < maxWaitMs) {
    await sleep(intervalMs);

    try {
      const response = await fetch(snapshotUrl, {
        headers: {
          Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
        },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.warn(
          `[BrightData] Poll returned HTTP ${response.status}: ${text}`
        );
        continue;
      }

      // Bright Data returns 200 with status JSON while building
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        // Could be status payload or actual data
        const body = await response.json();

        // If it's a status object with status field
        if (body && typeof body === "object" && !Array.isArray(body) && body.status) {
          const status = body.status as string;
          console.log(`[BrightData] Snapshot status: ${status}`);

          if (status === "failed" || status === "error") {
            failJob(jobId, `Bright Data snapshot failed with status: ${status}`);
            return;
          }

          if (status === "ready" || status === "completed") {
            // Fetch the actual data now
            const dataResponse = await fetch(snapshotUrl, {
              headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` },
            });
            if (dataResponse.ok) {
              const rawData = await dataResponse.json();
              await processResults(jobId, rawData);
              return;
            }
          }
          // Still building — continue polling
          continue;
        }

        // It's the actual data (array of results)
        if (Array.isArray(body) && body.length > 0) {
          console.log(
            `[BrightData] Got ${body.length} results for snapshot ${snapshotId}`
          );
          await processResults(jobId, body);
          return;
        }

        // Non-empty object that is data
        if (body && typeof body === "object" && !body.status) {
          await processResults(jobId, [body]);
          return;
        }
      }
    } catch (error) {
      console.warn(`[BrightData] Poll error:`, error);
    }
  }

  // Timed out
  failJob(jobId, `Scraping timed out after ${maxWaitMs / 1000}s`);
  console.error(`[BrightData] Polling timed out for job ${jobId}`);
}

async function processResults(jobId: string, rawData: unknown[]): Promise<void> {
  // Save raw results and set status to analyzing
  saveRawResults(jobId, rawData);
  console.log(`[BrightData] Raw data saved for job ${jobId}, starting analysis...`);

  // Run AI analysis
  await runAnalysis(jobId);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
