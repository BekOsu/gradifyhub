"use client";

import { useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import type { CommunityReactionEmoji } from "~/actions/community";

export const REACTION_EMOJIS: CommunityReactionEmoji[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

interface ReactionPickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: CommunityReactionEmoji) => void;
  myReaction: string | null;
}

export function ReactionPicker({ open, onClose, onPick, myReaction }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-2xl border bg-background p-2 shadow-xl"
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          data-testid={`reaction-emoji-${emoji}`}
          onClick={() => onPick(emoji)}
          className={cn(
            "rounded-xl p-1.5 text-xl transition-all hover:scale-125",
            myReaction === emoji && "bg-amber-100 ring-2 ring-amber-400",
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

