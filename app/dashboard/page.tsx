"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass, Lightning, FileText, Radio, Sparkle } from "@phosphor-icons/react";
import ReportsTable from "@/components/ReportsTable";
import { CountrySelector } from "@/components/ui/country-selector";
import { ModeToggle } from "@/components/ModeToggle";
import { LiveMetricsBar } from "@/components/LiveMetricsBar";
import { useMode } from "@/contexts/ModeContext";

function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [country, setCountry] = useState("US");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isLive } = useMode();

  const handleDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/report/${data.jobId}/summary`);
      } else {
        setError(data.error || "Failed to load demo");
      }
    } catch {
      setError("Failed to load demo");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), country }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to start scraping job");
        return;
      }

      // If cache hit, go straight to summary
      if (data.cached) {
        router.push(`/dashboard/report/${data.jobId}/summary`);
      } else {
        router.push(`/dashboard/report/${data.jobId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-enter px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6 lg:space-y-8">

        {/* ── Mode-aware Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {isLive ? (
                <>
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
                  </span>
                  Live SEO Audit
                </>
              ) : (
                <>
                  <Lightning weight="fill" className="size-5 text-amber-500" />
                  Demo Mode
                </>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLive
                ? "Real-time data from Bright Data & Groq AI"
                : "Sandbox environment — all data is sample data"}
            </p>
          </div>
          <ModeToggle />
        </div>

        {/* ── Live Metrics Bar (only in Live mode) ───────────────────── */}
        {isLive && <LiveMetricsBar />}

        {/* ── Demo Mode Banner (only in Demo mode) ───────────────────── */}
        {!isLive && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/10 text-sm text-amber-700 dark:text-amber-400 font-medium">
            <Lightning weight="fill" className="size-5 flex-shrink-0" />
            <span>
              You are in <strong>Demo Mode</strong>. Data shown is pre-seeded sample data.
              Switch to <strong>Live Mode</strong> to run real SEO audits with your API keys.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ── Create Report Card ─────────────────────────────────────── */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className={`rounded-xl shadow-sm border overflow-hidden bg-card text-card-foreground transition-all duration-300
                            ${isLive ? "border-primary/20 ring-1 ring-primary/10" : "border-border"}`}>
              {/* Header strip */}
              <div className="px-6 pt-6 pb-5 border-b border-border bg-muted/30">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                      {isLive ? (
                        <>
                          <Radio className="size-4 text-primary" />
                          New Live Audit
                        </>
                      ) : (
                        <>
                          <Sparkle weight="fill" className="size-4 text-amber-500" />
                          New SEO Report
                        </>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isLive
                        ? "Enter a brand, domain or product."
                        : "Enter a brand to explore demo data."}
                    </p>
                  </div>

                  {/* Demo pill — only visible in Demo mode */}
                  {!isLive && (
                    <button
                      onClick={handleDemo}
                      disabled={demoLoading}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                                bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20
                                hover:bg-amber-500/20 transition-all duration-150 disabled:opacity-50 w-full mt-2"
                    >
                      {demoLoading ? (
                        <span className="size-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Lightning weight="fill" className="size-4" />
                      )}
                      {demoLoading ? "Loading…" : "Load Demo Report"}
                    </button>
                  )}

                  {/* Live badge — shown in Live mode */}
                  {isLive && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                    bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 w-fit mt-2">
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
                      </span>
                      APIs Connected
                    </span>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
                {/* Search input */}
                <div className="relative">
                  <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="prompt-input"
                    type="text"
                    placeholder={isLive
                      ? "e.g. shopify.com, best ai crm..."
                      : "e.g. shopify.com, Vercel..."}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11 rounded-lg bg-background border-border text-sm
                              focus-visible:ring-primary focus-visible:border-primary
                              placeholder:text-muted-foreground transition-all w-full"
                  />
                </div>

                {/* Country */}
                <div className="w-full">
                  <CountrySelector
                    value={country}
                    onValueChange={setCountry}
                    disabled={isLoading}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className={`h-11 w-full rounded-lg text-white text-sm font-semibold border-0
                            shadow-sm transition-all hover:-translate-y-px disabled:opacity-50 mt-2
                            ${isLive
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-amber-500 hover:bg-amber-600"}`}
                >
                  {isLoading ? (
                    <>
                      <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                      {isLive ? "Scraping…" : "Analysing…"}
                    </>
                  ) : (
                    <>
                      {isLive ? (
                        <>
                          <Radio className="size-4 mr-2" />
                          Run Live Audit
                        </>
                      ) : (
                        <>
                          <MagnifyingGlass weight="bold" className="size-4 mr-2" />
                          Generate
                        </>
                      )}
                    </>
                  )}
                </Button>

                {/* Error */}
                {error && (
                  <div className="mt-1 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
                    <span className="mt-0.5 size-4 flex-shrink-0">⚠</span>
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ── Reports Table ──────────────────────────────────────────── */}
          <div className="xl:col-span-8">
            <div className="rounded-xl shadow-sm border border-border bg-card overflow-hidden h-full flex flex-col">
              <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">
                    {isLive ? "Live Reports History" : "Demo Reports History"}
                  </h2>
                </div>
                {isLive && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-primary/10 border border-primary/20
                                  px-2.5 py-1 rounded-md">
                    Live Audits
                  </span>
                )}
              </div>
              <div className="flex-1 bg-card">
                <ReportsTable filterDemo={isLive} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
