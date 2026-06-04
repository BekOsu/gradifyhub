"use server";

import { requireAuth } from "~/lib/auth/session";
import {
  addVocabularyItem,
  deleteUserVocabulary,
  getUserVocabulary,
  searchVocabulary,
} from "@repo/db/queries/vocabulary";
import { revalidatePath } from "next/cache";

export async function addWordAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    const phrase = formData.get("phrase")?.toString().trim() ?? "";
    const meaning = formData.get("meaning")?.toString().trim() ?? "";
    const category = formData.get("category")?.toString().trim() ?? "";
    const difficulty = (formData.get("difficulty")?.toString() ?? "beginner") as
      | "beginner"
      | "intermediate"
      | "advanced";
    const example = formData.get("example")?.toString().trim() ?? undefined;

    if (!phrase || !meaning) {
      return { success: false, error: "Phrase and meaning are required" };
    }

    await addVocabularyItem(user.id, {
      phrase,
      meaning,
      difficulty,
      category,
      example,
    });

    revalidatePath("/english/vocab");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add word";
    return { success: false, error: message };
  }
}

export async function deleteWordAction(
  userVocabId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    await deleteUserVocabulary(user.id, userVocabId);

    revalidatePath("/english/vocab");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete word";
    return { success: false, error: message };
  }
}

export async function searchWordsAction(
  query: string
): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  try {
    const user = await requireAuth();

    const results = await searchVocabulary(user.id, query);

    return { success: true, data: results };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search words";
    return { success: false, error: message };
  }
}
