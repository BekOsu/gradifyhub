import * as React from "react";

type BadgeVariant = "neutral" | "green" | "blue" | "amber" | "red";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-muted text-muted-foreground",
  green: "bg-green-500/10 text-green-600 ring-1 ring-green-500/20",
  blue: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
  amber: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
  red: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20",
};

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

