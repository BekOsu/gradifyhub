import * as React from "react";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  color?: "green" | "blue" | "amber" | "default";
}

const colorMap = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  amber: "bg-amber-400",
  default: "bg-primary",
};

export function Progress({ value, className = "", color = "default" }: ProgressProps) {
  const fill = colorMap[color];
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-muted ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${fill}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

