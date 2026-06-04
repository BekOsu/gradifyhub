import { eq, inArray } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { message as messageTable, tutorSkillGroup } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { EmptyState } from "@repo/ui/empty-state";
import { PageHeader } from "@repo/ui/page-header";
import { Mail } from "lucide-react";
import { MessagesDisplay } from "./_components/messages-display";

export const metadata = {
  title: "Messages",
  description: "View messages from your tutors",
};

export default async function MessagesPage() {
  const currentUser = await requireAuth();

  // Limit to 50 most recent messages per conversation to prevent memory issues
  const messages = await db.query.message.findMany({
    where: eq(messageTable.studentId, currentUser.id),
    with: {
      tutor: true,
    },
    orderBy: (m, { desc }) => [desc(m.createdAt)],
    limit: 50,
  });

  // Only show messages from tutors currently assigned to student's skill group
  const assignedGroups = currentUser.skillGroupId
    ? [currentUser.skillGroupId]
    : [];
  const tutorAssignments = await db.query.tutorSkillGroup.findMany({
    where: inArray(tutorSkillGroup.skillGroupId, assignedGroups),
    columns: { tutorId: true },
  });
  const validTutorIds = new Set(tutorAssignments.map((t) => t.tutorId));
  const filteredMessages = messages.filter((m) =>
    validTutorIds.has(m.tutorId)
  );

  const groupedMessages: Record<string, (typeof filteredMessages[0])[]> = {};
  filteredMessages.forEach((msg) => {
    const tutorId = msg.tutorId;
    if (!groupedMessages[tutorId]) {
      groupedMessages[tutorId] = [];
    }
    groupedMessages[tutorId]!.push(msg);
  });

  const conversationThreads = Object.entries(groupedMessages).map(([tutorId, msgs]) => ({
    tutorId,
    tutorName: msgs[0]?.tutor.name ?? "Unknown Tutor",
    tutorEmail: msgs[0]?.tutor.email ?? "",
    lastMessageAt: msgs[0]?.createdAt ?? new Date(),
    messageCount: msgs.length,
    messages: msgs,
  }));

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6 pb-8">
      <PageHeader
        title="Messages"
        description="Communicate with your tutors"
      />

      {conversationThreads.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No messages yet"
          description="Your tutors will message you here with feedback on your progress and roadmap."
        />
      ) : (
        <MessagesDisplay threads={conversationThreads} currentUserId={currentUser.id} />
      )}
    </div>
  );
}
