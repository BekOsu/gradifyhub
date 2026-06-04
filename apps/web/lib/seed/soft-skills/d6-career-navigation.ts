// Soft Skills — D6: Career Navigation (3 lessons)
export const D6_LESSONS = [
  {
    slug: "ss-finding-being-good-mentee",
    title: "Finding (and being) a good mentee",
    description:
      "Mentorship rarely fails because mentors are bad. It fails because mentees ask the wrong things. Learn the cadence, the script, and the prep that turns a senior engineer's 30 minutes into compounding career leverage.",
    dimension: "ss-career-navigation",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 1,
    content: `## Why it matters
Every promotion, role change, and lane switch in your career will be influenced by people who are five to ten years ahead of you. The single highest-leverage activity an early-career engineer can do is build a small council of people who will tell them the truth. Most juniors never do this — not because mentors are unavailable, but because the ask is wrong. "Will you be my mentor?" is an open-ended emotional commitment. Almost no senior person says yes to it. The fix is to ask for something specific, repeatable, and small enough that a busy person can say yes without rearranging their life.

## What to know
- The wrong ask is "be my mentor." The right ask is "can I show you what I'm working on for 30 minutes once a month?" This is concrete, time-boxed, and reversible.
- A 30-minute monthly cadence is the sweet spot. Weekly is too much for a senior IC. Quarterly is too sparse to build context. Monthly forces you to have a real artifact to show.
- Use the Tried/Learned/Stuck template for every session: here's what I tried, here's what I learned, here's where I'm stuck. This converts the meeting from advice-fishing into a structured review of work.
- Being a good mentee is a performance: send a short agenda 24 hours before, write a 3-line summary within 24 hours after, and report back the following month on what you actually did with the advice. Mentors keep meeting with people who close the loop.
- Mentors are not career coaches or therapists. Keep the scope to technical scope, scope of impact, and decision frameworks. Save personal life for friends.
- Have two to three mentors, not one. One inside your company who understands the politics, one outside who tells you the truth your manager cannot, one peer one level above who remembers exactly what your transition looks like.

## How to use it
Scenario: You want to be promoted to senior. How do you find and use a mentor?

First, list three people who hold the title you want. Two should be at your company; one should be outside it. For each, write a one-paragraph DM: "I'm targeting senior in the next 12 months. I'd value 30 minutes once a month to walk you through what I'm shipping and where I'm stuck. I'll send an agenda the day before and a summary the day after. No long-term commitment — let's try one." Send all three. Expect one yes.

Before session one, write a one-page document with the three biggest projects you're driving, the scope you currently own, and the gap between you and the senior job description at your company. Lead the meeting with: "Here's what I tried this month — I led the auth refactor design review. Here's what I learned — I underestimated how much pre-alignment I needed with the security team. Here's where I'm stuck — I don't know how to push back on a staff engineer who wants a different approach."

The mentor's job is not to give you the answer. It is to compress 30 minutes of their pattern matching into your next month of decisions. After the meeting, send three bullets summarizing what you'll do differently. Next month, open with what happened.

## Assessment-style scenario
You DM a senior engineer at another company: "Will you be my mentor?" They reply "I'm a bit slammed right now." What is the better second message — and why does it work?

## Key Takeaways
- Ask for a specific 30-minute monthly slot, not an open-ended mentorship.
- Show up with Tried/Learned/Stuck — never with raw "help me" energy.
- Close the loop in writing within 24 hours, every single time.
- Build a council of two or three. No single person sees your whole career.`,
    quizzes: [
      {
        question:
          "A senior engineer two levels above you posts on Slack that they are open to chats. What is the highest-conversion opening message?",
        choices: [
          {
            id: "a",
            label: "Hi! Would you be willing to be my mentor for the next year?",
            correct: false,
          },
          {
            id: "b",
            label:
              "I'm targeting senior in the next 12 months. Could I show you what I'm working on for 30 minutes once a month? I'll send an agenda before and a summary after.",
            correct: true,
          },
          {
            id: "c",
            label: "Can we hop on a call sometime? I have lots of career questions.",
            correct: false,
          },
          {
            id: "d",
            label:
              "Could you review my resume and tell me whether I should leave my company?",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You had your first mentor session a month ago. You implemented two of the three suggestions but skipped one because you disagreed with it. What do you open session two with?",
        choices: [
          {
            id: "a",
            label:
              "Skip the past month entirely and ask a fresh question — you do not want to look defensive about the one you skipped.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Apologize for not following all three suggestions and ask if they still want to meet.",
            correct: false,
          },
          {
            id: "c",
            label:
              "Walk through Tried/Learned/Stuck, including the suggestion you did not take and your reasoning — mentors value the reasoning more than the compliance.",
            correct: true,
          },
          {
            id: "d",
            label: "Send the agenda after the meeting instead of before to save them prep time.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Your mentor is a staff engineer at your own company. You're considering interviewing elsewhere. What is the right move?",
        choices: [
          {
            id: "a",
            label:
              "Ask them directly — they have the most context on your internal trajectory.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Bring it to your outside-the-company mentor instead, because internal mentors face a conflict of interest on retention questions.",
            correct: true,
          },
          {
            id: "c",
            label: "Skip the next session and resume after you've made up your mind.",
            correct: false,
          },
          {
            id: "d",
            label:
              "Tell them you're definitely leaving so they can give you the most honest advice.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-what-l4-l5-l6-actually-means",
    title: "What L4 / L5 / L6 actually means at a 2026 engineering org",
    description:
      "Levels are not seniority badges — they are a contract about scope, impact, and autonomy. Learn the grid every modern engineering org uses, how to calibrate your self-rating against Levels.fyi and Rands, and what to push for in the 6 weeks before a perf cycle.",
    dimension: "ss-career-navigation",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    order: 2,
    content: `## Why it matters
Engineers lose a year of compensation every time they misread their level. Either they overestimate and get blindsided by a "meets" rating, or they underestimate and quietly do staff-level work for senior pay. In 2026, most modern engineering orgs — from Stripe to Carta to Series B startups — have converged on roughly the same ladder shape. Once you can name the rungs and the dimensions, you can negotiate, self-assess, and pick projects with intent instead of vibes.

## What to know
- Two ladders, one company. The IC ladder (L4 senior, L5 staff, L6 principal, numbering varies) runs parallel to the management ladder (EM, senior EM, director). They pay equivalently at each rung; switching resets your clock by roughly six months.
- The scope-impact-autonomy grid is the universal evaluation framework. Scope = how big is the thing you own (one feature / one service / one product area / one org). Impact = what changes because you exist (a metric moves / a team ships faster / the company bets differently). Autonomy = how much guidance you need (told what / told why / decides what / decides why).
- Between L4 and L5, the biggest jump is autonomy. L4 ships well-defined projects; L5 defines them.
- Between L5 and L6, the biggest jump is scope. L5 owns a system; L6 owns a problem area that spans systems and teams.
- Calibrate against three external sources, not your manager alone. Levels.fyi for compensation and titles. The Rands Leadership scope grid for ladder shape. Carta's State of Compensation report for equity bands at venture-backed startups.
- "Acting at level" is what gets you promoted. Doing your current job perfectly does not. Pick one or two projects per cycle that are explicitly above your level and document them.

## How to use it
Scenario: Your perf review is in 6 weeks and you want L5. How do you self-assess and what do you push for?

Step 1 — Pull the rubric. Every company has a written ladder; if yours does not, use the Rands grid as a stand-in. Read the L5 column line by line.

Step 2 — Run the grid on yourself, evidence-only. For scope, write the single largest thing you owned end-to-end in the last 6 months. For impact, write the metric that changed because of you, with numbers. For autonomy, ask: was I told what, told why, or did I decide both? Be brutal.

Step 3 — Identify the one gap. Most people miss L5 on autonomy, not technical skill. If autonomy is the gap, the next 6 weeks must include at least one project you proposed, scoped, and got buy-in for without your manager doing the political work.

Step 4 — Build the artifact. Write a one-page promotion case. Three bullets per dimension. Send it to your manager 4 weeks before the cycle, not 4 days before.

Step 5 — Calibrate externally. Look up your target title and YOE on Levels.fyi for your geography. If your comp is more than 15 percent below median for the level you claim, that is signal — either you're not really there yet, or the promo is overdue.

## Assessment-style scenario
You're at L4. You led a 3-engineer project last quarter that hit its goal. Your manager hints L5 is "next cycle, maybe the one after." What single piece of evidence would compress that timeline the most?

## Key Takeaways
- Levels are scope-impact-autonomy contracts, not seniority trophies.
- L4 to L5 is mostly an autonomy jump; L5 to L6 is mostly a scope jump.
- Self-assess against the written rubric plus Levels.fyi, Rands, and Carta — never against vibes.
- Write the promotion case yourself, hand it to your manager 4 weeks early.`,
    quizzes: [
      {
        question:
          "You're an L4 hoping to be promoted to L5. Which evidence is the single strongest signal of L5 behavior in 2026?",
        choices: [
          {
            id: "a",
            label: "You shipped every ticket assigned to you on time for three quarters.",
            correct: false,
          },
          {
            id: "b",
            label: "You have the highest code review throughput on the team.",
            correct: false,
          },
          {
            id: "c",
            label:
              "You identified a problem nobody assigned you, scoped a project, got buy-in from two adjacent teams, and shipped it.",
            correct: true,
          },
          {
            id: "d",
            label: "You hit your OKRs and your manager rated you exceeds last cycle.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "You're trying to figure out whether you're being paid fairly for your level. You compare yourself to two friends at other companies and decide you're underpaid. What is the gap in this approach?",
        choices: [
          {
            id: "a",
            label:
              "Two data points is not a calibration. Use Levels.fyi for your title, YOE, and geography, and the Carta State of Compensation for equity at venture-backed startups.",
            correct: true,
          },
          {
            id: "b",
            label:
              "Your friends might be lying about their comp, so you should ignore the comparison entirely.",
            correct: false,
          },
          {
            id: "c",
            label:
              "You can never know if you're underpaid without an offer in hand, so stop trying.",
            correct: false,
          },
          {
            id: "d",
            label:
              "Compensation does not correlate with level in 2026, so the comparison is meaningless.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "Using the scope-impact-autonomy grid, which engineer is most clearly already operating at L6 (principal)?",
        choices: [
          {
            id: "a",
            label:
              "Owns the auth service, ships features defined by the EM, mentors two juniors.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Identified that three teams were each building duplicate payment-retry logic, proposed and led a cross-team initiative to consolidate it, and the change measurably reduced incident load.",
            correct: true,
          },
          {
            id: "c",
            label:
              "Is the strongest debugger on the team and is paged first for production incidents.",
            correct: false,
          },
          {
            id: "d",
            label:
              "Reviews every architecture document the team produces and writes the most thorough comments.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
  {
    slug: "ss-choosing-your-lane",
    title: "Choosing your lane: IC vs. EM vs. founder vs. contractor",
    description:
      "By year five most engineers face the lane question and most answer it badly — by accident or by flattery. Use the daily-work test, the optionality argument, and the founder-engineer hybrid lens to choose intentionally and switch deliberately.",
    dimension: "ss-career-navigation",
    difficulty: "advanced",
    estimatedMinutes: 25,
    order: 3,
    content: `## Why it matters
Between years three and seven of an engineering career, almost everyone hits the lane question. It usually arrives disguised as a flattering offer — your founder taps you to run a team, a friend asks you to co-found, a recruiter dangles a staff IC role, a former client floats a six-month contract at double your rate. Most engineers choose by gravity (loudest offer), ego (best title at a wedding), or money (biggest year-one check). All three age badly. The engineers who navigate the next decade well choose by lane fit and switch lanes deliberately.

## What to know
- The four common lanes in 2026: senior IC (deep technical contributor), engineering manager (people and delivery), founder (own equity and direction), independent contractor (own time and rate).
- Each lane optimizes for a different thing. IC optimizes for depth and craft. EM optimizes for leverage through people. Founder optimizes for optionality and equity asymmetry. Contractor optimizes for autonomy and flexibility.
- The daily-work test: what do you actually want to be doing on a Tuesday afternoon at 2pm? An IC is in a code editor or design doc. An EM is in 1:1s or a hiring loop. A founder is selling — to customers, hires, or investors. A contractor is shipping a scoped deliverable. If your honest Tuesday answer is "selling," you are a founder regardless of current title.
- The optionality argument cuts both ways. IC and EM at a strong company keep you in the hiring market. Founder and contractor years build a specific story that must be sold as such. Both valid; neither is universal optionality.
- Lane switches cost 12 to 18 months on the new ladder. Plan switches; do not stumble into them. Two switches in three years reads as drift.
- The founder-engineer hybrid path is now its own lane. Engineers who do two or three years at a high-quality startup, leave to found, then return to IC or EM at staff-plus levels are common in 2026 — companies value the ownership reflex.

## How to use it
Scenario: You're a senior IC at a 200-person startup. The founder offers you the EM track. Walk through the decision.

Run the daily-work test first, not the title test. Block 30 minutes. Write what you did this past Tuesday afternoon — in detail. Now write what an EM on your team did. Which version do you want to repeat 50 times this year? If you flinch at the EM version, the answer is no, regardless of the offer. Founders often offer EM track to retain their strongest IC, not because they think you'll be a great manager.

Run the optionality argument. If the EM role fails (30 to 40 percent of first-time EM transitions revert within 18 months in 2026), can you return to IC at your level? Ask explicitly: "If this does not work, do I return to senior IC at the same comp?" Anything short of a clear yes in writing, and the optionality is worse than it looks.

Run the equity arithmetic. EM at a 200-person startup is a salary-and-stability play, not an equity play — the asymmetry has compressed. If your motivation is upside, the founder lane is the honest version.

Decide on a window, not forever. "I'll try EM for 12 months and reassess at month 9" beats "I am now an EM." Lanes are not identities.

## Assessment-style scenario
You are deciding between three offers: staff IC at a public company (clear ladder), EM at a 60-person startup (your friend's company), and a 6-month contract at $250/hour. What is the first question to ask yourself before comparing offers?

## Key Takeaways
- Choose by daily-work test, not by title, money, or whose offer is loudest.
- Every lane switch costs 12 to 18 months on the new ladder. Plan it.
- Get the reversibility clause in writing before taking EM track.
- Founder-engineer hybrid is now a real lane, not a detour — but only if you actually did the founding.`,
    quizzes: [
      {
        question:
          "Apply the daily-work test. An engineer says: 'On Tuesday afternoons I want to be talking to three customers, then writing the recruiting pitch for our next hire.' Which lane fits best?",
        choices: [
          {
            id: "a",
            label: "Staff IC — they enjoy talking to people.",
            correct: false,
          },
          {
            id: "b",
            label: "Engineering Manager — running 1:1s and hiring.",
            correct: false,
          },
          {
            id: "c",
            label:
              "Founder — the honest Tuesday afternoon is selling (to customers and to hires), which is the founder's job description.",
            correct: true,
          },
          {
            id: "d",
            label: "Contractor — they want variety in their day.",
            correct: false,
          },
        ],
        order: 1,
      },
      {
        question:
          "Your founder offers you EM track verbally and says 'don't worry, we'll figure it out' when you ask about returning to IC if it does not work. What is the right next move?",
        choices: [
          {
            id: "a",
            label:
              "Accept — at this stage you have to take some career risk to grow.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Decline — verbal reassurances about reversibility are worth roughly zero. Either get the IC-fallback clause in writing in your offer letter, or treat this as a one-way door.",
            correct: true,
          },
          {
            id: "c",
            label:
              "Accept and trust the founder, since you've worked together for two years.",
            correct: false,
          },
          {
            id: "d",
            label:
              "Counter for a higher salary instead — money compensates for the optionality risk.",
            correct: false,
          },
        ],
        order: 2,
      },
      {
        question:
          "An engineer has done senior IC, then EM, then contractor, then IC again, all in the last 3 years. How does a 2026 recruiter most likely read this resume?",
        choices: [
          {
            id: "a",
            label:
              "Versatile and modern — exactly the kind of multi-lane operator companies want.",
            correct: false,
          },
          {
            id: "b",
            label:
              "Drift — two switches in three years reads as indecision, and each switch reset their ladder. The story needs to be reframed as deliberate (e.g., founder-engineer hybrid path) or it caps level offers.",
            correct: true,
          },
          {
            id: "c",
            label:
              "It does not matter — recruiters only look at the most recent role.",
            correct: false,
          },
          {
            id: "d",
            label:
              "A strong signal for principal-level roles because of breadth.",
            correct: false,
          },
        ],
        order: 3,
      },
    ],
  },
] as const;
