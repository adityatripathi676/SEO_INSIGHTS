"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface Props { seoReport: SeoReport; }

function getScoreColor(score: number) {
  if (score >= 80) return "#30d158"; // Apple green
  if (score >= 60) return "#ffd60a"; // Apple yellow
  return "#ff453a";                   // Apple red
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function ScoreHero({ seoReport }: Props) {
  let raw = seoReport?.summary?.overall_score;
  if (!raw) {
    const tech = seoReport?.technical;
    const perf = seoReport?.performance;
    const techMetaScore = Math.min(100, (tech?.is_https ? 20 : 0) + (tech?.ssl_valid ? 20 : 0) + (tech?.has_robots_txt ? 20 : 0) + (tech?.has_sitemap ? 20 : 0) + (tech?.has_structured_data ? 20 : 10));
    const structureScore = Math.min(100, (tech?.has_sitemap ? 30 : 15) + (tech?.response_code === 200 ? 30 : 10) + (tech?.has_hreflang ? 20 : 10) + 20);
    const contentScore = Math.min(100, perf?.mobile_score ? Math.round(perf.mobile_score * 0.7 + 30) : 0);
    raw = Math.round(techMetaScore * 0.35 + structureScore * 0.30 + contentScore * 0.35);
  }
  const score = Math.round(raw < 1 && raw > 0 ? raw * 100 : raw);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const sentiment = seoReport?.content_analysis?.sentiment?.overall ?? "neutral";

  const chartData = [{ value: score, fill: color }];

  return (
    <div className="glass-strong rounded-2xl shadow-apple-md overflow-hidden gradient-border">
      <div className="grid lg:grid-cols-[1fr_320px] gap-0">

        {/* Left — entity info & summary bullets */}
        <div className="px-7 py-7 lg:border-r border-border/60">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="size-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-apple-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
            >
              {(seoReport?.meta?.entity_name ?? "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">
                {seoReport?.meta?.entity_name}
              </h2>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">
                {seoReport?.meta?.entity_type} · {seoReport?.meta?.analysis_date}
              </p>
              <span
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                style={{ background: `${color}18`, color }}
              >
                <span className="size-1.5 rounded-full" style={{ background: color }} />
                Sentiment: {sentiment}
              </span>
            </div>
          </div>

          {/* Summary bullets grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Strengths */}
            {(seoReport?.summary?.key_strengths ?? []).slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-green-500/6 border border-green-500/12">
                <span className="mt-0.5 size-4 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="size-1.5 rounded-full bg-green-500" />
                </span>
                <p className="text-xs text-foreground leading-relaxed">{s}</p>
              </div>
            ))}
            {/* Critical issues */}
            {(seoReport?.summary?.critical_issues ?? []).slice(0, 1).map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/6 border border-red-500/12">
                <span className="mt-0.5 size-4 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="size-1.5 rounded-full bg-red-500" />
                </span>
                <p className="text-xs text-foreground leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — radial score gauge */}
        <div className="flex flex-col items-center justify-center px-7 py-7 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
            SEO Score
          </p>
          <div className="relative w-52 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="90%"
                barSize={14}
                data={chartData}
                startAngle={225}
                endAngle={-45}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                {/* Background track */}
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: "rgba(128,128,128,0.12)" }}
                  angleAxisId={0}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Centre text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums" style={{ color }}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground mt-1 font-medium">/ 100</span>
              <span className="text-xs font-semibold mt-1 uppercase tracking-wider" style={{ color }}>
                {label}
              </span>
            </div>
          </div>
          {/* Tick marks */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {[["#ff453a","< 40"],["#ffd60a","40–79"],["#30d158","80+"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="size-2 rounded-full flex-shrink-0" style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
