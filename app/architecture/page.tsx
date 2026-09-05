"use client";

import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Mermaid from '@/components/Mermaid';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const architectureChart = `flowchart TD
    User(["User (Browser)"]) -->|Next.js 15 UI| Frontend["Frontend UI (/dashboard)"]
    
    subgraph API_Layer ["API Layer (Next.js Routes)"]
        ScrapeAPI["/api/scrape (Starts Job)"]
        JobAPI["/api/jobs/:id (Polls Status)"]
        ChatAPI["/api/chat (AI Assistant)"]
    end

    subgraph Orchestration ["Orchestration & Validation"]
        BrightDataEngine["Bright Data Poller (lib/brightdata.ts)"]
        AnalysisEngine["Analysis & Concurrency Lock (lib/analysis.ts)"]
        Zod["Zod Schema Validation (lib/seo-schema.ts)"]
    end

    subgraph Data_Layer ["Local Persistence"]
        SQLite[("SQLite Database (jobs.db)")]
    end

    subgraph External_Services ["External APIs"]
        BrightData["Bright Data SERP Scraper"]
        Groq["Groq Cloud LPU (Llama 3.3)"]
    end

    Frontend -->|POST| ScrapeAPI
    Frontend -->|GET| JobAPI
    Frontend -->|POST| ChatAPI
    
    ScrapeAPI --> SQLite
    ScrapeAPI --> BrightDataEngine
    BrightDataEngine <-->|Scrapes SERP| BrightData
    BrightDataEngine --> AnalysisEngine
    
    AnalysisEngine <-->|Sends data, gets JSON| Groq
    AnalysisEngine --> Zod
    Zod -->|Saves valid report| SQLite
    
    JobAPI <--> SQLite
    ChatAPI <--> Groq
`;

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* Header bar for controls & info */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/30 backdrop-blur-md z-10">
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            System Architecture
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <MousePointer2 className="w-4 h-4" />
            Pinch to zoom, scroll to pan, drag to move
          </p>
        </div>
      </div>

      {/* Interactive Canvas Area */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background">
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={4}
          centerOnInit={true}
          wheel={{ step: 0.05, smoothStep: 0.005 }}
          pinch={{ step: 5 }}
          panning={{ velocityDisabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-50 bg-card/50 backdrop-blur-md p-2 rounded-xl border border-white/5 shadow-2xl">
                <Button variant="ghost" size="icon" onClick={() => zoomIn()} title="Zoom In">
                  <ZoomIn className="w-5 h-5 text-blue-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => zoomOut()} title="Zoom Out">
                  <ZoomOut className="w-5 h-5 text-blue-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => resetTransform()} title="Reset">
                  <Maximize className="w-5 h-5 text-blue-400" />
                </Button>
              </div>

              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center min-h-[800px]">
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="w-full max-w-5xl bg-card/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
                    <Mermaid chart={architectureChart} />
                  </div>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
