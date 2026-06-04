import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card } from "ts-fsrs";

const f = fsrs(generatorParameters({ enable_fuzz: true }));

export function dbRowToCard(row: {
  stability: string;
  difficulty: string;
  state: string;
  reps: number;
  lapses: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date;
}): Card {
  const stateMap: Record<string, State> = {
    new: State.New,
    learning: State.Learning,
    review: State.Review,
    relearning: State.Relearning,
  };

  const card = createEmptyCard();
  card.stability = parseFloat(row.stability);
  card.difficulty = parseFloat(row.difficulty);
  card.state = stateMap[row.state] ?? State.New;
  card.reps = row.reps;
  card.lapses = row.lapses;
  card.due = row.nextReviewAt;
  card.last_review = row.lastReviewedAt ?? undefined;

  if (row.lastReviewedAt) {
    const elapsed = (row.nextReviewAt.getTime() - row.lastReviewedAt.getTime()) / 86400000;
    card.elapsed_days = Math.round(elapsed);
    card.scheduled_days = card.elapsed_days;
  } else {
    card.elapsed_days = 0;
    card.scheduled_days = 0;
  }

  return card;
}

export function applyGrade(
  card: Card,
  grade: 1 | 2 | 3 | 4,
  now?: Date
): {
  stability: string;
  difficulty: string;
  state: string;
  reps: number;
  lapses: number;
  nextReviewAt: Date;
  lastReviewedAt: Date;
} {
  const ratingMap: Record<1 | 2 | 3 | 4, Rating> = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  };

  const result = f.repeat(card, now ?? new Date());
  const rating = ratingMap[grade];
  const scheduleRecord =
    rating === Rating.Again
      ? result[Rating.Again]
      : rating === Rating.Hard
        ? result[Rating.Hard]
        : rating === Rating.Good
          ? result[Rating.Good]
          : result[Rating.Easy];

  const stateMap: Record<State, string> = {
    [State.New]: "new",
    [State.Learning]: "learning",
    [State.Review]: "review",
    [State.Relearning]: "relearning",
  };

  return {
    stability: scheduleRecord.card.stability.toFixed(4),
    difficulty: scheduleRecord.card.difficulty.toFixed(2),
    state: stateMap[scheduleRecord.card.state],
    reps: scheduleRecord.card.reps,
    lapses: scheduleRecord.card.lapses,
    nextReviewAt: scheduleRecord.card.due,
    lastReviewedAt: now ?? new Date(),
  };
}

export function calcRetrievability(row: {
  stability: string;
  lastReviewedAt: Date | null;
}): number {
  const S = parseFloat(row.stability);
  if (S === 0 || !row.lastReviewedAt) return 0;

  const now = new Date();
  const elapsed = (now.getTime() - row.lastReviewedAt.getTime()) / 86400000;
  const R = Math.exp(-elapsed / (9 * S));

  return Math.round(R * 100);
}
