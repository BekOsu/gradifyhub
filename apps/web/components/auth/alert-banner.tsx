"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertBannerProps {
  type: AlertType;
  message: string;
  title?: string;
  dismissible?: boolean;
  autoClose?: number; // milliseconds, 0 = no auto-close
}

const typeStyles: Record<AlertType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-800",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    text: "text-red-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    text: "text-amber-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-800",
  },
};

export function AlertBanner({
  type,
  message,
  title,
  dismissible = true,
  autoClose = 5000,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => setIsVisible(false), autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  if (!isVisible) return null;

  const styles = typeStyles[type];
  const IconComponent = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      data-testid={`alert-banner-${type}`}
      className={`rounded-lg border ${styles.bg} ${styles.border} p-4`}
    >
      <div className="flex gap-3">
        <IconComponent className={`h-5 w-5 shrink-0 ${styles.icon}`} />
        <div className="flex-1">
          {title && <h3 className={`text-sm font-semibold ${styles.text}`}>{title}</h3>}
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className={`shrink-0 ${styles.icon} hover:opacity-70`}
            aria-label="Close alert"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

