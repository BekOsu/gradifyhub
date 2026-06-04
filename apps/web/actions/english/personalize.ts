"use server";

import { requireAuth } from "~/lib/auth/session";
import {
  initializeUserVocabulary,
  hasVocabularyItems,
} from "~/lib/english/personalization";
import { revalidatePath } from "next/cache";

export async function initializeVocabularyAction(): Promise<{
  success: boolean;
  count?: number;
  categories?: string[];
  alreadyInitialized?: boolean;
  error?: string;
}> {
  try {
    const user = await requireAuth();

    const alreadyHas = await hasVocabularyItems(user.id);
    if (alreadyHas) {
      return {
        success: true,
        alreadyInitialized: true,
      };
    }

    const result = await initializeUserVocabulary(user.id);

    revalidatePath("/english/vocab");

    return {
      success: true,
      count: result.count,
      categories: result.categories,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: message,
    };
  }
}
