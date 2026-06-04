import { db } from "@repo/db/client";
import { userVocabulary, profile } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import { addVocabularyItem } from "@repo/db/queries/vocabulary";
import {
  dailyLifePack,
  workCommunicationPack,
  opinionDiscussionPack,
  socialCommunicationPack,
  technicalAIPack,
  technicalDevopsPack,
  technicalFullstackPack,
  VocabPackItem,
} from "./vocab-packs/index";

type AiCalibration = {
  calledLlmApi?: boolean;
  builtRag?: boolean;
  builtAgents?: boolean;
  shippedToProduction?: boolean;
  intent?: string;
  painPoint?: string;
};

type KnownStack = {
  languages?: string[];
  frameworks?: string[];
  custom?: string;
};

// Goal keys that imply which technical pack to include
const GOAL_TO_PACKS: Record<string, Array<'ai' | 'devops' | 'fullstack'>> = {
  ai_ml_engineer:      ['ai'],
  ml_engineer:         ['ai'],
  devops_engineer:     ['devops'],
  backend_engineer:    ['fullstack'],
  frontend_engineer:   ['fullstack'],
  full_stack_engineer: ['fullstack'],
  mobile_engineer:     ['fullstack'],
  data_analyst:        ['ai'],
  qa_engineer:         ['fullstack'],
};

function selectPacks(
  aiCalibration: AiCalibration | null,
  knownStack: KnownStack | null,
  goal: string | null
): VocabPackItem[] {
  const always = [
    ...dailyLifePack,
    ...workCommunicationPack,
    ...opinionDiscussionPack,
    ...socialCommunicationPack,
  ];

  // Primary signal: profile.goal maps cleanly to pack categories
  const goalPacks = goal ? (GOAL_TO_PACKS[goal] ?? []) : [];

  const stackStr = JSON.stringify({
    languages: knownStack?.languages ?? [],
    frameworks: knownStack?.frameworks ?? [],
    custom: knownStack?.custom ?? "",
  }).toLowerCase();

  const hasAiExperience =
    goalPacks.includes('ai') ||
    aiCalibration?.calledLlmApi ||
    aiCalibration?.builtRag ||
    aiCalibration?.builtAgents ||
    /langchain|openai|anthropic|llm|rag|embedding|huggingface|transformers/i.test(stackStr);

  const hasDevOpsExperience =
    goalPacks.includes('devops') ||
    /docker|kubernetes|k8s|terraform|ansible|aws|gcp|azure|jenkins|helm|ci.?cd/i.test(stackStr);

  const hasFullstackExperience =
    goalPacks.includes('fullstack') ||
    /react|nextjs|vue|angular|node|express|fastapi|django|postgres|mongodb|graphql/i.test(stackStr);

  const technicalPacks: VocabPackItem[] = [];
  let technicalPackCount = 0;

  if (hasAiExperience) {
    technicalPacks.push(...technicalAIPack);
    technicalPackCount++;
  }
  if (hasDevOpsExperience) {
    technicalPacks.push(...technicalDevopsPack);
    technicalPackCount++;
  }
  if (hasFullstackExperience) {
    technicalPacks.push(...technicalFullstackPack);
    technicalPackCount++;
  }

  if (technicalPackCount === 0) {
    technicalPacks.push(
      ...technicalAIPack,
      ...technicalDevopsPack,
      ...technicalFullstackPack
    );
  }

  return [...always, ...technicalPacks];
}

export async function hasVocabularyItems(userId: string): Promise<boolean> {
  const row = await db.query.userVocabulary.findFirst({
    where: eq(userVocabulary.userId, userId),
    columns: { id: true },
  });
  return !!row;
}

export async function initializeUserVocabulary(
  userId: string
): Promise<{
  count: number;
  categories: string[];
}> {
  const profileRow = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
    columns: { aiCalibration: true, knownStack: true, goal: true },
  });

  const aiCal = profileRow?.aiCalibration as AiCalibration | null;
  const stack = profileRow?.knownStack as KnownStack | null;
  const goal = profileRow?.goal ?? null;

  const selectedPacks = selectPacks(aiCal, stack, goal);

  const seenPhrases = new Set<string>();
  const deduped: VocabPackItem[] = [];

  for (const item of selectedPacks) {
    const normalizedPhrase = item.phrase.toLowerCase();
    if (!seenPhrases.has(normalizedPhrase)) {
      seenPhrases.add(normalizedPhrase);
      deduped.push(item);
    }
  }

  const inserted: VocabPackItem[] = [];

  for (const item of deduped) {
    try {
      await addVocabularyItem(userId, item);
      inserted.push(item);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        continue;
      }
      throw error;
    }
  }

  const categories = [...new Set(inserted.map((i) => i.category))];

  return {
    count: inserted.length,
    categories,
  };
}
