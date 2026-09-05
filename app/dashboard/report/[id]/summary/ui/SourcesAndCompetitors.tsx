"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Globe, Users, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Props { seoReport: SeoReport; }

const PIE_COLORS = ["#0a84ff", "#30d158", "#ffd60a", "#bf5af2", "#ff453a", "#64d2ff"];

// score out of 10 → display as /10
function compScore(raw: number): number {
  return raw < 1 ? Math.round(raw * 10) : Math.round(raw * 10) / 10;
}

export function SourcesAndCompetitors({ seoReport }: Props) {
  /* ── Pie data ─────────────────────────────────────────────────── */
  const st = seoReport?.inventory?.source_types as Record<string, unknown[]> | undefined;
  const pieData = st
    ? Object.entries(st)
        .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
        .map(([name, arr], i) => ({
          name: name.replace(/_/g, " "),
          value: arr.length,
          color: PIE_COLORS[i % PIE_COLORS.length],
        }))
    : [];

  /* ── Bar data ─────────────────────────────────────────────────── */
  const barData = (seoReport?.competitors ?? [])
    .filter((c) => c.strength_score && c.name)
    .map((c) => ({
      name: (c.name ?? "").length > 14 ? (c.name ?? "").slice(0, 13) + "…" : c.name ?? "",
      score: compScore(Number(c.strength_score)),
    }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* ── Sources donut ──────────────────────────────────────────── */}
      <div className="glass rounded-2xl shadow-apple overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Globe className="size-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Source Distribution</h3>
            <p className="text-xs text-muted-foreground">Data sources by type and volume</p>
          </div>
        </div>

        {pieData.length > 0 ? (
          <div className="p-5 flex flex-col sm:flex-row items-center gap-4">
            {/* Donut */}
            <div className="w-full sm:w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2 min-w-0">
              {pieData.map((entry, i) => {
                const total = pieData.reduce((s, e) => s + e.value, 0);
                const pct = Math.round((entry.value / total) * 100);
                return (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-full flex-shrink-0"
                        style={{ background: entry.color }}
                      />
                      <span className="text-xs text-foreground capitalize truncate">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: entry.color }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={PieIcon}
              title="No Source Distribution Data"
              description="No indexed source breakdown could be extracted for this query."
            />
          </div>
        )}
      </div>

      {/* ── Competitor bars ────────────────────────────────────────── */}
      <div className="glass rounded-2xl shadow-apple overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
          <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Users className="size-4 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Competitor Strength</h3>
            <p className="text-xs text-muted-foreground">Market positioning analysis (score / 10)</p>
          </div>
        </div>

        {barData.length > 0 ? (
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                barSize={14}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="rgba(128,128,128,0.12)"
                />
                <XAxis
                  type="number"
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v: number) => [`${v} / 10`, "Strength"]}
                  cursor={{ fill: "rgba(128,128,128,0.06)" }}
                />
                <Bar
                  dataKey="score"
                  radius={[0, 6, 6, 0]}
                  fill="#0a84ff"
                  label={{
                    position: "right",
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                    formatter: (v: number) => `${v}`,
                  }}
                >
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.score >= 7
                          ? "#ff453a"
                          : entry.score >= 5
                          ? "#ffd60a"
                          : "#30d158"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex items-center justify-end gap-4 mt-2 text-[10px] text-muted-foreground">
              {[["#ff453a","High (7+)"],["#ffd60a","Mid (5-7)"],["#30d158","Low (<5)"]].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="size-2 rounded-sm" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={BarChart3}
              title="No Competitor Metrics Found"
              description="No direct competing domains or authority scores detected for this entity."
            />
          </div>
        )}
      </div>
    </div>
  );
}

