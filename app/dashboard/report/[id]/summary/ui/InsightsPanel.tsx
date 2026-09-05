"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import { Zap, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Props { seoReport: SeoReport; }

interface Section {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  iconBg: string;
  iconColor: string;
  items: string[];
  dotColor: string;
  itemBg: string;
  itemBorder: string;
}

export function InsightsPanel({ seoReport }: Props) {
  const summary = seoReport?.summary;

  const sections: Section[] = [
    {
      title: "Key Strengths",
      icon: CheckCircle2,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      items: summary?.key_strengths ?? [],
      dotColor: "bg-green-500",
      itemBg: "bg-green-500/5",
      itemBorder: "border-green-500/15",
    },
    {
      title: "Critical Issues",
      icon: AlertTriangle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      items: summary?.critical_issues ?? [],
      dotColor: "bg-red-500",
      itemBg: "bg-red-500/5",
      itemBorder: "border-red-500/15",
    },
    {
      title: "Quick Wins",
      icon: Zap,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      items: summary?.quick_wins ?? [],
      dotColor: "bg-amber-500",
      itemBg: "bg-amber-500/5",
      itemBorder: "border-amber-500/15",
    },
    {
      title: "Long-term Opportunities",
      icon: ArrowRight,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      items: summary?.long_term_opportunities ?? [],
      dotColor: "bg-blue-500",
      itemBg: "bg-blue-500/5",
      itemBorder: "border-blue-500/15",
    },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No Summary Insights Generated"
        description="Detailed strategic insights and quick wins were not populated for this report."
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {sections.map(({ title, icon: Icon, iconBg, iconColor, items, dotColor, itemBg, itemBorder }) => (
        <div key={title} className="glass rounded-2xl shadow-apple overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
            <div className={`size-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`size-4 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <ul className="p-4 space-y-2.5">
            {items.map((item, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border ${itemBg} ${itemBorder}`}
              >
                <span className={`size-2 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
                <span className="text-sm text-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
