// Seed Soft Skills + English Proficiency lessons + roadmaps via raw pg.
// Run: pnpm tsx scripts/seed-new-tracks.cts
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { Pool }       = require("/Users/abubaker/projects/graduate-dev/packages/db/node_modules/pg");
const { randomUUID } = require("crypto");
const fs             = require("fs");
const path           = require("path");

// ── Load .env.local ────────────────────────────────────────────────────────
for (const file of [".env.local", ".env"]) {
  const fp = path.resolve(process.cwd(), file);
  if (fs.existsSync(fp)) {
    for (const line of fs.readFileSync(fp, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) { const k = m[1].trim(); const v = m[2].trim().replace(/^["']|["']$/g, ""); if (!process.env[k]) process.env[k] = v; }
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

function normUrl(url: string) {
  const u = new URL(url);
  if (u.searchParams.get("sslmode") && u.searchParams.get("uselibpqcompat") !== "true") u.searchParams.set("uselibpqcompat", "true");
  return u.toString();
}

const pool = new Pool({ connectionString: normUrl(DATABASE_URL!), max: 3 }) as any;

// ── Load lesson data ───────────────────────────────────────────────────────
const r = (p: string) => require(path.resolve("lib/seed", p));

const SS_LESSONS = [
  ...r("soft-skills/d1-written-comms").D1_LESSONS,
  ...r("soft-skills/d2-discovery-scoping").D2_LESSONS,
  ...r("soft-skills/d3-async-collab").D3_LESSONS,
  ...r("soft-skills/d4-code-review").D4_LESSONS,
  ...r("soft-skills/d5-conflict-escalation").D5_LESSONS,
  ...r("soft-skills/d6-career-navigation").D6_LESSONS,
];

const ENG_LESSONS = [
  ...r("english-proficiency/d1-reading").D1_LESSONS,
  ...r("english-proficiency/d2-listening").D2_LESSONS,
  ...r("english-proficiency/d3-speaking").D3_LESSONS,
  ...r("english-proficiency/d4-writing").D4_LESSONS,
  ...r("english-proficiency/d5-cross-cultural").D5_LESSONS,
];

// ── Seed helpers ───────────────────────────────────────────────────────────

async function upsertLesson(client: any, lessonData: any, track: string) {
  const existing = await client.query(`SELECT id FROM lesson WHERE slug = $1`, [lessonData.slug]);

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await client.query(
      `UPDATE lesson SET title=$1, description=$2, content=$3, dimension=$4, difficulty=$5,
       estimated_minutes=$6, "order"=$7, track=$8 WHERE id=$9`,
      [lessonData.title, lessonData.description, lessonData.content,
       lessonData.dimension, lessonData.difficulty, lessonData.estimatedMinutes,
       lessonData.order, track, id],
    );
    return { id, created: false };
  }

  const id = randomUUID();
  await client.query(
    `INSERT INTO lesson (id, slug, title, description, content, dimension, difficulty, estimated_minutes, "order", track, global_sequence_index)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0)`,
    [id, lessonData.slug, lessonData.title, lessonData.description, lessonData.content,
     lessonData.dimension, lessonData.difficulty, lessonData.estimatedMinutes,
     lessonData.order, track],
  );
  return { id, created: true };
}

async function upsertQuizzes(client: any, lessonId: string, quizzes: any[]) {
  if (!quizzes?.length) return;
  for (const q of quizzes) {
    const existing = await client.query(`SELECT id FROM quiz WHERE lesson_id=$1 AND question=$2`, [lessonId, q.question]);
    if (existing.rows.length > 0) continue;
    await client.query(
      `INSERT INTO quiz (id, lesson_id, question, choices) VALUES ($1,$2,$3,$4)`,
      [randomUUID(), lessonId, q.question, JSON.stringify(q.choices)],
    );
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const client = await pool.connect();
  try {
    const batches = [
      { lessons: SS_LESSONS,  track: "soft-skills",          label: "Soft Skills" },
      { lessons: ENG_LESSONS, track: "english-proficiency",  label: "English Proficiency" },
    ];

    for (const { lessons, track, label } of batches) {
      console.log(`\nSeeding ${lessons.length} ${label} lessons...`);
      let created = 0, updated = 0;
      for (const ld of lessons) {
        const { id, created: wasCreated } = await upsertLesson(client, ld, track);
        if (ld.quizzes) await upsertQuizzes(client, id, ld.quizzes);
        if (wasCreated) { console.log(`  [new]    ${ld.slug}`); created++; }
        else            { console.log(`  [skip]   ${ld.slug}`); updated++; }
      }
      console.log(`  → ${created} created, ${updated} already existed`);
    }

    // Verify final counts
    const counts = await client.query(`SELECT track, COUNT(*) FROM lesson GROUP BY track ORDER BY track`);
    console.log("\nFinal lesson counts:");
    for (const row of counts.rows) console.log(`  ${row.track}: ${row.count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
