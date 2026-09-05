"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target, Shield } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Props {
  seoReport: SeoReport;
}

const QUADRANT_COLORS = ["#ff453a", "#bf5af2", "#30d158", "#0a84ff"];

export function CompetitorMatrixChart({ seoReport }: Props) {
  const competitors = seoReport?.competitors ?? [];

  // Transform competitors into 2D scatter matrix points
  const matrixData = competitors
    .filter((c) => c.name && c.strength_score !== undefined)
    .map((c) => {
      const strength = Number(c.strength_score) || 5;
      const overlapCount = c.overlap_keywords?.length ?? 1;
      // Normalize overlap to 0-10 scale
      const overlapScore = Math.min(10, Math.max(1, overlapCount * 2));

      return {
        name: c.name || c.domain,
        domain: c.domain,
        x: overlapScore, // Overlap Density (0-10)
        y: strength,     // Authority Strength (0-10)
        z: (c.unique_advantages?.length ?? 1) * 100, // Dot size weighting
        overlapKeywords: c.overlap_keywords ?? [],
        advantages: c.unique_advantages ?? [],
      };
    });

  return (
    <div className="glass rounded-2xl shadow-apple overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
        <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Target className="size-4 text-purple-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Competitor 2D Positioning Matrix</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              Authority vs Overlap
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Market Authority (Y-axis) vs. Keyword Overlap Density (X-axis)
          </p>
        </div>
      </div>

      {matrixData.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Shield}
            title="No Competitor Matrix Data"
            description="Insufficient competitor overlap metrics to construct a 2D positioning scatter matrix."
          />
        </div>
      ) : (
        <div className="p-5">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Keyword Overlap"
                  domain={[0, 10]}
                  unit="/10"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  label={{
                    value: "Keyword Overlap Density →",
                    position: "bottom",
                    offset: 0,
                    style: { fontSize: "10px", fill: "var(--muted-foreground)" },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Authority Strength"
                  domain={[0, 10]}
                  unit="/10"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  label={{
                    value: "Authority Score ↑",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "10px", fill: "var(--muted-foreground)" },
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 240]} name="Advantages" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="p-2 space-y-1 max-w-xs">
                        <div className="font-semibold text-foreground text-xs border-b border-border/40 pb-1">
                          {data.name} ({data.domain})
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Authority Strength: <span className="font-semibold text-primary">{data.y} / 10</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Keyword Overlap: <span className="font-semibold text-primary">{data.x} / 10</span>
                        </div>
                        {data.overlapKeywords.length > 0 && (
                          <div className="text-[10px] text-muted-foreground pt-1">
                            Overlap: {data.overlapKeywords.slice(0, 3).join(", ")}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Scatter name="Competitors" data={matrixData}>
                  {matrixData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={QUADRANT_COLORS[index % QUADRANT_COLORS.length]}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Matrix Quadrants Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff453a]" />
              <span>High Authority / High Overlap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#bf5af2]" />
              <span>Authority Leaders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#30d158]" />
              <span>Niche Challengers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#0a84ff]" />
              <span>Emerging Competitors</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
