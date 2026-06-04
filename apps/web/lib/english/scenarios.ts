export type ScenarioMode = 'interview' | 'standup' | 'meeting' | 'casual';

export type Scenario = {
  id: string;
  mode: ScenarioMode;
  title: string;
  context: string;
  opening: string;
  vocabulary_hints: string[];
  stack_tags: string[];
};

export const scenarios: Scenario[] = [
  // Interview scenarios
  {
    id: 'interview-ai-intro',
    mode: 'interview',
    title: 'AI Engineer — Tell me about yourself',
    context: 'You are interviewing for a mid-level AI Engineer role at a startup. The interviewer is technical but friendly.',
    opening: 'Thanks for joining us today. Before we dive into the technical questions, could you walk me through your background and what drew you to AI engineering?',
    vocabulary_hints: ['my journey', 'transitioned into', 'I was drawn to', 'hands-on experience', 'going forward'],
    stack_tags: ['ai'],
  },
  {
    id: 'interview-devops-incident',
    mode: 'interview',
    title: 'DevOps — Describe a production incident',
    context: 'A technical interview at a company with heavy Kubernetes usage. The interviewer wants to assess incident response skills.',
    opening: "Let's start with a behavioral question. Can you walk me through a production incident you've handled? I'm interested in how you diagnosed the issue and coordinated the response.",
    vocabulary_hints: ['root cause', 'postmortem', 'on-call', 'mitigated', 'rollback', 'cascading failure'],
    stack_tags: ['devops'],
  },
  {
    id: 'interview-fullstack-tradeoffs',
    mode: 'interview',
    title: 'Full-Stack — System design trade-offs',
    context: 'A system design interview round. The interviewer wants to hear you think out loud about trade-offs.',
    opening: 'Imagine you need to design a real-time notification system for a social app with 1 million daily users. How would you approach this?',
    vocabulary_hints: ['trade-off', 'bottleneck', 'scale horizontally', 'event-driven', 'latency vs throughput'],
    stack_tags: ['fullstack'],
  },

  // Standup scenarios
  {
    id: 'standup-blocked',
    mode: 'standup',
    title: 'Daily standup — blocked on a PR',
    context: "It's your daily standup. You're blocked waiting for a code review on a critical PR.",
    opening: 'Good morning! Let\'s get started. What did you work on yesterday, and what are you planning for today?',
    vocabulary_hints: ['blocked on', 'waiting for review', 'in the meantime', 'I flagged it', 'circling back'],
    stack_tags: ['general'],
  },
  {
    id: 'standup-behind-schedule',
    mode: 'standup',
    title: 'Daily standup — sprint behind schedule',
    context: 'The sprint ends in 2 days and you realize you underestimated a task. You need to communicate this clearly without causing panic.',
    opening: 'Hey, let\'s do a quick sync. How are things going with the sprint items you picked up?',
    vocabulary_hints: ['underestimated', 'scope creep', 'reprioritize', 'I wanted to flag', 'realistic timeline'],
    stack_tags: ['general'],
  },
  {
    id: 'standup-new-finding',
    mode: 'standup',
    title: 'Daily standup — unexpected technical finding',
    context: 'During testing you discovered a significant performance regression. You need to communicate it and get buy-in to fix it.',
    opening: 'Morning! Before you go through your update, anything come up you want to mention?',
    vocabulary_hints: ['came across', 'worth investigating', 'I would recommend', 'technical debt', 'before it compounds'],
    stack_tags: ['ai', 'devops'],
  },

  // Meeting scenarios
  {
    id: 'meeting-feedback',
    mode: 'meeting',
    title: '1-on-1 — giving feedback on a teammate',
    context: "A 1-on-1 with your manager. They ask you to share feedback about a teammate's recent work on a shared project.",
    opening: 'So I wanted to check in about the collaboration on the API integration project. How do you feel it went overall?',
    vocabulary_hints: ['from my perspective', 'constructive feedback', 'I noticed that', 'it would help if', 'going forward'],
    stack_tags: ['general'],
  },
  {
    id: 'meeting-proposal',
    mode: 'meeting',
    title: 'Team meeting — proposing a new tool',
    context: 'A team planning meeting. You want to propose switching the team from REST polling to WebSockets for a feature.',
    opening: 'Before we go through the sprint backlog, I wanted to open the floor — does anyone have topics they want to raise?',
    vocabulary_hints: ['I would like to propose', 'the trade-off is', 'worth the investment', "devil's advocate", 'what are your thoughts'],
    stack_tags: ['devops', 'fullstack'],
  },
  {
    id: 'meeting-deadline',
    mode: 'meeting',
    title: 'Client call — negotiating a deadline',
    context: 'A client check-in call. The client is pushing for a feature delivery date that is unrealistic given the current scope.',
    opening: 'Thanks for joining. I wanted to touch base on the delivery timeline for the dashboard feature. Where do things stand from your side?',
    vocabulary_hints: ['realistic timeline', 'scope of work', 'we can commit to', 'pushback', 'phase it out'],
    stack_tags: ['general'],
  },

  // Casual scenarios
  {
    id: 'casual-watercooler',
    mode: 'casual',
    title: 'Water cooler — weekend chat',
    context: 'Monday morning casual chat with a colleague before the workday starts.',
    opening: 'Hey! How was your weekend? Do anything fun?',
    vocabulary_hints: ['ended up', 'you know how it is', 'I have to say', 'honestly', 'not gonna lie'],
    stack_tags: ['general'],
  },
  {
    id: 'casual-conference',
    mode: 'casual',
    title: 'Tech conference — networking',
    context: 'You are at a tech conference and strike up a conversation with someone at a booth break.',
    opening: 'Hey! First time at this conference? What sessions are you most looking forward to?',
    vocabulary_hints: ['small world', 'what do you do', 'I stumbled into', 'keep in touch', 'drop me a line'],
    stack_tags: ['ai', 'fullstack'],
  },
  {
    id: 'casual-remote-life',
    mode: 'casual',
    title: 'Slack chat — remote work tips',
    context: 'A casual Slack conversation with a colleague about remote work habits and focus strategies.',
    opening: 'Hey! Random question — how do you stay focused working from home? I\'ve been really struggling lately.',
    vocabulary_hints: ['time-block', 'deep work', 'I tend to', 'what works for me', 'game changer'],
    stack_tags: ['general'],
  },
];

export function getScenariosForMode(mode: ScenarioMode): Scenario[] {
  return scenarios.filter(s => s.mode === mode);
}

export function getScenariosForStack(stackTags: string[]): Scenario[] {
  const tagsSet = new Set(stackTags);
  return scenarios.filter(s =>
    s.stack_tags.some(tag => tag === 'general' || tagsSet.has(tag))
  );
}
