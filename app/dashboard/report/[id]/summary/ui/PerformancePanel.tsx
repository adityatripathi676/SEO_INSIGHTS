"use client";

import React, { useState } from "react";
import { SeoReport } from "@/lib/seo-schema";
import { Zap, Smartphone, Monitor, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  seoReport: SeoReport;
}

function getScoreColors(score: number): { text: string; bg: string; border: string } {
  if (score >= 90) return { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
  if (score >= 50) return { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
}

function getMetricColor(metricVal: number, metricType: "lcp" | "cls" | "ttfb"): string {
  if (metricType === "lcp") {
    if (metricVal <= 2500) return "text-green-500";
    if (metricVal <= 4000) return "text-amber-500";
    return "text-red-500";
  }
  if (metricType === "cls") {
    if (metricVal <= 0.1) return "text-green-500";
    if (metricVal <= 0.25) return "text-amber-500";
    return "text-red-500";
  }
  if (metricType === "ttfb") {
    if (metricVal <= 800) return "text-green-500";
    if (metricVal <= 1800) return "text-amber-500";
    return "text-red-500";
  }
  return "text-foreground";
}

export function PerformancePanel({ seoReport }: Props) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const perf = seoReport?.performance;

  if (!perf) return null;

  const activeScore = device === "mobile" ? perf.mobile_score : perf.desktop_score;
  const scoreColors = getScoreColors(activeScore);

  return (
    <div className="glass-strong rounded-2xl shadow-apple overflow-hidden border border-border/60">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Zap className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Core Web Vitals & Performance
            </h3>
            <p className="text-xs text-muted-foreground">
              Powered by Google PageSpeed Insights API & Lighthouse
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="inline-flex items-center rounded-xl p-1 bg-muted/60 border border-border/50 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setDevice("mobile")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === "mobile"
                ? "bg-background text-foreground shadow-apple-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="size-3.5" />
            Mobile
          </button>
          <button
            onClick={() => setDevice("desktop")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === "desktop"
                ? "bg-background text-foreground shadow-apple-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="size-3.5" />
            Desktop
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-6 grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Score Ring / Card */}
        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${scoreColors.bg} ${scoreColors.border}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {device} Score
          </span>
          <span className={`text-5xl font-extrabold tabular-nums ${scoreColors.text}`}>
            {activeScore || "—"}
          </span>
          <span className="text-xs text-muted-foreground mt-1">out of 100</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              LCP (Largest Contentful)
            </span>
            <span className={`text-lg font-bold tabular-nums ${getMetricColor(perf.lcp_ms, "lcp")}`}>
              {perf.lcp_ms ? `${(perf.lcp_ms / 1000).toFixed(2)}s` : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Target: &lt; 2.5s</span>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              CLS (Layout Shift)
            </span>
            <span className={`text-lg font-bold tabular-nums ${getMetricColor(perf.cls, "cls")}`}>
              {perf.cls !== undefined ? perf.cls : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Target: &lt; 0.1</span>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              TTFB (Time to First Byte)
            </span>
            <span className={`text-lg font-bold tabular-nums ${getMetricColor(perf.ttfb_ms, "ttfb")}`}>
              {perf.ttfb_ms ? `${perf.ttfb_ms}ms` : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Target: &lt; 800ms</span>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              FCP (First Contentful)
            </span>
            <span className="text-lg font-bold text-foreground tabular-nums">
              {perf.fcp_ms ? `${(perf.fcp_ms / 1000).toFixed(2)}s` : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Target: &lt; 1.8s</span>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {perf.opportunities && perf.opportunities.length > 0 && (
        <div className="px-6 pb-6 border-t border-border/40 pt-4">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertCircle className="size-3.5 text-amber-500" />
            Top Optimization Opportunities
          </h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {perf.opportunities.map((opp, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-foreground">
                <CheckCircle2 className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{opp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
