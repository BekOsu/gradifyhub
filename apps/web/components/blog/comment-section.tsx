import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getCurrentUser } from "~/lib/auth/session";
import { getComments } from "~/lib/blog-comments";
import { CommentForm } from "./comment-form";
import { CommentThread } from "./comment-thread";

interface CommentSectionProps {
  slug: string;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

export async function CommentSection({ slug }: CommentSectionProps) {
  const [comments, user] = await Promise.all([
    getComments(slug),
    getCurrentUser(),
  ]);

  return (
    <section className="mt-16 border-t pt-10">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold">
          {comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? "" : "s"}` : "Comments"}
        </h2>
      </div>

      {user ? (
        <div className="mb-8">
          <CommentForm
            slug={slug}
            userInitials={getInitials(user.name ?? null, user.email)}
          />
        </div>
      ) : (
        <div className="mb-8 rounded-xl border bg-muted/30 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/sign-in?next=/blog/${slug}`}
              className="font-semibold text-brand-green hover:underline underline-offset-4"
            >
              Sign in
            </Link>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      <CommentThread
        comments={comments}
        slug={slug}
        currentUserId={user?.id}
        userInitials={user ? getInitials(user.name ?? null, user.email) : "?"}
      />
    </section>
  );
}
