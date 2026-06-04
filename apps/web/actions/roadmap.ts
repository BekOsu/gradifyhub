"use server";

import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { roadmap, phase, skill } from "@repo/db/schema";
import { getUserRoadmap } from "@repo/db/queries/roadmap";
import type { GeneratedRoadmap } from "~/lib/ai/roadmap";
import { funnel } from "~/lib/analytics";

const DEMO_ROADMAP = [
  {
    name: "Python & ML Core",
    weeks: 4,
    status: "active",
    skills: [
      { name: "Python fundamentals", hours: 8, badge: "Required in 92% of AI Eng jobs" },
      { name: "NumPy & Pandas", hours: 6, badge: "Required in 88% of AI Eng jobs" },
      { name: "Data visualisation", hours: 4, badge: null },
      { name: "Statistics basics", hours: 5, badge: "Required in 75% of AI Eng jobs" },
      { name: "Scikit-learn", hours: 6, badge: "Required in 80% of AI Eng jobs" },
      { name: "Git & notebooks", hours: 3, badge: null },
    ],
  },
  {
    name: "Deep Learning Foundations",
    weeks: 4,
    status: "locked",
    skills: [
      { name: "Neural networks", hours: 8, badge: "Required in 78% of AI Eng jobs" },
      { name: "PyTorch basics", hours: 8, badge: "Required in 72% of AI Eng jobs" },
      { name: "CNNs", hours: 6, badge: null },
      { name: "Training loops & GPUs", hours: 5, badge: null },
      { name: "Experiment tracking", hours: 3, badge: null },
    ],
  },
  {
    name: "LLMs & RAG Systems",
    weeks: 5,
    status: "locked",
    skills: [
      { name: "Transformer architecture", hours: 6, badge: "Required in 68% of AI Eng jobs" },
      { name: "Prompt engineering", hours: 4, badge: "Required in 85% of AI Eng jobs" },
      { name: "LangChain / LangGraph", hours: 8, badge: "Required in 62% of AI Eng jobs" },
      { name: "Vector databases", hours: 5, badge: "Required in 60% of AI Eng jobs" },
      { name: "RAG pipeline", hours: 8, badge: "Required in 70% of AI Eng jobs" },
      { name: "Evals & benchmarking", hours: 4, badge: null },
    ],
  },
  {
    name: "MLOps & Production",
    weeks: 4,
    status: "locked",
    skills: [
      { name: "Docker & containers", hours: 6, badge: "Required in 65% of AI Eng jobs" },
      { name: "CI/CD for ML", hours: 5, badge: null },
      { name: "Model serving (FastAPI)", hours: 6, badge: "Required in 58% of AI Eng jobs" },
      { name: "Monitoring & logging", hours: 4, badge: null },
      { name: "Cloud basics (AWS/GCP)", hours: 5, badge: "Required in 70% of AI Eng jobs" },
    ],
  },
  {
    name: "Interview Ready",
    weeks: 3,
    status: "locked",
    skills: [
      { name: "System design for ML", hours: 6, badge: null },
      { name: "Coding interviews", hours: 8, badge: null },
      { name: "Portfolio projects", hours: 10, badge: null },
      { name: "Mock interviews", hours: 4, badge: null },
    ],
  },
];

export async function seedAiRoadmap(userId: string, generated: GeneratedRoadmap) {
   // Replace any existing roadmap with the AI-generated one
   const existing = await getUserRoadmap(userId);
   if (existing) {
     await db.delete(roadmap).where(eq(roadmap.userId, userId));
   }

   const roadmapId = crypto.randomUUID();
   await db.insert(roadmap).values({
     id: roadmapId,
     userId,
     title: generated.title,
     totalWeeks: generated.totalWeeks,
   });

   // Track roadmap generation started (once roadmap record is created)
   funnel.roadmapGenerationStarted(userId, roadmapId).catch((err) =>
     console.error("[analytics] roadmap_generation_started failed:", err)
   );

   for (let i = 0; i < generated.phases.length; i++) {
     const p = generated.phases[i]!;
     const phaseId = crypto.randomUUID();
     await db.insert(phase).values({
       id: phaseId,
       roadmapId,
       name: p.name,
       weeks: p.weeks,
       order: i + 1,
       status: i === 0 ? "active" : "locked",
     });

     for (let j = 0; j < p.skills.length; j++) {
       const s = p.skills[j]!;
       await db.insert(skill).values({
         id: crypto.randomUUID(),
         phaseId,
         name: s.name,
         estimatedHours: s.estimatedHours,
         status: i === 0 && j === 0 ? "in-progress" : "locked",
         marketBadge: s.marketBadge,
         order: j + 1,
       });
     }
   }

   // Track roadmap generation completed
   funnel.roadmapGenerationCompleted(userId, roadmapId, generated.totalWeeks).catch((err) =>
     console.error("[analytics] roadmap_generation_completed failed:", err)
   );
 }

export async function seedDemoRoadmap(userId: string) {
  const existing = await getUserRoadmap(userId);
  if (existing) return;

  const roadmapId = crypto.randomUUID();
  await db.insert(roadmap).values({
    id: roadmapId,
    userId,
    title: "AI Engineer",
    totalWeeks: 20,
  });

  for (let i = 0; i < DEMO_ROADMAP.length; i++) {
    const p = DEMO_ROADMAP[i]!;
    const phaseId = crypto.randomUUID();
    await db.insert(phase).values({
      id: phaseId,
      roadmapId,
      name: p.name,
      weeks: p.weeks,
      order: i + 1,
      status: p.status,
    });

    for (let j = 0; j < p.skills.length; j++) {
      const s = p.skills[j]!;
      await db.insert(skill).values({
        id: crypto.randomUUID(),
        phaseId,
        name: s.name,
        estimatedHours: s.hours,
        status: i === 0 && j === 0 ? "in-progress" : p.status === "active" ? "locked" : "locked",
        marketBadge: s.badge,
        order: j + 1,
      });
    }
  }
}
