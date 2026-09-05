"use client";

import React, { useState } from "react";
import { SeoReport } from "@/lib/seo-schema";
import { Search, LayoutGrid, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Props { seoReport: SeoReport; }

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  informational: { label: "Info",    color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500/10"   },
  navigational:  { label: "Nav",     color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10"  },
  transactional: { label: "Trans",   color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-500/10"},
  commercial:    { label: "Comm",    color: "text-orange-600 dark:text-orange-400",bg: "bg-orange-500/10"},
};
const DEFAULT_INTENT = { label: "Other", color: "text-muted-foreground", bg: "bg-muted/50" };

export function KeywordsPanel({ seoReport }: Props) {
  const [tab, setTab] = useState<"keywords" | "themes">("keywords");

  const keywords = seoReport?.keywords?.content_keywords ?? [];
  const themes   = seoReport?.keywords?.keyword_themes   ?? [];

  return (
    <div className="glass rounded-2xl shadow-apple overflow-hidden">
      {/* Header + tabs */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Search className="size-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Keyword Analysis</h3>
            <p className="text-xs text-muted-foreground">Content keywords and thematic clusters</p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
          {(["keywords", "themes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t
                  ? "bg-background shadow-apple-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "keywords" ? `Keywords (${keywords.length})` : `Themes (${themes.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "keywords" ? (
        <div className="p-5">
          {keywords.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Keyword Clusters Discovered"
              description="No primary search intent or target keywords were identified in the scraping dataset."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {keywords.map((kw, i) => {
                const intent = INTENT_CONFIG[kw.intent ?? ""] ?? DEFAULT_INTENT;
                const topEvidence = kw.evidence?.[0];
                return (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-background/40 hover:bg-background/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{kw.keyword}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${intent.bg} ${intent.color}`}>
                          {intent.label}
                        </span>
                      </div>
                      {topEvidence && (
                        <a
                          href={topEvidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="size-2.5" />
                          {(() => { try { return new URL(topEvidence.url).hostname; } catch { return topEvidence.url; } })()}
                          <span className="ml-auto">
                            {Math.round(topEvidence.relevance_score * 100)}%
                          </span>
                        </a>
                      )}
                    </div>
                    {/* Relevance bar */}
                    {topEvidence && (
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-bold tabular-nums text-foreground">
                          {Math.round(topEvidence.relevance_score * 100)}%
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(topEvidence.relevance_score * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {themes.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No Keyword Themes Discovered"
              description="No thematic keyword groupings were detected for this analysis."
            />
          ) : (
            themes.map((theme, i) => {
              const topEvidence = theme.evidence?.[0];
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/60 bg-background/40"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <LayoutGrid className="size-3.5 text-orange-500" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{theme.theme}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {theme.keywords.length} keywords
                    </span>
                  </div>

                  {/* Keywords chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {theme.keywords.map((kw, ki) => (
                      <span
                        key={ki}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/8 border border-orange-500/15 text-orange-700 dark:text-orange-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Top evidence link */}
                  {topEvidence && (
                    <a
                      href={topEvidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="size-3" />
                      {(() => { try { return new URL(topEvidence.url).hostname; } catch { return topEvidence.url; } })()}
                      <span className="ml-auto font-medium">
                        {Math.round(topEvidence.relevance_score * 100)}% relevance
                      </span>
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
