import { eq, asc } from "drizzle-orm";
import { db } from "../client";
import { course } from "../schema";

export type Course = typeof course.$inferSelect;

export async function getCourses() {
  return db.query.course.findMany({
    orderBy: (c, { asc }) => [asc(c.order), asc(c.title)],
  });
}

export async function getPublishedCourses() {
  return db.query.course.findMany({
    where: eq(course.isPublished, true),
    orderBy: (c, { asc }) => [asc(c.order), asc(c.title)],
  });
}

export async function getCourseById(id: string) {
  return db.query.course.findFirst({ where: eq(course.id, id) });
}

export async function createCourse(data: {
  slug: string;
  title: string;
  description: string;
  provider: string;
  imageUrl?: string;
  courseUrl: string;
  level: string;
  category: string;
  tags: string[];
  durationHours?: number;
  studentCount?: number;
  rating?: number;
  isFree?: boolean;
  isPublished?: boolean;
  order?: number;
}) {
  const id = crypto.randomUUID();
  await db.insert(course).values({
    id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    provider: data.provider,
    imageUrl: data.imageUrl ?? null,
    courseUrl: data.courseUrl,
    level: data.level,
    category: data.category,
    tags: data.tags,
    durationHours: data.durationHours ?? null,
    studentCount: data.studentCount ?? null,
    rating: data.rating ?? null,
    isFree: data.isFree ?? true,
    isPublished: data.isPublished ?? false,
    order: data.order ?? 0,
    updatedAt: new Date(),
  });
  return id;
}

export async function updateCourse(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    description: string;
    provider: string;
    imageUrl: string | null;
    courseUrl: string;
    level: string;
    category: string;
    tags: string[];
    durationHours: number | null;
    studentCount: number | null;
    rating: number | null;
    isFree: boolean;
    isPublished: boolean;
    order: number;
  }>,
) {
  await db
    .update(course)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(course.id, id));
}

export async function deleteCourse(id: string) {
  await db.delete(course).where(eq(course.id, id));
}
