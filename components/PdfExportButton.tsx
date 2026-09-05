"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfExportButtonProps {
  entityName?: string;
}

export function PdfExportButton({ entityName = "SEO_Report" }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportPdf = () => {
    setIsExporting(true);
    
    // Set document title temporarily for PDF filename output
    const originalTitle = document.title;
    document.title = `${entityName.replace(/[^a-zA-Z0-9_-]/g, "_")}_SEO_Insight_Audit.pdf`;

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setIsExporting(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }, 150);
  };

  return (
    <Button
      onClick={handleExportPdf}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 no-print transition-all"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-500" />
          Exported!
        </>
      ) : isExporting ? (
        <>
          <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Generating PDF…
        </>
      ) : (
        <>
          <Download className="size-3.5" />
          Export PDF Audit
        </>
      )}
    </Button>
  );
}
