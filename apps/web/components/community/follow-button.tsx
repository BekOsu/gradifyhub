"use client";

import { useState, useTransition } from "react";
import { followUserAction, unfollowUserAction } from "~/actions/community";
import { cn } from "~/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  disabled?: boolean;
}

export function FollowButton({ targetUserId, initialFollowing, disabled }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (disabled || isPending) return;

    startTransition(async () => {
      const result = following
        ? await unfollowUserAction(targetUserId)
        : await followUserAction(targetUserId);
      if (result.success) setFollowing(!following);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isPending}
      className={cn(
        "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
        following
          ? "bg-muted text-muted-foreground hover:bg-muted/80"
          : "bg-brand-green text-white hover:bg-brand-green/90",
        (disabled || isPending) && "opacity-50",
      )}
    >
      {isPending ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}

