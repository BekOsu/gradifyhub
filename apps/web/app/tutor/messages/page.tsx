import { eq, inArray, and } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { message as messageTable, user } from "@repo/db/schema";
import { requireAuth } from "~/lib/auth/session";
import { getTutorAssignedGroups } from "~/lib/tutor/scope";
import { EmptyState } from "@repo/ui/empty-state";
import { PageHeader } from "@repo/ui/page-header";
import { Mail } from "lucide-react";
import { TutorMessagesDisplay } from "./_components/tutor-messages-display";

export const metadata = {
  title: "Messages",
  description: "Message your students",
};

export default async function TutorMessagesPage() {
  const currentUser = await requireAuth();

  if (currentUser.role !== "tutor") {
    throw new Error("Unauthorized: Tutor role required");
  }

  // Get assigned skill groups
  const assignedGroups = await getTutorAssignedGroups(currentUser.id);

  if (assignedGroups.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Messages"
          description="Message your students"
        />
        <EmptyState
          icon={Mail}
          title="No students assigned"
          description="You will be able to message your students once they are assigned to your skill groups."
        />
      </div>
    );
  }

  // Get students in assigned groups
  const assignedStudents = await db.query.user.findMany({
    where: inArray(user.skillGroupId, assignedGroups),
    columns: { id: true, name: true, email: true },
  });

  const studentIds = assignedStudents.map((s) => s.id);

  if (studentIds.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Messages"
          description="Message your students"
        />
        <EmptyState
          icon={Mail}
          title="No students yet"
          description="Your assigned skill groups don't have any students yet."
        />
      </div>
    );
  }

  // Limit to 50 most recent messages to prevent memory issues
  const messages = await db.query.message.findMany({
    where: and(
      eq(messageTable.tutorId, currentUser.id),
      inArray(messageTable.studentId, studentIds)
    ),
    with: {
      student: true,
    },
    orderBy: (m, { desc }) => [desc(m.createdAt)],
    limit: 50,
  });

  const groupedMessages: Record<string, (typeof messages[0])[]> = {};
  messages.forEach((msg) => {
    const studentId = msg.studentId;
    if (!groupedMessages[studentId]) {
      groupedMessages[studentId] = [];
    }
    groupedMessages[studentId]!.push(msg);
  });

  const conversationThreads = Object.entries(groupedMessages).map(
    ([studentId, msgs]) => ({
      studentId,
      studentName: msgs[0]?.student.name ?? "Unknown Student",
      studentEmail: msgs[0]?.student.email ?? "",
      lastMessageAt: msgs[0]?.createdAt ?? new Date(),
      messageCount: msgs.length,
      messages: msgs,
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages"
        description="Message your students"
      />

      {conversationThreads.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No messages yet"
          description="Your messages to students will appear here."
        />
      ) : (
        <TutorMessagesDisplay threads={conversationThreads} currentUserId={currentUser.id} />
      )}
    </div>
  );
}
