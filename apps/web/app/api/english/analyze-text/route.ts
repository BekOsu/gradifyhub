import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "~/lib/auth/session";
import { hasFeature } from "~/lib/billing/hasFeature";
import { getUserPlan } from "~/lib/billing/hasFeature";
import { chunkTranscript } from "~/lib/english/transcript";
import { extractVocabulary, type ExtractedVocabItem } from "~/lib/english/vocab-extractor";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const allowed = await hasFeature(user.id, "english_mining");
    if (!allowed) {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    const body = (await request.json()) as { text?: string };
    const text = (body.text ?? "").trim().slice(0, 10_000);

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Text too short (minimum 50 characters)" },
        { status: 400 }
      );
    }

    const plan = await getUserPlan(user.id);
    const chunks = chunkTranscript(text, 800).slice(0, 5);

    const allItems: ExtractedVocabItem[] = [];

    for (const chunk of chunks) {
      const items = await extractVocabulary(chunk, {
        plan,
        userId: user.id,
      });
      allItems.push(...items);
    }

    const seen = new Set<string>();
    const deduped = allItems.filter((item) => {
      const key = item.phrase.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ items: deduped });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to analyze text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
