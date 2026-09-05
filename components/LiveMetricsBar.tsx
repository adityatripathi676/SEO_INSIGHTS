"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart2,
  CheckCircle2,
  Activity,
  TrendingUp,
  Zap,
  RefreshCw,
} from "lucide-react";

interface Stats {
  totalReports: number;
  completedReports: number;
  activeJobs: number;
  avgSeoScore: number;
  cacheHits: number;
  successRate: number;
}

const ZERO: Stats = {
  totalReports: 0,
  completedReports: 0,
  activeJobs: 0,
  avgSeoScore: 0,
  cacheHits: 0,
  successRate: 0,
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === display) return;
    const diff = value - display;
    const steps = 20;
    const step = diff / steps;
    let current = display;
    let i = 0;
    const id = setInterval(() => {
      i++;
      current += step;
      setDisplay(i === steps ? value : Math.round(current));
      if (i >= steps) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span>{display}</span>;
}

interface TileProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  active?: boolean;
}

function StatTile({ label, value, suffix = "", icon: Icon, color, bgColor, active }: TileProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300
                     ${active ? "border-primary/20 bg-primary/5" : "border-border/40 bg-background/30"}`}>
      <div className={`flex-shrink-0 size-8 rounded-lg flex items-center justify-center ${bgColor}`}>
        <Icon className={`size-4 ${color} ${active ? "animate-pulse" : ""}`} />
      </div>
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
          {label}
        </p>
        <p className="text-lg font-bold text-foreground leading-none tabular-nums">
          <AnimatedNumber value={value} />
          {suffix}
        </p>
      </div>
    </div>
  );
}

export function LiveMetricsBar() {
  const [stats, setStats] = useState<Stats>(ZERO);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalReports:    data.totalReports    ?? 0,
          completedReports:data.completedReports ?? 0,
          activeJobs:      data.activeJobs       ?? 0,
          avgSeoScore:     data.avgSeoScore      ?? 0,
          cacheHits:       data.cacheHits        ?? 0,
          successRate:     data.successRate      ?? 0,
        });
        setLastRefresh(new Date());
      }
    } catch {
      // API unavailable — keep zeros
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 10_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const tiles: TileProps[] = [
    {
      label:   "Total Reports",
      value:   stats.totalReports,
      icon:    BarChart2,
      color:   "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label:   "Completed",
      value:   stats.completedReports,
      icon:    CheckCircle2,
      color:   "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label:   "Active Jobs",
      value:   stats.activeJobs,
      icon:    Activity,
      color:   "text-amber-500",
      bgColor: "bg-amber-500/10",
      active:  stats.activeJobs > 0,
    },
    {
      label:   "Avg SEO Score",
      value:   stats.avgSeoScore,
      suffix:  "/100",
      icon:    TrendingUp,
      color:   stats.avgSeoScore >= 70 ? "text-green-500" : stats.avgSeoScore >= 40 ? "text-amber-500" : "text-red-400",
      bgColor: stats.avgSeoScore >= 70 ? "bg-green-500/10" : stats.avgSeoScore >= 40 ? "bg-amber-500/10" : "bg-red-400/10",
    },
    {
      label:   "Cache Hits",
      value:   stats.cacheHits,
      icon:    Zap,
      color:   "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="glass rounded-2xl shadow-apple-sm border border-border/50 overflow-hidden">
      {/* Header strip */}
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-foreground">Live Analytics</span>
          <span className="text-[10px] text-muted-foreground">· real-time · auto-refreshes every 10s</span>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={isRefreshing}
            className="size-6 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground transition-colors"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tiles grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <StatTile key={t.label} {...t} />
        ))}
      </div>

      {/* Success rate progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Success Rate</span>
          <span className="font-semibold text-foreground">{stats.successRate}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-green-500 transition-all duration-700"
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
