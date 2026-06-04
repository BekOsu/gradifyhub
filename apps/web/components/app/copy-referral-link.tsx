"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyReferralLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex w-full max-w-md items-center gap-2 px-4">
      <div className="flex flex-1 items-center overflow-hidden rounded-lg border bg-muted/30 px-3 py-2.5">
        <span className="truncate text-sm text-muted-foreground">{url}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-brand-green" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
