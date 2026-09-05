"use client";

import React, { useState } from "react";
import { SeoReport } from "@/lib/seo-schema";
import { Globe, ExternalLink, ShieldCheck, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";

interface Props {
  seoReport: SeoReport;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  direct_mentions:         { bg: "bg-blue-500/10",   text: "text-blue-500",   border: "border-blue-500/20" },
  professional_references: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  educational_citations:   { bg: "bg-green-500/10",  text: "text-green-500",  border: "border-green-500/20" },
  community_mentions:      { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  press_coverage:          { bg: "bg-pink-500/10",   text: "text-pink-500",   border: "border-pink-500/20" },
  directory_listings:      { bg: "bg-cyan-500/10",   text: "text-cyan-500",   border: "border-cyan-500/20" },
  social_shares:           { bg: "bg-amber-500/10",  text: "text-amber-500",  border: "border-amber-500/20" },
  other:                   { bg: "bg-muted/50",       text: "text-muted-foreground", border: "border-border/40" },
};

export function IndexedSourcesPanel({ seoReport }: Props) {
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const sources = seoReport?.backlink_analysis?.backlink_sources ?? [];
  const totalBacklinks = seoReport?.backlink_analysis?.total_backlinks ?? sources.length;
  const referringDomains = seoReport?.backlink_analysis?.referring_domains ?? seoReport?.inventory?.unique_domains?.length ?? 0;

  // Filter sources
  const filteredSources = sources.filter((src) => {
    const matchesSearch =
      filterQuery === "" ||
      src.domain.toLowerCase().includes(filterQuery.toLowerCase()) ||
      src.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (src.description && src.description.toLowerCase().includes(filterQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || src.source_type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(sources.map((s) => s.source_type || "other")));

  return (
    <div className="glass rounded-2xl shadow-apple overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-border/60 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Globe className="size-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Indexed Web Sources</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-3" /> Real Web Index
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {referringDomains} referring domains · {totalBacklinks} verified citations
            </p>
          </div>
        </div>

        {/* Search & Filter input */}
        {sources.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Filter index sources…"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-lg bg-background/50 border-border/60"
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="px-5 py-2.5 border-b border-border/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-white"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories ({sources.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.replace(/_/g, " ")} ({sources.filter((s) => s.source_type === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Grid of Indexed Cards */}
      {sources.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Globe}
            title="No Indexed Web Citations Found"
            description="No direct backlinks or indexed web sources were recorded for this entity."
          />
        </div>
      ) : filteredSources.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground">
          No indexed sources match your search filter "{filterQuery}".
        </div>
      ) : (
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((src, i) => {
            const catStyle = CATEGORY_COLORS[src.source_type || "other"] || CATEGORY_COLORS.other;
            const topEvidence = src.evidence?.[0];
            const relevanceScore = topEvidence?.relevance_score
              ? Math.round(topEvidence.relevance_score * 100)
              : 85;

            return (
              <div
                key={i}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border/60 bg-background/40 hover:bg-background/80 hover:border-primary/30 transition-all duration-200 shadow-apple-sm hover:shadow-apple"
              >
                <div>
                  {/* Domain & Favicon Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Favicon badge */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${src.domain}&sz=64`}
                        alt={src.domain}
                        className="size-5 rounded-md object-contain flex-shrink-0 bg-muted/30 p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {src.domain}
                      </span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border} capitalize flex-shrink-0`}>
                      {src.source_type?.replace(/_/g, " ") || "Index"}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {src.title}
                  </h4>

                  {/* Description / Snippet */}
                  {src.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      "{src.description}"
                    </p>
                  )}
                </div>

                {/* Footer Link & Relevance */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    View Citation <ExternalLink className="size-3" />
                  </a>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="tabular-nums font-semibold text-foreground">{relevanceScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Rel</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
