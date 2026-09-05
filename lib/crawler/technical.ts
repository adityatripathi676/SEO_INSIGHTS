// lib/crawler/technical.ts
// Agent 3: Technical SEO checker — 7 instant parallel HTTP checks
// No external libs needed except ssl-checker

export interface TechnicalData {
  isHttps: boolean;
  sslValid: boolean;
  sslDaysRemaining: number | null;
  sslIssuer: string | null;
  hasRobotsTxt: boolean;
  robotsDisallowsAll: boolean;
  robotsAllowsGooglebot: boolean;
  hasSitemap: boolean;
  sitemapUrlCount: number;
  responseCode: number;
  redirectChain: string[];
  pageSize_bytes: number;
  hasWwwToHttpsRedirect: boolean;
  serverHeader: string | null;
  contentType: string | null;
  hasHreflang: boolean;
  hasStructuredData: boolean;
}

export const ZERO_TECHNICAL: TechnicalData = {
  isHttps: false,
  sslValid: false,
  sslDaysRemaining: null,
  sslIssuer: null,
  hasRobotsTxt: false,
  robotsDisallowsAll: false,
  robotsAllowsGooglebot: true,
  hasSitemap: false,
  sitemapUrlCount: 0,
  responseCode: 0,
  redirectChain: [],
  pageSize_bytes: 0,
  hasWwwToHttpsRedirect: false,
  serverHeader: null,
  contentType: null,
  hasHreflang: false,
  hasStructuredData: false,
};

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

async function checkSsl(domain: string): Promise<{ valid: boolean; daysRemaining: number | null; issuer: string | null }> {
  try {
    // Use ssl-checker if available, otherwise check via fetch
    const sslChecker = await import("ssl-checker");
    const check = await sslChecker.default(domain, { method: "GET", port: 443 });
    return {
      valid: check.valid,
      daysRemaining: check.daysRemaining ?? null,
      issuer: null, // ssl-checker doesn't expose issuer
    };
  } catch {
    // Fallback: if HTTPS fetch succeeds, SSL is valid
    try {
      await fetch(`https://${domain}`, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      return { valid: true, daysRemaining: null, issuer: null };
    } catch {
      return { valid: false, daysRemaining: null, issuer: null };
    }
  }
}

async function checkRobotsTxt(baseUrl: string): Promise<{
  exists: boolean;
  disallowsAll: boolean;
  allowsGooglebot: boolean;
}> {
  try {
    const url = new URL("/robots.txt", baseUrl).toString();
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { exists: false, disallowsAll: false, allowsGooglebot: true };

    const text = await res.text();
    const disallowsAll = /Disallow:\s*\/\s*$/m.test(text) && /User-agent:\s*\*/m.test(text);
    const allowsGooglebot = !text.includes("User-agent: Googlebot") ||
      !text.includes("Disallow: /");

    return { exists: true, disallowsAll, allowsGooglebot };
  } catch {
    return { exists: false, disallowsAll: false, allowsGooglebot: true };
  }
}

async function checkSitemap(baseUrl: string): Promise<{ exists: boolean; urlCount: number }> {
  try {
    // Try common sitemap locations
    const candidates = [
      new URL("/sitemap.xml", baseUrl).toString(),
      new URL("/sitemap_index.xml", baseUrl).toString(),
      new URL("/sitemap.xml.gz", baseUrl).toString(),
    ];

    for (const url of candidates) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const text = await res.text();
          const urlCount = (text.match(/<url>/g) || []).length;
          return { exists: true, urlCount };
        }
      } catch {}
    }
    return { exists: false, urlCount: 0 };
  } catch {
    return { exists: false, urlCount: 0 };
  }
}

async function checkMainPage(url: string): Promise<{
  responseCode: number;
  redirectChain: string[];
  pageSize: number;
  serverHeader: string | null;
  contentType: string | null;
}> {
  try {
    // Manually follow redirects to capture chain
    const chain: string[] = [url];
    let current = url;

    for (let i = 0; i < 5; i++) {
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SEOInsightBot/1.0)" },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (location && location !== current) {
          try {
            current = new URL(location, current).toString();
            chain.push(current);
          } catch { break; }
        } else break;
      } else {
        return {
          responseCode: res.status,
          redirectChain: chain.length > 1 ? chain : [],
          pageSize: parseInt(res.headers.get("content-length") || "0") || 0,
          serverHeader: res.headers.get("server"),
          contentType: res.headers.get("content-type"),
        };
      }
    }

    // Final fetch at current URL
    const res = await fetch(current, { signal: AbortSignal.timeout(8000) });
    const body = await res.text();
    return {
      responseCode: res.status,
      redirectChain: chain.length > 1 ? chain : [],
      pageSize: body.length,
      serverHeader: res.headers.get("server"),
      contentType: res.headers.get("content-type"),
    };
  } catch (error) {
    console.error(`[Technical] Page check failed for ${url}:`, error);
    return { responseCode: 0, redirectChain: [], pageSize: 0, serverHeader: null, contentType: null };
  }
}

async function checkHreflang(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    return html.includes('hreflang=') || html.includes('rel="alternate"');
  } catch { return false; }
}

/**
 * Run all technical SEO checks in parallel
 */
export async function crawlTechnical(url: string): Promise<TechnicalData> {
  try {
    const baseUrl = new URL(url).origin;
    const domain = extractDomain(url);
    const isHttps = url.startsWith("https://");

    const [sslResult, robotsResult, sitemapResult, pageResult, hreflangResult] =
      await Promise.allSettled([
        checkSsl(domain),
        checkRobotsTxt(baseUrl),
        checkSitemap(baseUrl),
        checkMainPage(url),
        checkHreflang(url),
      ]);

    const ssl    = sslResult.status    === "fulfilled" ? sslResult.value    : { valid: false, daysRemaining: null, issuer: null };
    const robots = robotsResult.status === "fulfilled" ? robotsResult.value : { exists: false, disallowsAll: false, allowsGooglebot: true };
    const sitemap = sitemapResult.status === "fulfilled" ? sitemapResult.value : { exists: false, urlCount: 0 };
    const page   = pageResult.status   === "fulfilled" ? pageResult.value   : { responseCode: 0, redirectChain: [], pageSize: 0, serverHeader: null, contentType: null };
    const hreflang = hreflangResult.status === "fulfilled" ? hreflangResult.value : false;

    // Detect www → https redirect
    const hasWwwRedirect = page.redirectChain.some(
      (u) => u.startsWith("https://") && !u.startsWith("https://www.")
    ) || page.redirectChain.some(
      (u) => u.startsWith("http://")
    );

    return {
      isHttps,
      sslValid:           ssl.valid,
      sslDaysRemaining:   ssl.daysRemaining,
      sslIssuer:          ssl.issuer,
      hasRobotsTxt:       robots.exists,
      robotsDisallowsAll: robots.disallowsAll,
      robotsAllowsGooglebot: robots.allowsGooglebot,
      hasSitemap:         sitemap.exists,
      sitemapUrlCount:    sitemap.urlCount,
      responseCode:       page.responseCode,
      redirectChain:      page.redirectChain,
      pageSize_bytes:     page.pageSize,
      hasWwwToHttpsRedirect: hasWwwRedirect,
      serverHeader:       page.serverHeader,
      contentType:        page.contentType,
      hasHreflang:        hreflang,
      hasStructuredData:  false, // populated from onpage crawler
    };
  } catch (error) {
    console.error(`[Technical] Failed for ${url}:`, error);
    return ZERO_TECHNICAL;
  }
}
