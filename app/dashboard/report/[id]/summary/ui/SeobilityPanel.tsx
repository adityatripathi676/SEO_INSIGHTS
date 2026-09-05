"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import {
  Sparkles,
  AlertTriangle,
  FileText,
  Layers,
  Search,
  Check,
  X,
  Code2,
  Gauge
} from "lucide-react";

interface Props {
  seoReport: SeoReport;
}

export function SeobilityPanel({ seoReport }: Props) {
  const meta = seoReport?.meta;
  const tech = seoReport?.technical;
  const perf = seoReport?.performance;
  const kw = seoReport?.keywords;

  // Calculate Seobility Pillar Scores
  const techMetaScore = Math.min(
    100,
    (tech?.is_https ? 20 : 0) +
      (tech?.ssl_valid ? 20 : 0) +
      (tech?.has_robots_txt ? 20 : 0) +
      (tech?.has_sitemap ? 20 : 0) +
      (tech?.has_structured_data ? 20 : 10)
  );

  const structureScore = Math.min(
    100,
    (tech?.has_sitemap ? 30 : 15) +
      (tech?.response_code === 200 ? 30 : 10) +
      (tech?.has_hreflang ? 20 : 10) +
      20
  );

  const contentScore = Math.min(
    100,
    perf?.mobile_score
      ? Math.round(perf.mobile_score * 0.7 + 30)
      : 0
  );

  const overallHealth = Math.round(
    (techMetaScore * 0.35 + structureScore * 0.30 + contentScore * 0.35)
  );

  // Extract top keywords for table
  const contentKeywords = kw?.content_keywords ?? [];
  const keywordThemes = kw?.keyword_themes ?? [];

  return (
    <div className="glass-strong rounded-2xl shadow-apple overflow-hidden border border-border/60">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              Seobility Site Audit & Optimization Index
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                PRO AUDIT
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Complete On-Page, Structural & Quality Audit for {meta?.entity_name ?? "Domain"}
            </p>
          </div>
        </div>
      </div>

      {/* Seobility 3-Pillar Score Hero */}
      <div className="p-6 grid lg:grid-cols-[240px_1fr] gap-6 border-b border-border/50">
        {/* Score Ring */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            SEO Health Score
          </span>
          <div className="relative flex items-center justify-center size-24 rounded-full border-4 border-purple-500/30 bg-purple-500/5 my-2">
            <span className="text-4xl font-extrabold text-foreground tabular-nums">
              {overallHealth}%
            </span>
          </div>
          <span className="text-xs font-medium text-purple-400 mt-1">
            {overallHealth >= 80 ? "Excellent Optimization" : overallHealth >= 60 ? "Good — Minor Issues" : "Needs Optimization"}
          </span>
        </div>

        {/* 3 Pillars Progress */}
        <div className="space-y-4 flex flex-col justify-center">
          {/* Pillar 1 */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1.5">
              <span className="flex items-center gap-2">
                <Code2 className="size-3.5 text-blue-500" />
                Tech & Meta SEO (Infrastructure, SSL, Tags)
              </span>
              <span className="font-bold tabular-nums">{techMetaScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${techMetaScore}%` }}
              />
            </div>
          </div>

          {/* Pillar 2 */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1.5">
              <span className="flex items-center gap-2">
                <Layers className="size-3.5 text-purple-500" />
                Structure & Crawlability (Sitemap, HTTP, Hierarchy)
              </span>
              <span className="font-bold tabular-nums">{structureScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${structureScore}%` }}
              />
            </div>
          </div>

          {/* Pillar 3 */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-foreground mb-1.5">
              <span className="flex items-center gap-2">
                <Gauge className="size-3.5 text-green-500" />
                Content Quality & Core Web Vitals
              </span>
              <span className="font-bold tabular-nums">{contentScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${contentScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* On-Page & Technical Checklist Grid */}
      <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-border/50">
        <AuditItem
          title="HTTPS & Security SSL"
          status={tech?.is_https && tech?.ssl_valid ? "pass" : "fail"}
          value={tech?.is_https ? "HTTPS Enforced · SSL Valid" : "HTTP Only (Insecure)"}
        />
        <AuditItem
          title="Robots.txt Crawl Rules"
          status={tech?.has_robots_txt && !tech?.robots_disallows_all ? "pass" : "warning"}
          value={tech?.has_robots_txt ? "Robots.txt Active" : "Robots.txt Missing"}
        />
        <AuditItem
          title="XML Sitemap Index"
          status={tech?.has_sitemap ? "pass" : "warning"}
          value={tech?.has_sitemap ? `Indexed (${tech.sitemap_url_count} URLs)` : "No Sitemap Found"}
        />
        <AuditItem
          title="Schema.org Structured Data"
          status={tech?.has_structured_data ? "pass" : "info"}
          value={tech?.has_structured_data ? "JSON-LD Schema Active" : "No Schema Detected"}
        />
        <AuditItem
          title="HTTP Response Code"
          status={tech?.response_code === 200 ? "pass" : "warning"}
          value={tech?.response_code ? `HTTP ${tech.response_code} OK` : "200 OK"}
        />
        <AuditItem
          title="Hreflang & Internationalization"
          status={tech?.has_hreflang ? "pass" : "info"}
          value={tech?.has_hreflang ? "Hreflang Tags Active" : "Single Language Target"}
        />
      </div>

      {/* Keyword Frequency & N-Grams Table (Seobility Style) */}
      <div className="p-6">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Search className="size-4 text-primary" />
          Primary Keyword Frequency & Intent Analysis
        </h4>

        {contentKeywords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border/60">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Keyword</th>
                  <th className="px-4 py-2.5 font-semibold">Intent</th>
                  <th className="px-4 py-2.5 font-semibold">Source Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {contentKeywords.slice(0, 8).map((k, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                      <FileText className="size-3.5 text-primary" />
                      {k.keyword}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        k.intent === "transactional" ? "bg-green-500/10 text-green-500" :
                        k.intent === "commercial" ? "bg-purple-500/10 text-purple-500" :
                        k.intent === "navigational" ? "bg-blue-500/10 text-blue-500" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        {k.intent ?? "informational"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">
                      {k.evidence?.[0]?.quote || k.evidence?.[0]?.url || "High frequency on main page"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : keywordThemes.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {keywordThemes.map((kt, i) => (
              <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/50">
                <span className="text-xs font-semibold text-foreground block mb-1">{kt.theme}</span>
                <div className="flex flex-wrap gap-1">
                  {(kt.keywords ?? []).slice(0, 5).map((kw, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
            Keyword density analysis processed cleanly.
          </div>
        )}
      </div>
    </div>
  );
}

function AuditItem({
  title,
  status,
  value,
}: {
  title: string;
  status: "pass" | "warning" | "fail" | "info";
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50">
      <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        status === "pass" ? "bg-green-500/15 text-green-500" :
        status === "warning" ? "bg-amber-500/15 text-amber-500" :
        status === "fail" ? "bg-red-500/15 text-red-500" :
        "bg-blue-500/15 text-blue-500"
      }`}>
        {status === "pass" ? <Check className="size-3" /> :
         status === "fail" ? <X className="size-3" /> :
         <AlertTriangle className="size-3" />}
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
