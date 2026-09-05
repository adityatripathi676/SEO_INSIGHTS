"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Calendar, Database } from "lucide-react";
import { SeoReport } from "@/lib/seo-schema";
import { PdfExportButton } from "@/components/PdfExportButton";

interface Props { seoReport?: SeoReport; }

export function SummaryHeader({ seoReport }: Props) {
  const confidence = seoReport?.meta?.confidence_score
    ? Math.round(seoReport.meta.confidence_score * 100)
    : null;

  const entityName = seoReport?.meta?.entity_name || "SEO Report";

  return (
    <div className="glass-nav sticky top-12 z-40 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">

        {/* Back + entity name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="flex-shrink-0 size-7 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors group"
          >
            <ArrowLeft className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <h1 className="text-sm font-semibold text-foreground truncate">
            {entityName}
          </h1>
        </div>

        {/* Meta chips & Export button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            {seoReport?.meta?.analysis_date && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {seoReport.meta.analysis_date}
              </span>
            )}
            {typeof seoReport?.meta?.data_sources_count === "number" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Database className="size-3" />
                {seoReport.meta.data_sources_count} sources
              </span>
            )}
            {confidence !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                <CheckCircle2 className="size-3" />
                {confidence}% Confidence
              </span>
            )}
          </div>

          {/* PDF Export Action */}
          <PdfExportButton entityName={entityName} />
        </div>
      </div>
    </div>
  );
}
