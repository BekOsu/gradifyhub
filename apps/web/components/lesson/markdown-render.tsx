import React from "react";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function extractHeadings(
  source: string
): { id: string; text: string; level: 2 | 3 }[] {
  const blocks = parseBlocks(source);
  const usedIds = new Map<string, number>();
  function headingId(text: string): string {
    const base = slugify(text);
    const n = usedIds.get(base) ?? 0;
    usedIds.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  }
  return blocks
    .filter(
      (b): b is Extract<Block, { kind: "heading" }> =>
        b.kind === "heading" && (b.level === 2 || b.level === 3)
    )
    .map((b) => ({ id: headingId(b.text), text: b.text, level: b.level as 2 | 3 }));
}

type ResourceItem = {
  title: string;
  badge: string;
  description: string;
  url: string;
};

type Block =
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "code"; lang: string | null; body: string }
  | { kind: "list"; items: string[] }
  | { kind: "resource-cards"; items: ResourceItem[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "para"; text: string };

function parseResourceItem(raw: string): ResourceItem | null {
  const m = raw.match(/^\*\*(.+?)\*\*\s*\((.+?)\)\s*·\s*(.+?)\s*\[.+?\]\((.+?)\)$/);
  if (!m) return null;
  return {
    title: m[1] ?? "",
    badge: m[2] ?? "",
    description: (m[3] ?? "").trim().replace(/\.\s*$/, ""),
    url: m[4] ?? "",
  };
}

function tagClass(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("youtube")) return "bg-red-50 text-red-700 border border-red-200";
  if (t.includes("book")) return "bg-amber-50 text-amber-700 border border-amber-200";
  if (t.includes("certification")) return "bg-purple-50 text-purple-700 border border-purple-200";
  if (t.includes("freecodecamp")) return "bg-blue-50 text-blue-700 border border-blue-200";
  if (t.includes("article")) return "bg-sky-50 text-sky-700 border border-sky-200";
  if (t === "free") return "bg-green-50 text-green-700 border border-green-200";
  return "bg-zinc-50 text-zinc-600 border border-zinc-200";
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      i++;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] ?? null;
      const body: string[] = [];
      i++;
      while (i < lines.length) {
        const next = lines[i] ?? "";
        if (/^```\s*$/.test(next)) break;
        body.push(next);
        i++;
      }
      i++;
      blocks.push({ kind: "code", lang, body: body.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (heading) {
      const level = (heading[1]?.length ?? 2) as 2 | 3 | 4;
      blocks.push({ kind: "heading", level, text: heading[2] ?? "" });
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const next = lines[i] ?? "";
        if (!/^[-*]\s+/.test(next)) break;
        items.push(next.replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "list", items });
      continue;
    }

    if (/^\|/.test(line)) {
      const tableLines: string[] = [];
      while (i < lines.length) {
        const next = lines[i] ?? "";
        if (!/^\|/.test(next)) break;
        tableLines.push(next);
        i++;
      }
      const parseRow = (l: string): string[] =>
        l.split("|").slice(1, -1).map((cell) => cell.trim());
      const headers = parseRow(tableLines[0] ?? "");
      // tableLines[1] is the separator row (---|---) — skip it
      const rows = tableLines.slice(2).map(parseRow);
      if (headers.length > 0) {
        blocks.push({ kind: "table", headers, rows });
      }
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const next = lines[i] ?? "";
      if (
        next.trim() === "" ||
        /^```/.test(next) ||
        /^#{2,4}\s+/.test(next) ||
        /^[-*]\s+/.test(next)
      ) {
        break;
      }
      paraLines.push(next);
      i++;
    }
    blocks.push({ kind: "para", text: paraLines.join(" ") });
  }

  return blocks;
}

function postProcess(blocks: Block[]): Block[] {
  const result: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    const next = blocks[i + 1];
    if (
      b.kind === "heading" &&
      b.text === "Going deeper" &&
      next?.kind === "list"
    ) {
      result.push(b);
      const resources = next.items
        .map(parseResourceItem)
        .filter((r): r is ResourceItem => r !== null);
      if (resources.length > 0) {
        result.push({ kind: "resource-cards", items: resources });
        i++;
      } else {
        result.push(next);
        i++;
      }
    } else {
      result.push(b);
    }
  }
  return result;
}

function renderInline(text: string): React.ReactNode {
  const tokens: React.ReactNode[] = [];
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\n]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const raw = match[0];
    if (raw.startsWith("`")) {
      tokens.push(
        <code key={key++} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[13px] text-zinc-800">
          {raw.slice(1, -1)}
        </code>
      );
    } else if (raw.startsWith("**")) {
      tokens.push(
        <strong key={key++} className="font-semibold text-foreground">
          {raw.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        tokens.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

export function LessonMarkdown({ source }: { source: string }) {
  const blocks = postProcess(parseBlocks(source));
  const usedIds = new Map<string, number>();
  function headingId(text: string): string {
    const base = slugify(text);
    const n = usedIds.get(base) ?? 0;
    usedIds.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  }
  return (
    <div className="text-[15px] leading-[1.8] text-foreground/90">
      {blocks.map((b, idx) => {
        if (b.kind === "heading") {
          if (b.level === 2) {
            return (
              <h2 key={idx} id={headingId(b.text)} className="mt-10 mb-3 text-[1.2rem] font-bold tracking-tight text-foreground leading-snug scroll-mt-6">
                {renderInline(b.text)}
              </h2>
            );
          }
          if (b.level === 3) {
            return (
              <h3 key={idx} id={headingId(b.text)} className="mt-7 mb-2 text-[1rem] font-semibold text-foreground scroll-mt-6">
                {renderInline(b.text)}
              </h3>
            );
          }
          return (
            <h4 key={idx} className="mt-5 mb-1.5 text-[0.9375rem] font-semibold text-foreground">
              {renderInline(b.text)}
            </h4>
          );
        }
        if (b.kind === "code") {
          return (
            <pre
              key={idx}
              className="mt-5 mb-5 rounded-xl bg-zinc-900 px-5 py-4 overflow-x-auto text-[13px] leading-relaxed"
            >
              <code
                className="bg-transparent p-0 font-mono text-zinc-100"
                data-lang={b.lang ?? undefined}
              >
                {b.body}
              </code>
            </pre>
          );
        }
        if (b.kind === "list") {
          return (
            <ul key={idx} className="mt-4 list-disc pl-6 space-y-1.5">
              {b.items.map((item, j) => (
                <li key={j} className="leading-[1.8]">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === "resource-cards") {
          return (
            <div key={idx} className="mt-5 space-y-3">
              {b.items.map((item, j) => (
                <a
                  key={j}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-xl border bg-card px-5 py-4 transition-all hover:border-zinc-300 hover:shadow-sm group no-underline"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-[14px] leading-tight">
                        {item.title}
                      </span>
                      {item.badge.split(",").map((tag, k) => (
                        <span
                          key={k}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium leading-none ${tagClass(tag.trim())}`}
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          );
        }
        if (b.kind === "table") {
          return (
            <div key={idx} className="mt-5 mb-5 overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {b.headers.map((h, j) => (
                      <th key={j} className="py-2.5 px-4 text-left font-semibold text-foreground/80 whitespace-nowrap">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, j) => (
                    <tr key={j} className={j % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                      {row.map((cell, k) => (
                        <td key={k} className="py-2 px-4 text-foreground/75 border-b border-zinc-100 last:border-b-0">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={idx} className="mt-4">
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}
