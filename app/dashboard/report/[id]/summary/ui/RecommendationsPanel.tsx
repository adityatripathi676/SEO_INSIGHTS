"use client";

import React, { useState } from "react";
import { SeoReport } from "@/lib/seo-schema";
import {
  AlertTriangle, TrendingUp, CheckCircle, Lightbulb,
  ChevronDown, ChevronUp, ArrowUpRight, CheckCircle2,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Props { seoReport: SeoReport; }

const PRIORITY_CONFIG = {
  high:   { bg: "bg-red-500/8",    border: "border-red-500/20",    badge: "bg-red-500/10 text-red-600 dark:text-red-400",    icon: AlertTriangle,  dot: "bg-red-500"   },
  medium: { bg: "bg-amber-500/8",  border: "border-amber-500/20",  badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",icon: TrendingUp,    dot: "bg-amber-500" },
  low:    { bg: "bg-blue-500/8",   border: "border-blue-500/20",   badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",  icon: CheckCircle,   dot: "bg-blue-500"  },
};

const IMPACT_COLOR: Record<string, string> = {
  high:   "text-green-600 dark:text-green-400 bg-green-500/10",
  medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  low:    "text-muted-foreground bg-muted/50",
};

export function RecommendationsPanel({ seoReport }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const recs = seoReport?.recommendations ?? [];

  return (
    <div className="glass rounded-2xl shadow-apple overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
        <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Lightbulb className="size-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Actionable Recommendations</h3>
          <p className="text-xs text-muted-foreground">Prioritised strategies to boost SEO performance</p>
        </div>
        <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50">
          {recs.length}
        </span>
      </div>

      {recs.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={CheckCircle2}
            title="All Checks Passed — No Critical Actions Required"
            description="No critical SEO deficiencies or mandatory optimization items were flagged for this query."
          />
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {recs.map((rec, i) => {
            const cfg = PRIORITY_CONFIG[rec.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
            const Icon = cfg.icon;
            const isOpen = expanded === i;

            return (
              <div key={i} className={`${cfg.bg} border-l-[3px] ${cfg.border.replace("border-", "border-l-")} transition-colors`}>
                {/* Collapsed row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`size-7 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="size-3.5 text-current" style={{ color: undefined }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{rec.title}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{rec.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${IMPACT_COLOR[rec.expected_impact ?? "low"]}`}>
                      <ArrowUpRight className="size-3" />
                      {rec.expected_impact}
                    </span>
                    {isOpen
                      ? <ChevronUp className="size-4 text-muted-foreground" />
                      : <ChevronDown className="size-4 text-muted-foreground" />
                    }
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4">
                    <p className="text-sm text-foreground leading-relaxed">{rec.description}</p>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground capitalize">
                        Category: {rec.category?.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${IMPACT_COLOR[rec.expected_impact ?? "low"]}`}>
                        Impact: {rec.expected_impact}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground capitalize">
                        Effort: {rec.effort_required}
                      </span>
                    </div>

                    {/* Steps */}
                    {rec.implementation_steps && rec.implementation_steps.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Implementation Steps
                        </p>
                        <ol className="space-y-1.5">
                          {rec.implementation_steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-2.5 text-sm">
                              <span className="flex-shrink-0 size-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                                {si + 1}
                              </span>
                              <span className="text-foreground leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Insights */}
                    {rec.data_driven_insights && rec.data_driven_insights.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Data Insights
                        </p>
                        <ul className="space-y-1.5">
                          {rec.data_driven_insights.map((ins, ii) => (
                            <li key={ii} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="size-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {ins}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
