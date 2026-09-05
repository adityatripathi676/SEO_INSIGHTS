import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageProgress } from "@/components/PageProgress";
import AIChat from "@/components/AIChat";
import { ModeProvider } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SEO Insight — AI-Powered SEO Reports",
  description:
    "Generate comprehensive SEO reports in seconds using Bright Data and AI analysis. Competitor insights, keyword clusters, backlink analysis and more.",
  keywords:
    "SEO reports, SERP analysis, Bright Data, AI analysis, keyword research, competitor analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${outfit.variable} ${inter.variable} antialiased overflow-x-hidden`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider>
            <ModeProvider>
            {/* Gradient progress bar on route change */}
            <PageProgress />

            {/* Main Content */}
            <div className="relative flex min-h-screen flex-col overflow-hidden">
              <Header />
              <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
                {children}
              </main>
            </div>

            {/* Global AI Chatbot — auto-detects context from URL */}
            <AIChat />
          </ModeProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
