"use client";

import React from "react";
import { useMode } from "@/contexts/ModeContext";
import { Zap } from "lucide-react";

export function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div
      role="group"
      aria-label="Dashboard mode"
      className="inline-flex items-center rounded-xl p-0.5 bg-muted/60 border border-border/50 gap-0.5"
    >
      <ModeButton
        active={mode === "demo"}
        label="Demo"
        icon={<Zap className="size-3" />}
        onClick={() => setMode("demo")}
        activeClass="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
        inactiveClass="text-muted-foreground hover:text-foreground"
      />
      <ModeButton
        active={mode === "live"}
        label="Live"
        icon={
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
        }
        onClick={() => setMode("live")}
        activeClass="bg-primary/15 text-primary border border-primary/25"
        inactiveClass="text-muted-foreground hover:text-foreground"
      />
    </div>
  );
}

function ModeButton({
  active,
  label,
  icon,
  onClick,
  activeClass,
  inactiveClass,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  activeClass: string;
  inactiveClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-200
                  ${active ? activeClass : inactiveClass}`}
    >
      {icon}
      {label}
    </button>
  );
}
