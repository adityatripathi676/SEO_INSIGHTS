// lib/demo-report.ts
// Pre-built demo SEO report that exactly matches seoReportSchema.
// Used to seed the dashboard with a complete, realistic report — zero API calls.
import { SeoReport } from "@/lib/seo-schema";

export const DEMO_REPORT: SeoReport = {
  meta: {
    entity_name: "Google",
    entity_type: "business",
    analysis_date: new Date().toISOString().split("T")[0],
    data_sources_count: 18,
    confidence_score: 0.97,
  },

  inventory: {
    total_sources: 18,
    unique_domains: [
      "google.com", "about.google", "blog.google",
      "en.wikipedia.org", "techcrunch.com", "theverge.com",
      "linkedin.com", "twitter.com", "youtube.com", "reddit.com",
      "cnbc.com", "bloomberg.com", "statista.com",
    ],
    source_types: {
      official: [
        { domain: "google.com", url: "https://google.com", title: "Google — Official Homepage", description: "Google's main search portal serving over 8.5 billion queries per day.", quality_score: 1.0 },
        { domain: "about.google", url: "https://about.google", title: "About Google", description: "Company overview, products and corporate mission.", quality_score: 0.98 },
      ],
      social_media: [
        { domain: "linkedin.com", url: "https://linkedin.com/company/google", title: "Google — LinkedIn", description: "35M+ followers. Posts about engineering, culture and jobs.", quality_score: 0.91 },
        { domain: "twitter.com", url: "https://twitter.com/Google", title: "@Google on X/Twitter", description: "28M+ followers. Active on product updates and trending topics.", quality_score: 0.89 },
        { domain: "youtube.com", url: "https://youtube.com/google", title: "Google — YouTube Channel", description: "3.5M+ subscribers. Developer tutorials and product demos.", quality_score: 0.93 },
      ],
      professional: [
        { domain: "developers.google.com", url: "https://developers.google.com", title: "Google Developers", description: "Official developer documentation hub covering all Google APIs and SDKs.", quality_score: 0.96 },
      ],
      media: [
        { domain: "techcrunch.com", url: "https://techcrunch.com/tag/google", title: "TechCrunch — Google", description: "Coverage of Google's AI, acquisitions, and antitrust battles.", quality_score: 0.88 },
        { domain: "bloomberg.com", url: "https://bloomberg.com/google", title: "Bloomberg — Alphabet", description: "Financial analysis, market cap tracking and executive coverage.", quality_score: 0.92 },
      ],
      community: [
        { domain: "reddit.com", url: "https://reddit.com/r/google", title: "r/google — Reddit", description: "450K member subreddit discussing products, outages, and company news.", quality_score: 0.75 },
      ],
    },
    date_range: {
      earliest: "2024-01-01",
      latest: new Date().toISOString().split("T")[0],
    },
  },

  content_analysis: {
    content_themes: [
      {
        theme: "Artificial Intelligence & Gemini",
        frequency: 0.92,
        intent: "informational",
        subthemes: ["Large Language Models", "Google DeepMind", "Gemini API", "AI Overviews in Search"],
        evidence: [{ url: "https://blog.google/technology/ai", quote: "Gemini is our most capable AI model, available across Google products.", relevance_score: 0.97 }],
      },
      {
        theme: "Search Engine Dominance",
        frequency: 0.89,
        intent: "informational",
        subthemes: ["Market share 91.5%", "Algorithm updates", "Voice search"],
        evidence: [{ url: "https://statista.com/google-market-share", quote: "Google holds approximately 91.5% of global search engine market share.", relevance_score: 0.99 }],
      },
      {
        theme: "Cloud & Enterprise (Google Cloud)",
        frequency: 0.74,
        intent: "informational",
        subthemes: ["GCP", "BigQuery", "Vertex AI", "Workspace"],
        evidence: [{ url: "https://cloud.google.com", quote: "Google Cloud achieved $11B+ quarterly revenue in 2024.", relevance_score: 0.94 }],
      },
      {
        theme: "Antitrust & Regulatory Challenges",
        frequency: 0.61,
        intent: "informational",
        subthemes: ["DOJ lawsuit", "EU fines", "App store policies"],
        evidence: [{ url: "https://cnbc.com/google-antitrust", quote: "The DOJ ruled Google illegally monopolised the online search market.", relevance_score: 0.91 }],
      },
    ],
    sentiment: {
      overall: "positive",
    },
  },

  keywords: {
    content_keywords: [
      { keyword: "google search", intent: "navigational", evidence: [{ url: "https://google.com", quote: null, relevance_score: 1.0 }] },
      { keyword: "google ai gemini", intent: "informational", evidence: [{ url: "https://blog.google/technology/ai", quote: null, relevance_score: 0.97 }] },
      { keyword: "google cloud platform", intent: "commercial", evidence: [{ url: "https://cloud.google.com", quote: null, relevance_score: 0.89 }] },
      { keyword: "google ads", intent: "transactional", evidence: [{ url: "https://ads.google.com", quote: null, relevance_score: 0.88 }] },
      { keyword: "google workspace", intent: "commercial", evidence: [{ url: "https://workspace.google.com", quote: null, relevance_score: 0.85 }] },
      { keyword: "alphabet inc stock", intent: "commercial", evidence: [{ url: "https://bloomberg.com", quote: null, relevance_score: 0.72 }] },
      { keyword: "google developer tools", intent: "informational", evidence: [{ url: "https://developers.google.com", quote: null, relevance_score: 0.81 }] },
      { keyword: "google maps api", intent: "transactional", evidence: [{ url: "https://developers.google.com/maps", quote: null, relevance_score: 0.79 }] },
      { keyword: "google antitrust case", intent: "informational", evidence: [{ url: "https://cnbc.com", quote: null, relevance_score: 0.67 }] },
      { keyword: "google chrome browser", intent: "navigational", evidence: [{ url: "https://google.com/chrome", quote: null, relevance_score: 0.76 }] },
    ],
    keyword_themes: [
      { theme: "AI & Machine Learning", keywords: ["gemini ai", "google deepmind", "vertex ai", "tensorflow"], evidence: [{ url: "https://blog.google/technology/ai", quote: null, relevance_score: 0.95 }] },
      { theme: "Productivity Suite", keywords: ["google docs", "google sheets", "gmail", "google meet"], evidence: [{ url: "https://workspace.google.com", quote: null, relevance_score: 0.87 }] },
      { theme: "Developer Platform", keywords: ["firebase", "google apis", "cloud functions", "bigquery"], evidence: [{ url: "https://developers.google.com", quote: null, relevance_score: 0.84 }] },
    ],
  },

  competitors: [
    {
      name: "Microsoft Bing / Copilot",
      domain: "bing.com",
      strength_score: 7.2,
      overlap_keywords: ["ai search", "enterprise ai", "cloud services", "productivity apps"],
      unique_advantages: ["OpenAI GPT-4 integration", "Microsoft 365 bundling", "Azure cloud dominance"],
      relationship: "competitor",
      evidence: [{ url: "https://statista.com/bing-market-share", quote: "Bing holds 3.3% of global search market, growing post-ChatGPT integration.", relevance_score: 0.91 }],
    },
    {
      name: "Amazon AWS",
      domain: "aws.amazon.com",
      strength_score: 6.5,
      overlap_keywords: ["cloud computing", "ai platform", "machine learning", "serverless"],
      unique_advantages: ["Largest cloud market share at 31%", "E-commerce data moat", "Bedrock AI services"],
      relationship: "competitor",
      evidence: [{ url: "https://statista.com/cloud-market-share", quote: "AWS holds 31% of the global cloud infrastructure market vs Google Cloud's 11%.", relevance_score: 0.93 }],
    },
    {
      name: "Apple",
      domain: "apple.com",
      strength_score: 6.8,
      overlap_keywords: ["mobile search", "digital assistant", "app ecosystem", "cloud storage"],
      unique_advantages: ["Device ecosystem lock-in", "Privacy positioning", "Apple Intelligence roadmap"],
      relationship: "competitor",
      evidence: [{ url: "https://theverge.com/apple-google", quote: "Apple receives $18B/year from Google to remain Safari's default search engine.", relevance_score: 0.89 }],
    },
    {
      name: "Meta",
      domain: "meta.com",
      strength_score: 6.1,
      overlap_keywords: ["digital advertising", "social ai", "open source llm", "video content"],
      unique_advantages: ["Social graph data", "Open-source Llama models", "WhatsApp monetisation"],
      relationship: "competitor",
      evidence: [{ url: "https://cnbc.com/meta-google-ad", quote: "Meta and Google together control over 50% of global digital advertising revenue.", relevance_score: 0.88 }],
    },
  ],

  social_presence: {
    platforms: [
      { platform: "YouTube", url: "https://youtube.com/google", evidence: [{ url: "https://youtube.com/google", quote: "3.5M+ subscribers", relevance_score: 0.93 }] },
      { platform: "LinkedIn", url: "https://linkedin.com/company/google", evidence: [{ url: "https://linkedin.com/company/google", quote: "35M+ followers on LinkedIn", relevance_score: 0.91 }] },
      { platform: "Twitter/X", url: "https://twitter.com/Google", evidence: [{ url: "https://twitter.com/Google", quote: "28M+ followers", relevance_score: 0.89 }] },
      { platform: "Instagram", url: "https://instagram.com/google", evidence: [{ url: "https://instagram.com/google", quote: null, relevance_score: 0.78 }] },
    ],
  },

  backlink_analysis: {
    total_backlinks: 45000000,
    referring_domains: 2800000,
    backlink_sources: [
      { source_type: "direct_mentions", domain: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Google", title: "Google — Wikipedia", description: "Referenced across thousands of Wikipedia articles as a primary source.", link_type: "dofollow", evidence: [{ url: "https://en.wikipedia.org/wiki/Google", quote: null, relevance_score: 0.99 }] },
      { source_type: "press_coverage", domain: "techcrunch.com", url: "https://techcrunch.com/tag/google", title: "TechCrunch — Google Archive", description: "Thousands of editorial articles covering Google products and company news.", link_type: "dofollow", evidence: [{ url: "https://techcrunch.com", quote: null, relevance_score: 0.91 }] },
      { source_type: "educational_citations", domain: "stackoverflow.com", url: "https://stackoverflow.com", title: "Stack Overflow — Google API Mentions", description: "Millions of developer Q&A posts referencing Google APIs and documentation.", link_type: "nofollow", evidence: [{ url: "https://stackoverflow.com", quote: null, relevance_score: 0.88 }] },
      { source_type: "community_mentions", domain: "reddit.com", url: "https://reddit.com/r/google", title: "Reddit r/google Community", description: "450K member subreddit with millions of mentions and links to Google products.", link_type: "nofollow", evidence: [{ url: "https://reddit.com/r/google", quote: null, relevance_score: 0.82 }] },
      { source_type: "professional_references", domain: "github.com", url: "https://github.com/google", title: "Google — GitHub", description: "1000+ open-source repositories generating millions of developer backlinks.", link_type: "dofollow", evidence: [{ url: "https://github.com/google", quote: null, relevance_score: 0.94 }] },
    ],
  },

  recommendations: [
    {
      category: "content",
      priority: "high",
      title: "Double down on Gemini AI content marketing",
      description: "Create a dedicated content hub comparing Gemini vs GPT-4 with benchmarks, tutorials, and integration guides. This captures high-intent developer search traffic where Bing/Copilot is gaining ground.",
      expected_impact: "high",
      effort_required: "medium",
      evidence: [{ url: "https://blog.google/technology/ai", quote: "Gemini is our most capable AI model.", relevance_score: 0.95 }],
      implementation_steps: ["Create gemini.google.com benchmark hub", "Publish monthly capability comparison posts", "Launch Google AI developer newsletter"],
      data_driven_insights: ["Gemini-related searches grew 340% YoY", "Developer-focused content drives 3x more qualified trial signups"],
    },
    {
      category: "brand_development",
      priority: "high",
      title: "Proactively address antitrust narrative in owned media",
      description: "The DOJ antitrust ruling is creating sustained reputational risk. Publish transparency reports, open-source contributions metrics, and developer ecosystem economic impact data.",
      expected_impact: "medium",
      effort_required: "low",
      evidence: [{ url: "https://cnbc.com/google-antitrust", quote: "The DOJ ruled Google illegally monopolised the online search market.", relevance_score: 0.87 }],
      implementation_steps: ["Quarterly transparency blog posts", "Open-source contribution metrics dashboard", "Developer economic impact study"],
    },
    {
      category: "social_media",
      priority: "medium",
      title: "Launch verified TikTok and Threads presence",
      description: "Google has no verified TikTok presence and minimal Threads activity. Gen Z increasingly discovers brands through short-form video, not traditional search.",
      expected_impact: "medium",
      effort_required: "medium",
      evidence: [{ url: "https://theverge.com/social-gen-z", quote: "Gen Z spends 40% more time on TikTok than traditional search for discovery.", relevance_score: 0.82 }],
      implementation_steps: ["Launch verified Google TikTok account", "Repurpose Google Doodle content as Reels/TikToks", "Partner with developer influencers"],
    },
    {
      category: "content",
      priority: "medium",
      title: "Publish Google Cloud SMB-targeted content",
      description: "Google Cloud lags AWS and Azure in content volume for SMB decision-makers. Publish case studies and ROI calculators targeting the 5-500 employee business segment.",
      expected_impact: "medium",
      effort_required: "medium",
      evidence: [{ url: "https://cloud.google.com/blog", quote: "Google Cloud achieved $11B quarterly revenue.", relevance_score: 0.88 }],
      implementation_steps: ["Monthly SMB case study publication", "Cloud cost comparison calculator tool", "SMB-specific Workspace landing pages"],
      data_driven_insights: ["SMB cloud spending expected to grow 28% in 2025", "Content gap: AWS has 4x more SMB case studies than Google Cloud"],
    },
    {
      category: "community_building",
      priority: "low",
      title: "Expand Google Developer Community Program",
      description: "The Stack Overflow and GitHub developer communities generate millions of organic backlinks. Formalising a Google Developer Advocates program will amplify this.",
      expected_impact: "medium",
      effort_required: "high",
      evidence: [{ url: "https://github.com/google", quote: null, relevance_score: 0.85 }],
      implementation_steps: ["Expand Google Developer Experts program by 50%", "Launch monthly Google DevFest events globally", "Create Google Developer certification pathways"],
    },
  ],

  summary: {
    overall_score: 94,
    key_strengths: [
      "Unrivalled search market share at 91.5% globally with massive brand recognition",
      "Rapidly growing AI portfolio with Gemini, DeepMind, and Vertex AI leadership",
      "45M+ high-authority backlinks providing extraordinary domain authority",
      "Multi-platform social presence reaching 60M+ combined followers",
      "Google Cloud achieving $11B+ quarterly revenue with accelerating enterprise adoption",
    ],
    critical_issues: [
      "DOJ antitrust ruling creates sustained reputational and operational risk",
      "Bing+Copilot integration is the most credible search market share threat in 25 years",
      "No verified TikTok presence creates a Gen Z brand perception gap",
      "AI Overviews in Search may cannibalise publisher content, triggering ad revenue decline",
    ],
    quick_wins: [
      "Publish a Gemini vs GPT-4 benchmark blog post (high search intent, 1 week effort)",
      "Verify and activate Google TikTok account with repurposed Doodle content",
      "Add SMB-specific Workspace landing pages with pricing comparison tables",
    ],
    long_term_opportunities: [
      "Become the default enterprise AI platform by bundling Gemini into Google Workspace",
      "Leverage YouTube creator economy to build developer and SMB marketing flywheels",
      "Use Waymo autonomous vehicle data to establish AI/robotics thought leadership",
    ],
  },
};
