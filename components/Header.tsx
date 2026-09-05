"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBar, Sparkle } from "@phosphor-icons/react";
import { ThemeToggle } from "./ThemeToggle";

function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: ChartBar },
  ];

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-12 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          {/* Logo mark — glows in dark mode */}
          <span className="
            inline-flex size-7 items-center justify-center rounded-lg
            bg-primary text-white text-xs font-bold
            shadow-apple-sm
            transition-all duration-300
            group-hover:scale-105
            dark:shadow-[0_0_12px_rgba(41,151,255,0.5)]
            dark:group-hover:shadow-[0_0_20px_rgba(41,151,255,0.7)]
          ">
            <Sparkle weight="fill" className="size-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:block">
            SEO Insight
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary dark:shadow-[0_0_10px_rgba(41,151,255,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/6"
                  }
                `}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-px h-4 bg-border flex-shrink-0" />

        {/* Theme toggle */}
        <ThemeToggle />
      </div>

      {/* Bottom edge glow line — dark mode only */}
      <div className="
        absolute bottom-0 left-0 right-0 h-px pointer-events-none
        dark:bg-gradient-to-r dark:from-transparent dark:via-primary/30 dark:to-transparent
      " />
    </header>
  );
}

export default Header;
