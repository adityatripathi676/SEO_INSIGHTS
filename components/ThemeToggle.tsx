"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

/**
 * A single-button theme toggle that cycles: system → light → dark → system.
 * Animated Sun/Moon icon morph. No dropdown needed.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid SSR mismatch
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    // Cycle: if currently dark → light, if light → dark
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className="size-8 rounded-lg bg-muted/40 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative size-8 rounded-lg flex items-center justify-center
                 text-muted-foreground hover:text-foreground
                 hover:bg-black/5 dark:hover:bg-white/8
                 transition-all duration-200 overflow-hidden
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Sun — shown in dark mode (click to switch to light) */}
      <Sun
        className={`absolute size-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isDark
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-90 pointer-events-none"
          }`}
      />
      {/* Moon — shown in light mode (click to switch to dark) */}
      <Moon
        className={`absolute size-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${!isDark
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 -rotate-90 pointer-events-none"
          }`}
      />

      {/* Ripple glow on dark mode */}
      {isDark && (
        <span className="absolute inset-0 rounded-lg bg-blue-500/10 dark:animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
