import * as React from "react";

type Trend = "up" | "down" | "neutral";

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: React.ReactNode;
  trend?: Trend;
}

const trendClass: Record<Trend, string> = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-muted-foreground",
};

export function StatTile({ label, value, sub, accent, icon, trend }: StatTileProps) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-amber-200 bg-amber-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-2xl font-bold tracking-tight ${accent ? "text-amber-600" : ""}`}>{value}</p>
          <p className="mt-1 text-sm font-medium">{label}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      {trend && <p className={`mt-2 text-xs font-medium ${trendClass[trend]}`}>{trend}</p>}
    </div>
  );
}

