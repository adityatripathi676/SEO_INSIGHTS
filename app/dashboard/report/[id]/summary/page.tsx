"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { SeoReport } from "@/lib/seo-schema";
import { ErrorBoundary }          from "@/components/ErrorBoundary";
import { SummaryHeader }          from "./ui/SummaryHeader";
import { ScoreHero }              from "./ui/ScoreHero";
import { MetricPills }            from "./ui/MetricPills";
import { SourcesAndCompetitors }  from "./ui/SourcesAndCompetitors";
import { RecommendationsPanel }   from "./ui/RecommendationsPanel";
import { KeywordsPanel }          from "./ui/KeywordsPanel";
import { InsightsPanel }          from "./ui/InsightsPanel";
import { IndexedSourcesPanel }    from "./ui/IndexedSourcesPanel";
import { CompetitorMatrixChart }  from "./ui/CompetitorMatrixChart";
import { PerformancePanel }       from "./ui/PerformancePanel";
import { TechnicalPanel }         from "./ui/TechnicalPanel";
import { SeobilityPanel }         from "./ui/SeobilityPanel";

interface Job {
  id: string;
  original_prompt: string;
  status: string;
  seo_report?: SeoReport;
}

export default function ReportSummary({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null | undefined>(undefined);

  useEffect(() => { params.then(({ id }) => setId(id)); }, [params]);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (res.status === 404) { setJob(null); return; }
      if (res.ok) setJob(await res.json());
    } catch { /* silently fail */ }
  }, [id]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const seoReport = job?.seo_report as SeoReport | undefined;

  if (!id || job === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading report…</p>
        </div>
      </div>
    );
  }

  if (job === null || !seoReport) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="size-10 text-destructive mx-auto mb-3" />
          <h2 className="font-semibold text-foreground mb-1">Report Not Found</h2>
          <p className="text-sm text-muted-foreground">The requested SEO report could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header strip */}
      <SummaryHeader seoReport={seoReport} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 stagger-children">

        {/* 1. Score hero + metric pills */}
        <ErrorBoundary fallbackTitle="Score Hero Error">
          <ScoreHero seoReport={seoReport} />
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Metrics Error">
          <MetricPills seoReport={seoReport} />
        </ErrorBoundary>

        {/* 2. Seobility Pro Audit Index */}
        <ErrorBoundary fallbackTitle="Seobility Audit Error">
          <SeobilityPanel seoReport={seoReport} />
        </ErrorBoundary>

        {/* 3. Core Web Vitals & Performance Audit */}
        <ErrorBoundary fallbackTitle="Performance Audit Error">
          <PerformancePanel seoReport={seoReport} />
        </ErrorBoundary>

        {/* 3. Technical SEO Audit */}
        <ErrorBoundary fallbackTitle="Technical Audit Error">
          <TechnicalPanel seoReport={seoReport} />
        </ErrorBoundary>

        {/* 2. Charts row: sources pie + competitor bars */}
        <ErrorBoundary fallbackTitle="Analytics Charts Error">
          <SourcesAndCompetitors seoReport={seoReport} />
        </ErrorBoundary>

        {/* 3. Competitor 2D Positioning Scatter Matrix */}
        <ErrorBoundary fallbackTitle="Competitor Matrix Error">
          <CompetitorMatrixChart seoReport={seoReport} />
        </ErrorBoundary>

        {/* 4. Real Indexed Web Citations & Sources Grid */}
        <ErrorBoundary fallbackTitle="Indexed Sources Error">
          <IndexedSourcesPanel seoReport={seoReport} />
        </ErrorBoundary>

        {/* 4. Recommendations */}
        <ErrorBoundary fallbackTitle="Recommendations Error">
          <RecommendationsPanel seoReport={seoReport} />
        </ErrorBoundary>

        {/* 5. Keywords */}
        <ErrorBoundary fallbackTitle="Keywords Panel Error">
          <KeywordsPanel seoReport={seoReport} />
        </ErrorBoundary>

        {/* 6. Summary insights */}
        <ErrorBoundary fallbackTitle="Insights Error">
          <InsightsPanel seoReport={seoReport} />
        </ErrorBoundary>

      </div>
    </div>
  );
}
