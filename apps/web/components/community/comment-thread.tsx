"use client";

import { useState, useTransition } from "react";
import { Trash2, Reply, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { addCommentAction, deleteCommentAction } from "~/actions/community";
import { cn } from "~/lib/utils";
import type { CommentWithUser } from "~/lib/community";

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email[0]?.toUpperCase() ?? "?";
}

function ReplyForm({
  postId,
  parentId,
  userInitials,
  onCancel,
}: {
  postId: string;
  parentId: string;
  userInitials: string;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 2) return;
    startTransition(async () => {
      const res = await addCommentAction(postId, body, parentId);
      if (res.success) { setBody(""); onCancel(); }
      else setError(res.error ?? "Failed.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-[10px] font-bold text-brand-green">
        {userInitials}
      </div>
      <div className="flex-1 space-y-1.5">
        <textarea
          data-testid={`comment-reply-input-${parentId}`}
          value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply…" rows={2} disabled={isPending}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-brand-green/50"
        />
        <div className="flex gap-2">
          <button type="submit" disabled={body.trim().length < 2 || isPending}
            data-testid={`comment-reply-submit-${parentId}`}
            className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white disabled:opacity-40">
            {isPending ? "Posting…" : "Reply"}
          </button>
          <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </form>
  );
}

function CommentRow({
  comment, postId, currentUserId, userInitials, depth,
}: {
  comment: CommentWithUser; postId: string; currentUserId?: string; userInitials: string; depth: number;
}) {
  const [deleted, setDeleted] = useState(false);
  const [replying, setReplying] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  const initials = getInitials(comment.user.name, comment.user.email);
  const isOwn = comment.userId === currentUserId;

  return (
    <div className={cn("flex gap-2.5", depth > 0 && "pl-5 border-l border-muted/60")}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold">{comment.user.name ?? comment.user.email.split("@")[0]}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(new Date(comment.createdAt))}</span>
          {isOwn && (
            <button onClick={() => startTransition(async () => { const r = await deleteCommentAction(comment.id); if (r.success) setDeleted(true); })}
              disabled={isPending} className="ml-auto rounded p-0.5 text-muted-foreground/40 hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">{comment.body}</p>

        {currentUserId && depth === 0 && (
          <button onClick={() => setReplying((r) => !r)}
            data-testid={`comment-reply-toggle-${comment.id}`}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Reply className="h-3 w-3" /> Reply
          </button>
        )}
        {replying && (
          <ReplyForm postId={postId} parentId={comment.id} userInitials={userInitials} onCancel={() => setReplying(false)} />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentRow key={reply.id} comment={reply} postId={postId} currentUserId={currentUserId} userInitials={userInitials} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentInput({ postId, userInitials }: { postId: string; userInitials: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 2) return;
    startTransition(async () => {
      const res = await addCommentAction(postId, body);
      if (res.success) setBody("");
      else setError(res.error ?? "Failed.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-[10px] font-bold text-brand-green">
        {userInitials}
      </div>
      <div className="flex-1 space-y-1.5">
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          data-testid={`comment-input-${postId}`}
          placeholder="Add a comment…" rows={2} disabled={isPending}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-brand-green/50" />
        <div className="flex items-center gap-2">
          <button type="submit" disabled={body.trim().length < 2 || isPending}
            data-testid={`comment-submit-${postId}`}
            className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white disabled:opacity-40">
            {isPending ? "Posting…" : "Comment"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </form>
  );
}

interface CommunityCommentThreadProps {
  comments: CommentWithUser[];
  postId: string;
  currentUserId?: string;
  userInitials: string;
  showInput?: boolean;
}

export function CommunityCommentThread({
  comments, postId, currentUserId, userInitials, showInput = false,
}: CommunityCommentThreadProps) {
  const [expanded, setExpanded] = useState(showInput);

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        data-testid={`comment-toggle-${postId}`}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "Comment"}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {comments.map((c) => (
            <CommentRow key={c.id} comment={c} postId={postId} currentUserId={currentUserId} userInitials={userInitials} depth={0} />
          ))}
          {currentUserId && <CommentInput postId={postId} userInitials={userInitials} />}
        </div>
      )}
    </div>
  );
}

