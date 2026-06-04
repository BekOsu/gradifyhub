"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: 2 | 3 };

export function LessonTOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const headingEls = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    const mainEl = document.querySelector("main");
    const scrollTarget = mainEl ?? window;

    function onScroll() {
      let next = headingEls[0]?.id ?? "";
      for (const el of headingEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) next = el.id;
      }
      setActiveId(next);
    }

    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scrollTarget.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const mainEl = document.querySelector("main");
    if (mainEl) {
      const elTop = el.getBoundingClientRect().top;
      const mainTop = mainEl.getBoundingClientRect().top;
      mainEl.scrollTop += elTop - mainTop - 80;
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav aria-label="On this page" className="sticky top-8">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => scrollTo(h.id)}
              className={`w-full text-left rounded px-2 py-1 text-[13px] leading-snug transition-colors ${
                h.level === 3 ? "pl-5" : ""
              } ${
                activeId === h.id
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
