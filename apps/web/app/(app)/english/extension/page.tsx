import Link from "next/link";
import { requireAuth } from "~/lib/auth/session";
import { BookmarkletButton } from "./bookmarklet-button";

export default async function EnglishExtensionPage() {
  await requireAuth();

  const bookmarkletCode = `javascript:(function(){var t=window.getSelection().toString().trim().slice(0,5000);if(!t){t=prompt('Paste text to analyze:','');}if(t)window.open('https://gradifyhub.com/english/vocab/mine?text='+encodeURIComponent(t)+'&source=bookmarklet','_blank');})();`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div>
        <Link href="/english/vocab" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Vocabulary
        </Link>
        <h1 className="text-2xl font-bold mt-4">Browser Extension</h1>
        <p className="text-muted-foreground mt-2">
          Analyze vocabulary from any webpage and save phrases directly to your vault.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-700">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="9" />
              <line x1="12" y1="15" x2="12" y2="22" />
              <line x1="2" y1="12" x2="9" y2="12" />
              <line x1="15" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Chrome Extension</h2>
            <p className="text-sm text-muted-foreground">Best experience — works on all pages</p>
          </div>
        </div>

        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>Download the extension files from the <strong>GradifyHub GitHub repository</strong> (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">apps/extension/</code> folder)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>Open Chrome and go to <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>Enable <strong>Developer mode</strong> (top-right toggle)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>Click <strong>Load unpacked</strong> and select the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">apps/extension/</code> folder</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>Pin the GradifyHub extension to your toolbar</span>
          </li>
        </ol>

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">How to use:</strong> Select any text on a webpage, then click the GradifyHub extension icon.
          Vocabulary phrases appear in the popup — click &ldquo;Save to Vault&rdquo; on any phrase to add it to your SRS review queue.
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-700">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Bookmarklet</h2>
            <p className="text-sm text-muted-foreground">Works in any browser — no install required</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Drag the button below to your bookmarks bar. Then click it on any page to analyze selected text.
          </p>

          <div className="flex items-center gap-4">
            <BookmarkletButton href={bookmarkletCode} />
            <span className="text-sm text-muted-foreground">← Drag to bookmarks bar</span>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-1">
            <p>
              <strong className="text-foreground">How to use:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Drag the &ldquo;GradifyHub Vocab&rdquo; button to your bookmarks bar</li>
              <li>Select text on any webpage</li>
              <li>Click the bookmarklet — GradifyHub opens with the text pre-loaded</li>
              <li>Review and save phrases to your vault</li>
            </ol>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
        Vocabulary mining (including the browser extension) requires a <strong>Pro plan</strong>.
        Free users can access the Chrome extension but will be prompted to upgrade when analyzing text.
      </div>
    </div>
  );
}
