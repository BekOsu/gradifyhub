import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "~/lib/auth/session";
import { addVocabularyItem } from "@repo/db/queries/vocabulary";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = (await request.json()) as {
      phrase?: string;
      meaning?: string;
      difficulty?: string;
      category?: string;
      example?: string;
    };

    if (!body.phrase?.trim() || !body.meaning?.trim()) {
      return NextResponse.json(
        { error: "phrase and meaning are required" },
        { status: 400 }
      );
    }

    const difficulty = ["beginner", "intermediate", "advanced"].includes(body.difficulty ?? "")
      ? (body.difficulty as "beginner" | "intermediate" | "advanced")
      : "intermediate";

    await addVocabularyItem(user.id, {
      phrase: body.phrase.trim(),
      meaning: body.meaning.trim(),
      difficulty,
      category: body.category?.trim() || "Technical",
      example: body.example?.trim() || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to save item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
