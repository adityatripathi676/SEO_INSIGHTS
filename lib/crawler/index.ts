// lib/crawler/index.ts
// Central orchestrator that runs all 4 agents in parallel
import { resolveUrl, crawlOnPage, OnPageData } from "./onpage";
import { crawlPerformance, PerformanceData, ZERO_PERFORMANCE } from "./performance";
import { crawlTechnical, TechnicalData, ZERO_TECHNICAL } from "./technical";
import { crawlAuthority, AuthorityData, ZERO_AUTHORITY } from "./authority";
import { scrapeSerp, SerpData } from "../scraper";

export interface FullCrawlResult {
  targetInput: string;
  resolvedUrl: string;
  timestamp: string;
  onpage: OnPageData;
  performance: PerformanceData;
  technical: TechnicalData;
  authority: AuthorityData;
  serp: SerpData;
}

/**
 * Execute all 4 crawl agents concurrently for a target input string (URL or Brand).
 */
export async function runFullCrawl(input: string): Promise<FullCrawlResult> {
  console.log(`[Crawler] Starting full agentic crawl for: "${input}"`);
  const startTime = Date.now();

  const resolvedUrl = await resolveUrl(input);
  console.log(`[Crawler] Resolved input "${input}" to URL: ${resolvedUrl}`);

  // Run all 5 agents in parallel with Promise.allSettled for maximum resilience
  const [onpageRes, perfRes, techRes, authRes, serpRes] = await Promise.allSettled([
    crawlOnPage(resolvedUrl),
    crawlPerformance(resolvedUrl),
    crawlTechnical(resolvedUrl),
    crawlAuthority(resolvedUrl),
    scrapeSerp(input),
  ]);

  const onpage = onpageRes.status === "fulfilled" ? onpageRes.value : {
    url: resolvedUrl,
    resolvedUrl,
    title: input,
    metaDescription: null,
    h1: [],
    h2: [],
    h3: [],
    canonicalUrl: null,
    robotsMeta: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterCard: null,
    schemaTypes: [],
    wordCount: 0,
    internalLinks: 0,
    externalLinks: 0,
    imageCount: 0,
    imagesWithoutAlt: 0,
    lang: null,
    viewport: null,
    themeColor: null,
    isJsRendered: false,
    contentSnippet: "",
    keywordsInTitle: [],
    keywordsInMeta: [],
  };

  const performance = perfRes.status === "fulfilled" ? perfRes.value : ZERO_PERFORMANCE;
  const technical   = techRes.status === "fulfilled" ? techRes.value : ZERO_TECHNICAL;
  const authority   = authRes.status === "fulfilled" ? authRes.value : ZERO_AUTHORITY;
  const serp        = serpRes.status === "fulfilled" ? serpRes.value : { keyword: input, results: [] };

  // Merge technical structured data check with onpage schema check
  technical.hasStructuredData = onpage.schemaTypes.length > 0;

  const durationMs = Date.now() - startTime;
  console.log(`[Crawler] Full crawl completed in ${durationMs}ms for ${resolvedUrl}`);

  return {
    targetInput: input,
    resolvedUrl,
    timestamp: new Date().toISOString(),
    onpage,
    performance,
    technical,
    authority,
    serp,
  };
}

/**
 * Format FullCrawlResult into structured raw results for Groq AI analysis
 */
export function formatCrawlResultForAnalysis(crawl: FullCrawlResult) {
  const { onpage, performance, technical, authority, serp } = crawl;

  return [
    {
      prompt: `Comprehensive SEO Audit for ${crawl.resolvedUrl}`,
      url: crawl.resolvedUrl,
      timestamp: crawl.timestamp,
      answer_text: `
SITE OVERVIEW:
URL: ${crawl.resolvedUrl}
Title: ${onpage.title ?? "Missing"}
Meta Description: ${onpage.metaDescription ?? "Missing"}
Canonical URL: ${onpage.canonicalUrl ?? "Missing"}
Language: ${onpage.lang ?? "Not specified"}
Word Count: ${onpage.wordCount} words
Image Count: ${onpage.imageCount} (Missing alt tags: ${onpage.imagesWithoutAlt})
Internal Links: ${onpage.internalLinks} | External Links: ${onpage.externalLinks}

HEADINGS STRUCTURE:
H1 Tags: ${onpage.h1.join(" | ") || "None"}
H2 Tags: ${onpage.h2.slice(0, 8).join(" | ") || "None"}
H3 Tags: ${onpage.h3.slice(0, 8).join(" | ") || "None"}

TECHNICAL & INFRASTRUCTURE SEO:
HTTPS Enforced: ${technical.isHttps ? "Yes" : "No"}
SSL Valid: ${technical.sslValid ? "Yes" : "No"} (Days remaining: ${technical.sslDaysRemaining ?? "N/A"})
Robots.txt Present: ${technical.hasRobotsTxt ? "Yes" : "No"} (Disallows All: ${technical.robotsDisallowsAll ? "YES - CRITICAL ISSUE" : "No"})
Sitemap Present: ${technical.hasSitemap ? "Yes" : "No"} (Discovered URLs: ${technical.sitemapUrlCount})
Response Code: ${technical.responseCode}
Redirect Chain: ${technical.redirectChain.join(" -> ") || "Direct (None)"}
Schema.org Types: ${onpage.schemaTypes.join(", ") || "None detected"}
Hreflang Tags: ${technical.hasHreflang ? "Present" : "None"}

PERFORMANCE & CORE WEB VITALS (LIGHTHOUSE / PAGESPEED):
Mobile Performance Score: ${performance.mobile.score}/100
Mobile LCP (Largest Contentful Paint): ${performance.mobile.lcp_ms}ms
Mobile CLS (Cumulative Layout Shift): ${performance.mobile.cls}
Mobile TTFB (Time to First Byte): ${performance.mobile.ttfb_ms}ms
Desktop Performance Score: ${performance.desktop.score}/100
Desktop LCP: ${performance.desktop.lcp_ms}ms
Performance Opportunities: ${performance.opportunities.join("; ") || "None identified"}

DOMAIN AUTHORITY & LINK PROFILE:
Open PageRank Score: ${authority.pageRank}/10 (Decimal: ${authority.pageRankDecimal})
Domain Indexed in PageRank: ${authority.domainPresence ? "Yes" : "No"}

LIVE ORGANIC SERP RANKINGS (Target: "${serp.keyword}"):
${serp.results.map((r) => `${r.position}. [${r.title}](${r.url}) - ${r.snippet}`).join("\n")}

CONTENT PREVIEW / SNIPPET:
${onpage.contentSnippet}
      `.trim(),
      sources: [
        {
          title: onpage.title ?? crawl.resolvedUrl,
          url: crawl.resolvedUrl,
          description: onpage.metaDescription ?? `Target audited site: ${crawl.resolvedUrl}`,
        },
        ...(technical.hasSitemap ? [{
          title: `Sitemap (${crawl.resolvedUrl})`,
          url: `${new URL(crawl.resolvedUrl).origin}/sitemap.xml`,
          description: `Discovered ${technical.sitemapUrlCount} pages in XML sitemap`,
        }] : []),
        ...(technical.hasRobotsTxt ? [{
          title: `Robots.txt (${crawl.resolvedUrl})`,
          url: `${new URL(crawl.resolvedUrl).origin}/robots.txt`,
          description: `Crawl rules for ${crawl.resolvedUrl}`,
        }] : []),
        ...serp.results.slice(0, 8).map((r) => ({
          title: r.title,
          url: r.url,
          description: r.snippet
        }))
      ],
    },
  ];
}
