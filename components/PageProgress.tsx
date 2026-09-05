"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Renders a thin animated gradient progress bar at the very top of the page
 * every time the route changes (pathname changes).
 * Also handles initial page load.
 */
export function PageProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = () => {
    // Clear any pending hide
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
    // Auto-hide after animation completes (~600ms)
    timerRef.current = setTimeout(() => setVisible(false), 700);
  };

  // Fire on every route change
  useEffect(() => { trigger(); }, [pathname]);

  // Also fire on initial mount
  useEffect(() => { trigger(); }, []);

  if (!visible) return null;
  return <div key={pathname} className="progress-bar" aria-hidden />;
}
