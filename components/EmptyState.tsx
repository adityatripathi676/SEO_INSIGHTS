"use client";

import React from "react";
import { LucideIcon, FileSearch } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FileSearch,
  title,
  description,
  className = "",
  action,
}: EmptyStateProps) {
  return (
    <div
      className={`glass rounded-2xl p-8 border border-border/50 text-center flex flex-col items-center justify-center min-h-[160px] ${className}`}
    >
      <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary shadow-apple-sm">
        <Icon className="size-6 text-primary" />
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-3">
        {description}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
