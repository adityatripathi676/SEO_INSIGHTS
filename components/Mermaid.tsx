"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { v4 as uuidv4 } from 'uuid'; // we need to install uuid or just use a random string

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    setMounted(true);
    setId(`mermaid-${Math.random().toString(36).substring(7)}`);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });

    if (ref.current) {
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      }).catch(console.error);
    }
  }, [chart, id, mounted]);

  if (!mounted) return null;

  return <div ref={ref} className="mermaid flex justify-center items-center w-full h-full" suppressHydrationWarning />;
}
