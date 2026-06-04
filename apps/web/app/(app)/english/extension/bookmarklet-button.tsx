'use client';

export function BookmarkletButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white cursor-grab select-none hover:bg-blue-700 transition-colors"
      onClick={(e) => e.preventDefault()}
      draggable
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      GradifyHub Vocab
    </a>
  );
}
