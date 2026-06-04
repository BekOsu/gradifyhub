import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { resume, profile } from "../schema";

export async function getUserResume(userId: string) {
  return db.query.resume.findFirst({
    where: eq(resume.userId, userId),
    orderBy: [desc(resume.createdAt)],
  });
}

export async function getUserProfile(userId: string) {
  return db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });
}
