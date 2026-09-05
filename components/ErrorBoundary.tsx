"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary Caught Error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass rounded-2xl p-6 border border-destructive/20 text-center flex flex-col items-center justify-center min-h-[160px]">
          <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertTriangle className="size-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {this.props.fallbackTitle || "Component Error"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            {this.state.error?.message || "An unexpected rendering error occurred in this section."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="h-8 px-3 rounded-lg text-xs gap-1.5"
          >
            <RefreshCw className="size-3" />
            Retry Component
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
