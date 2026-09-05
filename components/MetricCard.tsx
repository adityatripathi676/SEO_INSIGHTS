import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendUp, TrendDown } from "@phosphor-icons/react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: any; // Using any to avoid type complaints with different icon packs
  description?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {changeType === "positive" && (
              <TrendUp className="h-3.5 w-3.5 text-emerald-500 mr-1.5" weight="bold" />
            )}
            {changeType === "negative" && (
              <TrendDown className="h-3.5 w-3.5 text-rose-500 mr-1.5" weight="bold" />
            )}
            <span
              className={
                changeType === "positive"
                  ? "text-green-500"
                  : changeType === "negative"
                    ? "text-red-500"
                    : ""
              }
            >
              {change}
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
