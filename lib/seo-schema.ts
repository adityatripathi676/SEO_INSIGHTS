// lib/seo-schema.ts
// Zod schema for SEO report validation - focused on content analysis from scraping data
import { z } from "zod";

// Helper for case-insensitive enums and missing arrays/objects
const preprocessString = (val: unknown) => (typeof val === "string" ? val.toLowerCase() : val);
const preprocessArray = (val: unknown) => (Array.isArray(val) ? val : val === null || val === undefined ? [] : [val]);
const preprocessObject = (val: unknown) => (typeof val === "object" && val !== null && !Array.isArray(val) ? val : {});

// Base schemas
const evidenceSchema = z.object({
  url: z.string().catch("#"),
  quote: z.string().nullable().catch(null),
  relevance_score: z.number().min(0).max(1).catch(0.5),
});

const sourceSchema = z.object({
  title: z.string().catch("Unknown Source"),
  url: z.string().catch("#"),
  description: z.string().nullable().catch(null),
});

// Main SEO report schema
export const seoReportSchema = z.object({
  meta: z.preprocess(preprocessObject, z.object({
    entity_name: z.string().catch("Unknown Entity"),
    entity_type: z.preprocess(preprocessString, z.enum([
      "person",
      "business",
      "product",
      "course",
      "website",
      "unknown",
    ]).catch("unknown")),
    analysis_date: z.string().catch(() => new Date().toISOString()),
    data_sources_count: z.number().catch(0),
    confidence_score: z.number().min(0).max(1).catch(0.5),
  })).catch({
    entity_name: "Unknown Entity",
    entity_type: "unknown",
    analysis_date: new Date().toISOString(),
    data_sources_count: 0,
    confidence_score: 0.5
  }),

  inventory: z.preprocess(preprocessObject, z.object({
    total_sources: z.number().catch(0),
    unique_domains: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
    source_types: z.record(z.string(), z.array(z.any())).optional().catch({}),
    date_range: z.object({
      earliest: z.string().nullable().catch(null),
      latest: z.string().nullable().catch(null),
    }).catch({ earliest: null, latest: null }),
  })).catch({
    total_sources: 0,
    unique_domains: [],
    source_types: {},
    date_range: { earliest: null, latest: null }
  }),

  content_analysis: z.preprocess(preprocessObject, z.object({
    content_themes: z.preprocess(preprocessArray, z.array(
      z.object({
        theme: z.string().catch("General"),
        frequency: z.number().catch(1),
        intent: z.preprocess(preprocessString, z.enum(["informational", "navigational", "transactional"]).optional().catch("informational")),
        subthemes: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
        evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
      })
    )).catch([]),
    sentiment: z.object({
      overall: z.preprocess(preprocessString, z.enum(["positive", "neutral", "negative", "mixed"]).catch("neutral")),
    }).catch({ overall: "neutral" }),
  })).catch({
    content_themes: [],
    sentiment: { overall: "neutral" }
  }),

  keywords: z.preprocess(preprocessObject, z.object({
    content_keywords: z.preprocess(preprocessArray, z.array(
      z.object({
        keyword: z.string().catch(""),
        intent: z.preprocess(preprocessString, z.enum(["informational", "navigational", "transactional", "commercial"]).optional().catch("informational")),
        evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
      })
    )).catch([]),
    keyword_themes: z.preprocess(preprocessArray, z.array(
      z.object({
        theme: z.string().catch("General"),
        keywords: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
        evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
      })
    )).catch([]),
  })).catch({
    content_keywords: [],
    keyword_themes: []
  }),

  competitors: z.preprocess(preprocessArray, z.array(
    z.object({
      name: z.string().nullable().catch(null),
      domain: z.string().catch(""),
      strength_score: z.number().min(0).max(10).catch(5),
      overlap_keywords: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
      unique_advantages: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
      relationship: z.preprocess(preprocessString, z.enum(["competitor", "employer", "partner", "unknown"]).catch("unknown")),
      evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
    })
  )).catch([]),

  social_presence: z.preprocess(preprocessObject, z.object({
    platforms: z.preprocess(preprocessArray, z.array(
      z.object({
        platform: z.string().catch(""),
        url: z.string().nullable().catch(null),
        evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
      })
    )).catch([]),
  })).catch({
    platforms: []
  }),

  backlink_analysis: z.preprocess(preprocessObject, z.object({
    total_backlinks: z.number().catch(0),
    referring_domains: z.number().catch(0),
    backlink_sources: z.preprocess(preprocessArray, z.array(
      z.object({
        source_type: z.preprocess(preprocessString, z.enum([
          "direct_mentions",
          "professional_references",
          "educational_citations",
          "community_mentions",
          "press_coverage",
          "directory_listings",
          "social_shares",
          "other",
        ]).catch("other")),
        domain: z.string().catch(""),
        url: z.string().catch(""),
        title: z.string().catch(""),
        description: z.string().nullable().catch(null),
        link_type: z.preprocess(preprocessString, z.enum(["dofollow", "nofollow", "unknown"]).optional().catch("unknown")),
        evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
      })
    )).catch([]),
  })).catch({
    total_backlinks: 0,
    referring_domains: 0,
    backlink_sources: []
  }),

  recommendations: z.preprocess(preprocessArray, z.array(
    z.object({
      category: z.preprocess(preprocessString, z.enum([
        "content",
        "social_media",
        "community_building",
        "brand_development",
        "competitor_analysis",
        "educational_content",
      ]).catch("content")),
      priority: z.preprocess(preprocessString, z.enum(["high", "medium", "low"]).catch("medium")),
      title: z.string().catch(""),
      description: z.string().catch(""),
      expected_impact: z.preprocess(preprocessString, z.enum(["high", "medium", "low"]).catch("medium")),
      effort_required: z.preprocess(preprocessString, z.enum(["high", "medium", "low"]).catch("medium")),
      evidence: z.preprocess(preprocessArray, z.array(evidenceSchema)).catch([]),
      implementation_steps: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
      data_driven_insights: z.preprocess(preprocessArray, z.array(z.string())).optional().catch([]),
      specific_quotes: z.preprocess(preprocessArray, z.array(z.string())).optional().catch([]),
    })
  )).catch([]),

  summary: z.preprocess(preprocessObject, z.object({
    overall_score: z.number().min(0).max(100).optional().catch(70),
    key_strengths: z.preprocess(preprocessArray, z.array(z.string())).optional().catch([]),
    critical_issues: z.preprocess(preprocessArray, z.array(z.string())).optional().catch([]),
    quick_wins: z.preprocess(preprocessArray, z.array(z.string())).optional().catch([]),
    long_term_opportunities: z.preprocess(preprocessArray, z.array(z.string())).optional().catch([]),
  })).catch({
    overall_score: 70,
    key_strengths: [],
    critical_issues: [],
    quick_wins: [],
    long_term_opportunities: [],
  }),

  performance: z.preprocess(preprocessObject, z.object({
    mobile_score: z.number().catch(0),
    desktop_score: z.number().catch(0),
    lcp_ms: z.number().catch(0),
    cls: z.number().catch(0),
    ttfb_ms: z.number().catch(0),
    fcp_ms: z.number().catch(0),
    speed_index_ms: z.number().catch(0),
    opportunities: z.preprocess(preprocessArray, z.array(z.string())).catch([]),
  })).optional().catch(undefined),

  technical: z.preprocess(preprocessObject, z.object({
    is_https: z.boolean().catch(false),
    ssl_valid: z.boolean().catch(false),
    ssl_days_remaining: z.number().nullable().catch(null),
    has_robots_txt: z.boolean().catch(false),
    robots_disallows_all: z.boolean().catch(false),
    has_sitemap: z.boolean().catch(false),
    sitemap_url_count: z.number().catch(0),
    response_code: z.number().catch(0),
    page_size_bytes: z.number().catch(0),
    has_hreflang: z.boolean().catch(false),
    has_structured_data: z.boolean().catch(false),
  })).optional().catch(undefined),
});

export const scrapingDataSchema = z.object({
  url: z.string(),
  prompt: z.string(),
  answer_text: z.string(),
  sources: z.array(sourceSchema),
  timestamp: z.string(),
});

export type SeoReport = z.infer<typeof seoReportSchema>;
export type ScrapingData = z.infer<typeof scrapingDataSchema>;

// Individual interface exports
export type Meta = SeoReport["meta"];
export type Inventory = SeoReport["inventory"];
export type ContentAnalysis = SeoReport["content_analysis"];
export type Keywords = SeoReport["keywords"];
export type ContentKeyword = SeoReport["keywords"]["content_keywords"][0];
export type Competitor = SeoReport["competitors"][0];
export type SocialPresence = SeoReport["social_presence"];
export type BacklinkAnalysis = SeoReport["backlink_analysis"];
export type Recommendation = SeoReport["recommendations"][0];
export type Summary = SeoReport["summary"];
export type Evidence = SeoReport["content_analysis"]["content_themes"][0]["evidence"][0];
export type Source = ScrapingData["sources"][0];
