export function MdxProse({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        text-[15px] leading-[1.8] text-foreground/90

        [&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:leading-tight
        [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[1.2rem] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:leading-snug
        [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-[1rem] [&_h3]:font-semibold [&_h3]:text-foreground
        [&_h4]:mt-5 [&_h4]:mb-1.5 [&_h4]:text-[0.9375rem] [&_h4]:font-semibold [&_h4]:text-foreground

        [&_p]:mt-4

        [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5
        [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5
        [&_li]:leading-[1.8]

        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_em]:italic

        [&_blockquote]:mt-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-brand-green/50
        [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground

        [&_code]:rounded-md [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5
        [&_code]:text-[13px] [&_code]:font-mono [&_code]:text-zinc-800

        [&_pre]:mt-5 [&_pre]:mb-5 [&_pre]:rounded-xl [&_pre]:bg-zinc-900
        [&_pre]:px-5 [&_pre]:py-4 [&_pre]:overflow-x-auto [&_pre]:text-[13px] [&_pre]:leading-relaxed
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-zinc-100 [&_pre_code]:font-mono

        [&_hr]:my-10 [&_hr]:border-border

        [&_a]:text-brand-green [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-brand-green/40
        hover:[&_a]:decoration-brand-green

        [&_table]:mt-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px]
        [&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:bg-muted/60
        [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2.5

        [&_img]:rounded-xl [&_img]:mt-6 [&_img]:shadow-sm
      "
    >
      {children}
    </div>
  );
}
