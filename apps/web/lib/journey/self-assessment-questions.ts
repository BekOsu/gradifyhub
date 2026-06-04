export type SelfAssessmentAnswer = "yes" | "partial" | "no";

export const LEVEL_QUESTIONS: Record<"L1" | "L2" | "L3" | "L4", readonly string[]> = {
  L1: [
    "Can I explain the core concepts of this dimension in plain language to a peer?",
    "Have I followed tutorials or docs end-to-end and produced something working?",
    "Do I recognise the standard terminology when I see it in a PR or RFC?",
    "Can I do basic tasks with reference docs open?",
    "If asked a fundamentals question in a tech screen, would I pass?",
  ],
  L2: [
    "Have I shipped a real feature using this dimension in the last 6 months, unsupervised?",
    "Do I write production-quality code or config in this area without copying from Stack Overflow line-by-line?",
    "Have I debugged a non-trivial problem here on my own?",
    "Do I know the common pitfalls and have I been bitten by them?",
    "Could I onboard a junior engineer to this part of the codebase?",
  ],
  L3: [
    "Have I made a non-trivial design decision here and documented the trade-offs (RFC, design doc, ADR)?",
    "Can I evaluate two competing approaches with concrete examples from things I have shipped?",
    "Have I led a design review or pushed back on a design with a better alternative?",
    "Do my opinions in this area come from experience, not just reading?",
    "Have I shipped something at scale that genuinely exercises this dimension (load, complexity, edge cases)?",
  ],
  L4: [
    "Have I mentored someone from L2 to L3 in this dimension?",
    "Have I set standards, conventions, or guidelines that the team or org actually follows?",
    "Do colleagues come to me as the go-to expert here?",
    "Have I written a deep internal doc, given a talk, or contributed to OSS in this area?",
    "Can I debug at the edges — runtime internals, protocol level, compiler quirks, OS behaviour?",
  ],
} as const;

const ANSWER_SCORE: Record<SelfAssessmentAnswer, number> = { yes: 2, partial: 1, no: 0 };

export function scoreLevelAnswers(answers: SelfAssessmentAnswer[]): number {
  return answers.reduce((sum, a) => sum + ANSWER_SCORE[a], 0);
}

// Returns 0–4. No level-skipping: highest contiguous level where score ≥7.
export function computeEarnedLevel(levelScores: [number, number, number, number]): number {
  let earned = 0;
  for (let i = 0; i < 4; i++) {
    if ((levelScores[i] ?? 0) >= 7) {
      earned = i + 1;
    } else {
      break;
    }
  }
  return earned;
}
