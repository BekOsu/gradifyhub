"use client";

import { useEffect } from "react";

export function ScrollToFocus({ focusDimension }: { focusDimension: string | null }) {
  useEffect(() => {
    if (!focusDimension) return;

    const element = document.querySelector(`[data-focus="${focusDimension}"]`);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [focusDimension]);

  return null;
}
