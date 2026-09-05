"use client";

import { Button } from "@/components/ui/button";
import {
  MagnifyingGlass,
  ChatCircleText,
  ChartBar,
  Lightning,
  ShieldCheck,
  ArrowRight,
  GlobeHemisphereWest,
  Sparkle,
} from "@phosphor-icons/react";
import Link from "next/link";

const features = [
  {
    icon: MagnifyingGlass,
    title: "Live Web Scraping",
    description:
      "Bright Data's Perplexity Scraper fetches real-time data across the web — news, forums, social profiles and more.",
    color: "bg-blue-500",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    icon: ChartBar,
    title: "Comprehensive Analysis",
    description:
      "Keywords, competitors, backlinks, content themes, social presence and sentiment — all in one structured report.",
    color: "bg-purple-500",
    glow: "group-hover:shadow-purple-500/20",
  },
  {
    icon: ChatCircleText,
    title: "AI Chat with Reports",
    description:
      "Ask questions about your SEO data. The AI assistant has full context of your report and gives data-driven answers.",
    color: "bg-green-500",
    glow: "group-hover:shadow-green-500/20",
  },
  {
    icon: Lightning,
    title: "Fast Local Processing",
    description:
      "No cloud latency. Data is stored in local SQLite and analysis runs directly on your machine via high-performance AI.",
    color: "bg-orange-500",
    glow: "group-hover:shadow-orange-500/20",
  },
  {
    icon: GlobeHemisphereWest,
    title: "Multi-Country Support",
    description:
      "Target any country for localised insights. Select from hundreds of countries when generating a report.",
    color: "bg-cyan-500",
    glow: "group-hover:shadow-cyan-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Smart Retry Logic",
    description:
      "Raw data is preserved so you only call Bright Data once per query. AI retries automatically on rate limits.",
    color: "bg-rose-500",
    glow: "group-hover:shadow-rose-500/20",
  },
];

export default function Home() {
  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Ambient background blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full
                     bg-[radial-gradient(circle,rgba(0,113,227,0.12)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 left-1/4 w-64 h-64 rounded-full
                     bg-[radial-gradient(circle,rgba(175,82,222,0.08)_0%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass shadow-apple-sm text-sm font-medium text-primary">
            <Sparkle weight="fill" className="size-3.5 text-yellow-500" />
            Powered by Bright Data & Groq AI
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            SEO Reports that&nbsp;
            <br className="hidden sm:block" />
            <span className="text-primary">actually&nbsp;tell you something</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Enter any brand, product or website. Get a comprehensive SEO
            analysis — keywords, competitors, backlinks and AI recommendations —
            in minutes.
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-apple transition-all hover:-translate-y-0.5 hover:shadow-apple-md border-0"
              >
                <MagnifyingGlass weight="bold" className="size-4 mr-2" />
                Generate a Report
                <ArrowRight weight="bold" className="size-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="lg"
                className="h-11 px-6 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              >
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {[
              { label: "Data Sources", value: "18+" },
              { label: "Free Groq tier", value: "14,400 req/day" },
              { label: "Time to first report", value: "~3 min" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Everything in one report
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              No tabs, no dashboards, no extra subscriptions. One URL, one
              report, fully local.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {features.map(({ icon: Icon, title, description, color, glow }) => (
              <div
                key={title}
                className={`group glass rounded-2xl p-6 shadow-apple transition-all duration-300 hover:-translate-y-1 hover:shadow-apple-md ${glow}`}
              >
                <div
                  className={`${color} inline-flex size-10 items-center justify-center rounded-xl text-white shadow-apple-sm mb-4`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm border-0 shadow-apple"
              >
                <ArrowRight weight="bold" className="size-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
