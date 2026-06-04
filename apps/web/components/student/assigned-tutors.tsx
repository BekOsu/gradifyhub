import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { user, tutorSkillGroup } from "@repo/db/schema";
import { Users, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AssignedTutorsProps {
  userId: string;
}

export async function AssignedTutors({ userId }: AssignedTutorsProps) {
  try {
    const student = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!student?.skillGroupId) {
      return null;
    }

    const tutors = await db.query.tutorSkillGroup.findMany({
      where: eq(tutorSkillGroup.skillGroupId, student.skillGroupId),
      with: {
        tutor: true,
        skillGroup: true,
      },
    });

    if (tutors.length === 0) {
      return null;
    }

    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Tutors</h3>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
            {tutors[0]?.skillGroup.name}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {tutors.length} expert{tutors.length !== 1 ? "s" : ""} assigned to guide your learning.
        </p>

        <div className="space-y-3">
          {tutors.map((assignment) => (
            <div
              key={assignment.tutorId}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {assignment.tutor.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${assignment.tutor.email}`}
                    className="text-xs text-muted-foreground hover:text-primary truncate"
                  >
                    {assignment.tutor.email}
                  </a>
                </div>
              </div>

              <Link
                href="/messages"
                className="ml-2 shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Message
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("[assigned-tutors] failed to load tutor assignments", error);
    return null;
  }
}
