export type CuratedSource = {
  id: string;
  kind: "youtube";
  title: string;
  source: string;
  description: string;
  url: string;
  level: "beginner" | "intermediate" | "advanced";
};

export const CURATED_SOURCES: CuratedSource[] = [
  {
    id: "ted-conversations",
    kind: "youtube",
    title: "10 ways to have a better conversation",
    source: "TED · Celeste Headlee",
    description: "Listening phrases, conversational English, and professional communication skills.",
    url: "https://www.youtube.com/watch?v=R1vskiVDwl4",
    level: "beginner",
  },
  {
    id: "ted-procrastinator",
    kind: "youtube",
    title: "Inside the mind of a master procrastinator",
    source: "TED · Tim Urban",
    description: "Casual professional English, humor, and everyday expressions used in modern workplaces.",
    url: "https://www.youtube.com/watch?v=arj7oStGLkU",
    level: "beginner",
  },
  {
    id: "ted-vulnerability",
    kind: "youtube",
    title: "The power of vulnerability",
    source: "TED · Brené Brown",
    description: "Emotional and social vocabulary in professional contexts. Rich in authentic spoken English.",
    url: "https://www.youtube.com/watch?v=iCvmsMzlF7o",
    level: "beginner",
  },
  {
    id: "ted-speak",
    kind: "youtube",
    title: "How to speak so people want to listen",
    source: "TED · Julian Treasure",
    description: "Communication idioms, business phrases, and persuasion language. Great for presentations.",
    url: "https://www.youtube.com/watch?v=eIho2S0ZahI",
    level: "intermediate",
  },
  {
    id: "ted-leaders",
    kind: "youtube",
    title: "How great leaders inspire action",
    source: "TED · Simon Sinek",
    description: "Leadership vocabulary, business English, and how professionals articulate vision.",
    url: "https://www.youtube.com/watch?v=qp0HIF3SfI4",
    level: "intermediate",
  },
  {
    id: "ted-feedback",
    kind: "youtube",
    title: "The secret to giving great feedback",
    source: "TED · LeeAnn Renninger",
    description: "Workplace feedback phrases, professional communication, and constructive language.",
    url: "https://www.youtube.com/watch?v=wtl5UrrgU8c",
    level: "intermediate",
  },
  {
    id: "stanford-jobs",
    kind: "youtube",
    title: "Steve Jobs' Stanford Commencement Speech",
    source: "Stanford University",
    description: "Storytelling, motivation, and professional vocabulary from tech's most iconic speech.",
    url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    level: "intermediate",
  },
  {
    id: "ted-body-language",
    kind: "youtube",
    title: "Your body language may shape who you are",
    source: "TED · Amy Cuddy",
    description: "Professional body language vocabulary and workplace communication phrases.",
    url: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
    level: "advanced",
  },
];
