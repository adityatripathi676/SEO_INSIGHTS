import * as cheerio from "cheerio";

export interface SerpResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

export interface SerpData {
  keyword: string;
  results: SerpResult[];
}

/**
 * Custom Free SERP Scraper using DuckDuckGo HTML version.
 * This circumvents heavy bot protection and provides clean, 
 * accurate organic rankings, titles, and meta descriptions.
 */
export async function scrapeSerp(keyword: string): Promise<SerpData> {
  console.log(`[Scraper] Fetching live SERP data for: "${keyword}"`);
  
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`SERP fetch failed with status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SerpResult[] = [];

    $('.result').each((i, el) => {
      // DuckDuckGo specific selectors for their HTML page
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').attr('href')?.trim() || $(el).find('a.result__snippet').attr('href')?.trim() || "";
      
      // Attempt to clean duckduckgo redirect urls if present
      let finalUrl = link;
      if (link.startsWith('//duckduckgo.com/l/?uddg=')) {
        try {
          const urlObj = new URL('https:' + link);
          const uddg = urlObj.searchParams.get('uddg');
          if (uddg) finalUrl = decodeURIComponent(uddg);
        } catch {
          // ignore
        }
      }

      if (title && finalUrl) {
        results.push({
          position: i + 1,
          title,
          snippet,
          url: finalUrl,
        });
      }
    });

    console.log(`[Scraper] Successfully extracted ${results.length} organic results for "${keyword}"`);

    return {
      keyword,
      results: results.slice(0, 15), // Return top 15 competitors
    };

  } catch (error) {
    console.error(`[Scraper] Error scraping SERP for "${keyword}":`, error);
    return {
      keyword,
      results: [],
    };
  }
}
