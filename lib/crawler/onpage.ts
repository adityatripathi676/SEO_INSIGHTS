// lib/crawler/onpage.ts
// Agent 1: On-Page SEO Crawler — uses cheerio to parse real HTML
// No Chromium needed — cheerio handles 95% of sites via server-rendered HTML
import * as cheerio from "cheerio";

export interface OnPageData {
  url: string;
  resolvedUrl: string;
  title: string | null;
  metaDescription: string | null;
  h1: string[];
  h2: string[];
  h3: string[];
  canonicalUrl: string | null;
  robotsMeta: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  schemaTypes: string[];
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  imageCount: number;
  imagesWithoutAlt: number;
  lang: string | null;
  viewport: string | null;
  themeColor: string | null;
  isJsRendered: boolean;
  contentSnippet: string; // First 2000 chars of body text for AI
  keywordsInTitle: string[];
  keywordsInMeta: string[];
}

const ZERO_ONPAGE: OnPageData = {
  url: "",
  resolvedUrl: "",
  title: null,
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

/**
 * Resolve a brand name or URL to a real https URL
 */
export async function resolveUrl(input: string): Promise<string> {
  const cleaned = input.trim();

  // Already a full URL
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  // Looks like a domain (has a dot but no spaces)
  if (cleaned.includes(".") && !cleaned.includes(" ")) {
    return `https://${cleaned}`;
  }

  // Brand name — try https://{brand}.com
  const slug = cleaned.toLowerCase().replace(/\s+/g, "");
  const candidate = `https://${slug}.com`;
  try {
    const res = await fetch(candidate, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (res.ok || res.status === 405) return candidate;
  } catch {
    // Try www
    try {
      const www = `https://www.${slug}.com`;
      const res = await fetch(www, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      if (res.ok) return www;
    } catch {}
  }

  return candidate; // Return best guess even if HEAD failed
}

function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[\s,|·–—\-]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 3)
    .slice(0, 20);
}

/**
 * Crawl a URL and extract all on-page SEO signals
 */
export async function crawlOnPage(url: string): Promise<OnPageData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEOInsightBot/1.0; +https://seoinsight.ai/bot)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok && res.status !== 200) {
      console.warn(`[OnPage] ${url} returned HTTP ${res.status}`);
    }

    const html = await res.text();
    const resolvedUrl = res.url || url;
    const $ = cheerio.load(html);

    // Remove non-content elements
    $("script, style, noscript, svg, nav, footer, header").remove();

    // Extract heading text
    const h1: string[] = [];
    const h2: string[] = [];
    const h3: string[] = [];
    $("h1").each((_, el) => { const t = $(el).text().trim(); if (t) h1.push(t); });
    $("h2").each((_, el) => { const t = $(el).text().trim(); if (t) h2.push(t); });
    $("h3").each((_, el) => { const t = $(el).text().trim(); if (t) h3.push(t); });

    // Meta tags
    const title = $("title").first().text().trim() || null;
    const metaDesc = $('meta[name="description"]').attr("content")?.trim() || null;
    const canonical = $('link[rel="canonical"]').attr("href")?.trim() || null;
    const robotsMeta = $('meta[name="robots"]').attr("content")?.trim() || null;
    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || null;
    const ogDesc = $('meta[property="og:description"]').attr("content")?.trim() || null;
    const ogImage = $('meta[property="og:image"]').attr("content")?.trim() || null;
    const twitterCard = $('meta[name="twitter:card"]').attr("content")?.trim() || null;
    const viewport = $('meta[name="viewport"]').attr("content")?.trim() || null;
    const themeColor = $('meta[name="theme-color"]').attr("content")?.trim() || null;
    const lang = $("html").attr("lang")?.trim() || null;

    // Schema.org types
    const schemaTypes: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "{}");
        const type = data["@type"];
        if (typeof type === "string") schemaTypes.push(type);
        if (Array.isArray(type)) schemaTypes.push(...type);
      } catch {}
    });

    // Link analysis
    const baseHostname = new URL(resolvedUrl).hostname;
    let internalLinks = 0;
    let externalLinks = 0;
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      try {
        const linkUrl = new URL(href, resolvedUrl);
        if (linkUrl.hostname === baseHostname) internalLinks++;
        else externalLinks++;
      } catch {}
    });

    // Image analysis
    let imageCount = 0;
    let imagesWithoutAlt = 0;
    $("img").each((_, el) => {
      imageCount++;
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") imagesWithoutAlt++;
    });

    // Body text for AI
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
    const contentSnippet = bodyText.slice(0, 2000);

    // JS-rendered detection: body has little text but lots of scripts
    const isJsRendered = wordCount < 100 && $("script").length > 5;

    return {
      url,
      resolvedUrl,
      title,
      metaDescription: metaDesc,
      h1,
      h2,
      h3,
      canonicalUrl: canonical,
      robotsMeta,
      ogTitle,
      ogDescription: ogDesc,
      ogImage,
      twitterCard,
      schemaTypes: [...new Set(schemaTypes)],
      wordCount,
      internalLinks,
      externalLinks,
      imageCount,
      imagesWithoutAlt,
      lang,
      viewport,
      themeColor,
      isJsRendered,
      contentSnippet,
      keywordsInTitle: extractKeywordsFromText(title || ""),
      keywordsInMeta: extractKeywordsFromText(metaDesc || ""),
    };
  } catch (error) {
    console.error(`[OnPage] Failed to crawl ${url}:`, error);
    return { ...ZERO_ONPAGE, url, resolvedUrl: url };
  }
}
