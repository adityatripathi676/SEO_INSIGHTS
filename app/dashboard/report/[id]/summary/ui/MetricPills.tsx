"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import { Search, Globe, Target, Users, Link2, BarChart3 } from "lucide-react";

interface Props { seoReport: SeoReport; }

interface Pill {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

export function MetricPills({ seoReport }: Props) {
  const pills: Pill[] = [
    {
      icon: Search,
      label: "Keywords",
      value: seoReport?.keywords?.content_keywords?.length ?? 0,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Globe,
      label: "Sources",
      value: seoReport?.inventory?.total_sources ?? 0,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: Target,
      label: "Domains",
      value: seoReport?.inventory?.unique_domains?.length ?? 0,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: Users,
      label: "Competitors",
      value: seoReport?.competitors?.length ?? 0,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Link2,
      label: "Backlinks",
      value: seoReport?.backlink_analysis?.total_backlinks
        ? seoReport.backlink_analysis.total_backlinks >= 1_000_000
          ? `${(seoReport.backlink_analysis.total_backlinks / 1_000_000).toFixed(1)}M`
          : seoReport.backlink_analysis.total_backlinks >= 1_000
          ? `${(seoReport.backlink_analysis.total_backlinks / 1_000).toFixed(0)}K`
          : seoReport.backlink_analysis.total_backlinks
        : 0,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: BarChart3,
      label: "Platforms",
      value: seoReport?.social_presence?.platforms?.length ?? 0,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 stagger-children">
      {pills.map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className="glass rounded-xl px-4 py-3.5 shadow-apple text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-md"
        >
          <div className={`inline-flex size-8 rounded-lg ${bg} items-center justify-center mb-2`}>
            <Icon className={`size-4 ${color}`} />
          </div>
          <div className="text-xl font-bold tabular-nums text-foreground leading-none">{value}</div>
          <div className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">{label}</div>
        </div>
      ))}
    </div>
  );
}
