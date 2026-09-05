// app/api/chat/route.ts
// POST /api/chat — Streaming AI chat using Groq (Llama 3.3)
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getJobById, getJobBySnapshotId } from "@/lib/db";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const {
      messages,
      id,
    }: {
      messages: UIMessage[];
      id: string;
    } = await req.json();

    const lastMsg = messages[messages.length - 1];
    const lastMessage =
      lastMsg?.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || "";
    const isAditya = lastMessage.toLowerCase().includes("this is aditya");

    // Default system prompt
    let systemPrompt = `You are an AI assistant helping users understand their SEO report.

Provide helpful, concise insights and answer questions about the SEO data and recommendations. 
Be specific and data-driven. Keep responses focused and practical.`;

    // ─── ADITYA MODE: Project Knowledge Injection ────────────────────────────
    if (isAditya) {
      systemPrompt = `Welcome back, Aditya (the developer of this project). 
      
You are now in "Project Insight" mode. You have complete knowledge of the SEO Insight architecture:

TECHNICAL STACK:
- Framework: Next.js 15 (Turbopack enabled)
- Styling: Vanilla CSS with Apple-inspired design tokens, glassmorphism, and Aurora animations.
- Database: Local SQLite (data/jobs.db) managed via better-sqlite3.
- Scraping: Bright Data API (SERP & Deep Search snapshots).
- AI Engine: Groq AI (Llama 3.3 70B) for analysis and chat.
- UI: Lucide icons, Recharts for data viz, and custom glass components.

ARCHITECTURAL NOTES:
- Local-First: Removed cloud dependencies like Clerk, Convex, and Stripe to run entirely on the user's machine.
- Pipeline: Scrape (Bright Data) -> Store (SQLite) -> Analyze (Groq/Llama) -> Display.
- Concurrency: Uses a singleton lock in lib/analysis.ts to avoid rate limits.
- Design: Modern Apple dark theme with drifting aurora orbs and grain textures.

Greeting: "Hello Aditya! I've activated Project Insight mode. I'm ready to answer any technical questions about the architecture, code, or database of SEO Insight."`;
    }

    // ─── REPORT CONTEXT: Inject report data if available ──────────────────────
    if (id && !isAditya) {
      try {
        let job = getJobById(id);
        if (!job) job = getJobBySnapshotId(id);

        if (job?.seo_report) {
          const report = job.seo_report as Record<string, unknown>;
          const meta = report.meta as Record<string, unknown> | undefined;

          const compactReport = {
            meta: report.meta,
            summary: report.summary,
            keywords: report.keywords,
            recommendations: report.recommendations,
            competitors: report.competitors,
            content_analysis: (report.content_analysis as Record<string, unknown>)?.themes,
          };

          systemPrompt = `You are an AI SEO assistant with access to a full SEO report.

ENTITY: "${meta?.entity_name ?? "unknown"}" (${meta?.entity_type ?? "unknown"})

SEO REPORT SUMMARY DATA:
${JSON.stringify(compactReport, null, 2)}

Help the user understand their SEO data. Reference specific numbers from the report.
Keep answers concise and actionable. If asked about something not in the data, say so.`;
        }
      } catch (error) {
        console.error("[Chat] Error fetching report:", error);
      }
    }

    // Dynamically discover available Groq models
    let selectedModel = "llama-3.3-70b-versatile"; // fallback default
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.data.map((m: any) => m.id).filter((id: string) => !id.includes("whisper") && !id.includes("guard"));
        if (models.length > 0) {
          // Prefer Llama, then Qwen, then anything
          selectedModel = models.find((m: string) => m.includes("llama")) || 
                          models.find((m: string) => m.includes("qwen")) || 
                          models[0];
          console.log(`[Chat] Selected Groq model: ${selectedModel}`);
        }
      }
    } catch (e) {
      console.warn("[Chat] Failed to discover Groq models, using default.");
    }

    // Format conversation history to bypass Groq provider serialization issues
    // by collapsing the history into a single user message.
    const historyString = messages.map(m => {
      const text = m.parts?.filter((p): p is { type: "text"; text: string } => p.type === "text").map(p => p.text).join("") || m.content || "";
      return `${m.role === 'user' ? 'User' : 'Assistant'}: ${text}`;
    }).join("\n\n");

    const result = streamText({
      model: groq(selectedModel),
      messages: [
        { role: 'user', content: historyString }
      ],
      system: systemPrompt,
      maxTokens: 500,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
