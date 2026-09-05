"use client";

import React from "react";
import { SeoReport } from "@/lib/seo-schema";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileCode, Lock, Globe } from "lucide-react";

interface Props {
  seoReport: SeoReport;
}

export function TechnicalPanel({ seoReport }: Props) {
  const tech = seoReport?.technical;

  if (!tech) return null;

  const checks = [
    {
      label: "HTTPS Enforced",
      pass: tech.is_https,
      detail: tech.is_https ? "Secure connection active" : "HTTP only (Insecure)",
      icon: Lock,
    },
    {
      label: "SSL Certificate Valid",
      pass: tech.ssl_valid,
      detail: tech.ssl_days_remaining !== null
        ? `${tech.ssl_days_remaining} days remaining`
        : tech.ssl_valid ? "Valid SSL active" : "SSL Error / Missing",
      icon: ShieldCheck,
    },
    {
      label: "Robots.txt Present",
      pass: tech.has_robots_txt && !tech.robots_disallows_all,
      warning: tech.robots_disallows_all,
      detail: tech.robots_disallows_all
        ? "CRITICAL: Disallow: / blocking crawlers"
        : tech.has_robots_txt ? "Valid crawl rules detected" : "Missing robots.txt",
      icon: FileCode,
    },
    {
      label: "XML Sitemap",
      pass: tech.has_sitemap,
      detail: tech.has_sitemap
        ? `${tech.sitemap_url_count} URLs indexed`
        : "No sitemap found at /sitemap.xml",
      icon: Globe,
    },
    {
      label: "HTTP Response Status",
      pass: tech.response_code === 200,
      detail: tech.response_code ? `HTTP ${tech.response_code}` : "Unknown response",
      icon: CheckCircle2,
    },
    {
      label: "Structured Schema.org Data",
      pass: tech.has_structured_data,
      detail: tech.has_structured_data ? "JSON-LD schema active" : "No schema.org types found",
      icon: ShieldCheck,
    },
  ];

  const passCount = checks.filter((c) => c.pass).length;

  return (
    <div className="glass-strong rounded-2xl shadow-apple overflow-hidden border border-border/60">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Technical SEO Audit
            </h3>
            <p className="text-xs text-muted-foreground">
              Infrastructure, SSL, crawlability & indexability status
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <span>{passCount} / {checks.length} Passed</span>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {checks.map((check, idx) => {
          const Icon = check.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                check.warning
                  ? "bg-red-500/10 border-red-500/25 text-red-500"
                  : check.pass
                  ? "bg-green-500/5 border-green-500/20 text-foreground"
                  : "bg-amber-500/5 border-amber-500/20 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`size-4 ${check.pass ? "text-green-500" : check.warning ? "text-red-500" : "text-amber-500"}`} />
                {check.warning ? (
                  <AlertTriangle className="size-4 text-red-500" />
                ) : check.pass ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <XCircle className="size-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs font-semibold text-foreground">{check.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{check.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
