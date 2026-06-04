import { pgTable, text, timestamp, boolean, integer, real, jsonb, unique, uuid, numeric, type AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const skillGroup = pgTable("skill_group", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  approvalRequired: boolean("approval_required").notNull().default(true),
  capacity: integer("capacity"), // null = unlimited
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skillGroupApprovalRequest = pgTable("skill_group_approval_request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skillGroupId: text("skill_group_id")
    .notNull()
    .references(() => skillGroup.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requestedBy: text("requested_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
  rejectionReason: text("rejection_reason"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  skillGroupId: text("skill_group_id").references(() => skillGroup.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adminAuditLog = pgTable("admin_audit_log", {
  id: text("id").primaryKey(),
  adminId: text("admin_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  targetUserId: text("target_user_id"),
  targetUserEmail: text("target_user_email"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Onboarding ---

export type AiCalibration = {
  calledLlmApi: boolean;
  builtRag: boolean;
  builtAgents: boolean;
  shippedToProduction: boolean;
  intent: string;    // "get_hired" | "freelance" | "build_product" | "upskill"
  painPoint: string; // "dont_know_where_to_start" | "too_theoretical" | "need_portfolio" | "stuck_on_agents"
  outcome?: string;  // "hired" | "promoted" | "freelance" | "salary"
  outcomeRecordedAt?: string; // ISO 8601
  // AI track foundation check (stored by lib/foundation/storage.ts)
  foundationCheckScore?: number;
  foundationCheckCompletedAt?: string; // ISO 8601
  foundationPathCompletedAt?: string;  // ISO 8601
  // Foundation check scores for non-AI tracks (0–5 scale)
  ssFoundationCheckScore?: number;
  ssFoundationPathCompletedAt?: string; // ISO 8601
  engFoundationCheckScore?: number;
  engFoundationPathCompletedAt?: string; // ISO 8601
};

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  currentRole: text("current_role"),
  yearsOfExperience: text("years_of_experience"),
  targetTimeline: text("target_timeline"),
  hoursPerWeek: text("hours_per_week"),
  goal: text("goal"),
  hoursPerDay: text("hours_per_day"),
  daysPerWeek: text("days_per_week"),
  knownStack: jsonb("known_stack"), // { languages: string[], frameworks: string[], custom?: string }
  // Evidence-based earned levels per dimension from self-assessment.
  // Separate from attempt.knowledge_scores (MCQ signal) — never conflate.
  earnedLevels: jsonb("earned_levels").$type<Record<string, number>>(),
  // AI track calibration flags collected at onboarding — drives assessment item selection + roadmap weights.
  aiCalibration: jsonb("ai_calibration").$type<AiCalibration>(),
  onboardedAt: timestamp("onboarded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Assessment ---

export const item = pgTable("item", {
  id: text("id").primaryKey(),
  stem: text("stem").notNull(),
  choices: jsonb("choices").notNull(),
  dimension: text("dimension").notNull(),
  difficultyB: real("difficulty_b").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const attempt = pgTable("attempt", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  pausedAt: timestamp("paused_at"),
  itemSequence: jsonb("item_sequence").notNull().default([]),
  status: text("status").notNull().default("in-progress"),
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  totalPauseMs: integer("total_pause_ms").notNull().default(0),
  // Snapshot of user's goal at attempt start; used for exact goal-mismatch checks later.
  attemptGoal: text("attempt_goal"),
  // MCQ %-derived readiness per dimension — directional signal, not an earned level.
  // Populated when assessment is completed; null on legacy rows.
  knowledgeScores: jsonb("knowledge_scores").$type<Record<string, number>>(),
  // Evidence-based earned levels per dimension from self-assessment (Phase 2).
  // Separate column: never conflate knowledge_scores with earned_levels.
  earnedLevels: jsonb("earned_levels").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const response = pgTable("response", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempt.id, { onDelete: "cascade" }),
  itemId: text("item_id")
    .notNull()
    .references(() => item.id),
  choiceId: text("choice_id").notNull(),
  skipped: boolean("skipped").notNull().default(false),
  timeMs: integer("time_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Roadmap ---

export const roadmap = pgTable("roadmap", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  totalWeeks: integer("total_weeks").notNull(),
  approvalStatus: text("approval_status").notNull().default("pending"),
  approvedByTutorId: text("approved_by_tutor_id").references(() => user.id, { onDelete: "set null" }),
  approvalRequired: boolean("approval_required").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const phase = pgTable("phase", {
  id: text("id").primaryKey(),
  roadmapId: text("roadmap_id")
    .notNull()
    .references(() => roadmap.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  weeks: integer("weeks").notNull(),
  order: integer("order").notNull(),
  status: text("status").notNull().default("locked"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skill = pgTable("skill", {
  id: text("id").primaryKey(),
  phaseId: text("phase_id")
    .notNull()
    .references(() => phase.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  status: text("status").notNull().default("locked"),
  marketBadge: text("market_badge"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSkillProgress = pgTable("user_skill_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skillId: text("skill_id")
    .notNull()
    .references(() => skill.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("locked"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Lessons ---

export const lesson = pgTable("lesson", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  skillId: text("skill_id"),
  dimension: text("dimension"),
  track: text("track").notNull().default("ai-engineer"),
  globalSequenceIndex: integer("global_sequence_index").notNull().default(0),
  order: integer("order").notNull().default(0),
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
  difficulty: text("difficulty").notNull().default("beginner"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at"),
  quizScore: integer("quiz_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quiz = pgTable("quiz", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  choices: jsonb("choices").notNull(),
  order: integer("order").notNull().default(0),
});

export const quizUsage = pgTable("quiz_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizSubmission = pgTable("quiz_submission", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull().default(100),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// --- Streak ---

export const streak = pgTable("streak", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at"),
  freezesRemaining: integer("freezes_remaining").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Resume ---

export const resume = pgTable("resume", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("My Resume"),
  content: jsonb("content").notNull().default({}),
  isPublic: boolean("is_public").notNull().default(false),
  publicSlug: text("public_slug").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Payments / Subscription ---

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  lsSubscriptionId: text("ls_subscription_id"),
  lsCustomerId: text("ls_customer_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Interview Prep ---

export const interviewPrepSession = pgTable("interview_prep_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  interviewDate: timestamp("interview_date").notNull(),
  jobDescription: text("job_description").notNull(),
  linkedinUrl: text("linkedin_url"),
  cvText: text("cv_text"),
  targetCompany: text("target_company"),
  targetRole: text("target_role"),
  parsedCv: jsonb("parsed_cv"),
  companyResearch: jsonb("company_research"),
  gapAnalysis: jsonb("gap_analysis"),
  prepPlan: jsonb("prep_plan"),
  mockQuestions: jsonb("mock_questions"),
  status: text("status").notNull().default("pending"), // pending | processing | ready | failed
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Coupons ---

export const coupon = pgTable("coupon", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPct: integer("discount_pct").notNull(), // 0–100
  maxRedemptions: integer("max_redemptions"), // null = unlimited
  redeemedCount: integer("redeemed_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  note: text("note"), // admin-only label
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couponRedemption = pgTable("coupon_redemption", {
  id: text("id").primaryKey(),
  couponId: text("coupon_id")
    .notNull()
    .references(() => coupon.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
});

// --- OpenRouter integration ---

export const openrouterIntegration = pgTable("openrouter_integration", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  encryptedKey: text("encrypted_key").notNull(),
  connected: boolean("connected").notNull().default(true),
  monthlyBudgetCents: integer("monthly_budget_cents"), // null = no cap; e.g. 1000 = $10.00
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Usage log ---

export const usageLog = pgTable("usage_log", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(), // "assessment" | "lesson" | "interview_prep" | "roadmap" | "resume"
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  // 1/1,000,000 USD — derived from token counts × hardcoded model pricing
  costMicroUsd: integer("cost_micro_usd").notNull().default(0),
  cached: boolean("cached").notNull().default(false),
  source: text("source").notNull().default("platform"), // "platform" | "byok"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- AI model preferences ---

export const aiModelPreference = pgTable("ai_model_preference", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  modelId: text("model_id").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [unique("ai_model_pref_user_feature_idx").on(t.userId, t.feature)]);

// --- Tutor System ---

export const tutorSkillGroup = pgTable("tutor_skill_group", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skillGroupId: text("skill_group_id")
    .notNull()
    .references(() => skillGroup.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("tutor_skill_group_unique").on(t.tutorId, t.skillGroupId)]);

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  senderRole: text("sender_role").notNull().default("tutor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Relations ---

export const skillGroupRelations = relations(skillGroup, ({ many }) => ({
  tutors: many(tutorSkillGroup),
  approvalRequests: many(skillGroupApprovalRequest),
}));

export const tutorSkillGroupRelations = relations(tutorSkillGroup, ({ one }) => ({
  tutor: one(user, { fields: [tutorSkillGroup.tutorId], references: [user.id] }),
  skillGroup: one(skillGroup, { fields: [tutorSkillGroup.skillGroupId], references: [skillGroup.id] }),
}));

export const skillGroupApprovalRequestRelations = relations(skillGroupApprovalRequest, ({ one }) => ({
  user: one(user, { fields: [skillGroupApprovalRequest.userId], references: [user.id] }),
  skillGroup: one(skillGroup, { fields: [skillGroupApprovalRequest.skillGroupId], references: [skillGroup.id] }),
  requestedByUser: one(user, { fields: [skillGroupApprovalRequest.requestedBy], references: [user.id], relationName: "requestedByAdmin" }),
  approvedByUser: one(user, { fields: [skillGroupApprovalRequest.approvedBy], references: [user.id], relationName: "approvedByAdmin" }),
}));

export const messageRelations = relations(message, ({ one }) => ({
  tutor: one(user, { fields: [message.tutorId], references: [user.id], relationName: "tutorMessages" }),
  student: one(user, { fields: [message.studentId], references: [user.id], relationName: "studentMessages" }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  skillGroup: one(skillGroup, { fields: [user.skillGroupId], references: [skillGroup.id] }),
  tutorSkillGroups: many(tutorSkillGroup),
  tutorMessages: many(message, { relationName: "tutorMessages" }),
  studentMessages: many(message, { relationName: "studentMessages" }),
}));

export const roadmapRelations = relations(roadmap, ({ many, one }) => ({
  user: one(user, { fields: [roadmap.userId], references: [user.id] }),
  phases: many(phase),
  approvedByTutor: one(user, { fields: [roadmap.approvedByTutorId], references: [user.id] }),
}));

export const phaseRelations = relations(phase, ({ one, many }) => ({
  roadmap: one(roadmap, { fields: [phase.roadmapId], references: [roadmap.id] }),
  skills: many(skill),
}));

export const skillRelations = relations(skill, ({ one }) => ({
  phase: one(phase, { fields: [skill.phaseId], references: [phase.id] }),
}));

export const attemptRelations = relations(attempt, ({ one, many }) => ({
  user: one(user, { fields: [attempt.userId], references: [user.id] }),
  responses: many(response),
}));

export const responseRelations = relations(response, ({ one }) => ({
  attempt: one(attempt, { fields: [response.attemptId], references: [attempt.id] }),
}));

export const lessonRelations = relations(lesson, ({ many }) => ({
  progress: many(lessonProgress),
  quizzes: many(quiz),
  submissions: many(quizSubmission),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lesson, { fields: [lessonProgress.lessonId], references: [lesson.id] }),
}));

export const quizSubmissionRelations = relations(quizSubmission, ({ one }) => ({
  user: one(user, { fields: [quizSubmission.userId], references: [user.id] }),
  lesson: one(lesson, { fields: [quizSubmission.lessonId], references: [lesson.id] }),
}));

export const couponRelations = relations(coupon, ({ many }) => ({
  redemptions: many(couponRedemption),
}));

export const couponRedemptionRelations = relations(couponRedemption, ({ one }) => ({
  coupon: one(coupon, { fields: [couponRedemption.couponId], references: [coupon.id] }),
  user: one(user, { fields: [couponRedemption.userId], references: [user.id] }),
}));

export const interviewPrepSessionRelations = relations(interviewPrepSession, ({ one }) => ({
  user: one(user, { fields: [interviewPrepSession.userId], references: [user.id] }),
}));

// --- Community Posts ---

export const communityPost = pgTable("community_post", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  body: text("body").notNull(),
  category: text("category").notNull().default("general"), // general | win | question | resource
  mediaUrl: text("media_url"),
  tags: jsonb("tags").notNull().default([]), // string[]
  isPoll: boolean("is_poll").notNull().default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communityPoll = pgTable("community_poll", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => communityPost.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communityPollOption = pgTable("community_poll_option", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull().references(() => communityPoll.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communityPollVote = pgTable("community_poll_vote", {
  id: text("id").primaryKey(),
  pollId: text("poll_id").notNull().references(() => communityPoll.id, { onDelete: "cascade" }),
  optionId: text("option_id").notNull().references(() => communityPollOption.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("community_poll_vote_unique").on(t.pollId, t.userId)]);

export const communityPollRelations = relations(communityPoll, ({ one, many }) => ({
  post: one(communityPost, { fields: [communityPoll.postId], references: [communityPost.id] }),
  options: many(communityPollOption),
  votes: many(communityPollVote),
}));

export const communityPollOptionRelations = relations(communityPollOption, ({ one, many }) => ({
  poll: one(communityPoll, { fields: [communityPollOption.pollId], references: [communityPoll.id] }),
  votes: many(communityPollVote),
}));

export const communityPollVoteRelations = relations(communityPollVote, ({ one }) => ({
  poll: one(communityPoll, { fields: [communityPollVote.pollId], references: [communityPoll.id] }),
  option: one(communityPollOption, { fields: [communityPollVote.optionId], references: [communityPollOption.id] }),
  user: one(user, { fields: [communityPollVote.userId], references: [user.id] }),
}));

export const communityPostRelations = relations(communityPost, ({ one, many }) => ({
  user: one(user, { fields: [communityPost.userId], references: [user.id] }),
  reactions: many(communityReaction),
  comments: many(communityComment),
  poll: one(communityPoll, { fields: [communityPost.id], references: [communityPoll.postId] }),
}));

// --- Blog Comments ---

export const blogComment = pgTable("blog_comment", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  parentId: text("parent_id").references((): AnyPgColumn => blogComment.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blogCommentRelations = relations(blogComment, ({ one, many }) => ({
  user: one(user, { fields: [blogComment.userId], references: [user.id] }),
  parent: one(blogComment, { fields: [blogComment.parentId], references: [blogComment.id], relationName: "replies" }),
  replies: many(blogComment, { relationName: "replies" }),
}));

// --- Blog Engagement ---

export const blogLike = pgTable("blog_like", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("blog_like_unique").on(t.slug, t.userId)]);

export const blogReaction = pgTable("blog_reaction", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(), // 👍 ❤️ 😂 😮 😢 😡
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("blog_reaction_unique").on(t.slug, t.userId)]);

export const blogBookmark = pgTable("blog_bookmark", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("blog_bookmark_unique").on(t.slug, t.userId)]);

export const blogLikeRelations = relations(blogLike, ({ one }) => ({
  user: one(user, { fields: [blogLike.userId], references: [user.id] }),
}));
export const blogReactionRelations = relations(blogReaction, ({ one }) => ({
  user: one(user, { fields: [blogReaction.userId], references: [user.id] }),
}));
export const blogBookmarkRelations = relations(blogBookmark, ({ one }) => ({
  user: one(user, { fields: [blogBookmark.userId], references: [user.id] }),
}));

// --- Community Engagement ---

export const communityReaction = pgTable("community_reaction", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => communityPost.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(), // 👍 ❤️ 😂 😮 😢 😡
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("community_reaction_unique").on(t.postId, t.userId)]);

export const communityComment = pgTable("community_comment", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => communityPost.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  parentId: text("parent_id").references((): AnyPgColumn => communityComment.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const communityReactionRelations = relations(communityReaction, ({ one }) => ({
  user: one(user, { fields: [communityReaction.userId], references: [user.id] }),
  post: one(communityPost, { fields: [communityReaction.postId], references: [communityPost.id] }),
}));

export const communityCommentRelations = relations(communityComment, ({ one, many }) => ({
  user: one(user, { fields: [communityComment.userId], references: [user.id] }),
  post: one(communityPost, { fields: [communityComment.postId], references: [communityPost.id] }),
  parent: one(communityComment, { fields: [communityComment.parentId], references: [communityComment.id], relationName: "communityReplies" }),
  replies: many(communityComment, { relationName: "communityReplies" }),
}));

// --- User Follow Graph ---

export const userFollow = pgTable("user_follow", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  followingId: text("following_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("user_follow_unique").on(t.followerId, t.followingId)]);

export const userFollowRelations = relations(userFollow, ({ one }) => ({
  follower: one(user, { fields: [userFollow.followerId], references: [user.id], relationName: "following" }),
  following: one(user, { fields: [userFollow.followingId], references: [user.id], relationName: "followers" }),
}));

// --- Inspire / Creative Section ---

export const inspirePost = pgTable("inspire_post", {
  id: text("id").primaryKey(),
  type: text("type").notNull().default("daily"), // daily | challenge | project | tip
  title: text("title").notNull(),
  body: text("body").notNull(),
  tags: jsonb("tags").notNull().default([]), // string[]
  authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
  featured: boolean("featured").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inspireLike = pgTable("inspire_like", {
  id: text("id").primaryKey(),
  inspirePostId: text("inspire_post_id").notNull().references(() => inspirePost.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique("inspire_like_unique").on(t.inspirePostId, t.userId)]);

export const inspirePostRelations = relations(inspirePost, ({ one, many }) => ({
  author: one(user, { fields: [inspirePost.authorId], references: [user.id] }),
  likes: many(inspireLike),
}));

export const inspireLikeRelations = relations(inspireLike, ({ one }) => ({
  post: one(inspirePost, { fields: [inspireLike.inspirePostId], references: [inspirePost.id] }),
  user: one(user, { fields: [inspireLike.userId], references: [user.id] }),
}));

export const openrouterIntegrationRelations = relations(openrouterIntegration, ({ one }) => ({
  user: one(user, { fields: [openrouterIntegration.userId], references: [user.id] }),
}));

export const usageLogRelations = relations(usageLog, ({ one }) => ({
  user: one(user, { fields: [usageLog.userId], references: [user.id] }),
}));

export const aiModelPreferenceRelations = relations(aiModelPreference, ({ one }) => ({
  user: one(user, { fields: [aiModelPreference.userId], references: [user.id] }),
}));

// --- Roadmap Catalog (roadmap.sh data-only hybrid import) ---

export const roadmapCatalog = pgTable("roadmap_catalog", {
  // slug is used as PK, e.g. "ai-engineer", "frontend", "backend"
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  nodeCount: integer("node_count").notNull().default(0),
  // Full ReactFlow JSON { nodes: [], edges: [] } from roadmap.sh source
  rawData: jsonb("raw_data").notNull().default({}),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const roadmapCatalogNode = pgTable("roadmap_catalog_node", {
  id: text("id").primaryKey(),
  roadmapId: text("roadmap_id")
    .notNull()
    .references(() => roadmapCatalog.id, { onDelete: "cascade" }),
  // The node ID from the ReactFlow JSON (used to link back to rawData and for progress tracking)
  nodeId: text("node_id").notNull(),
  type: text("type").notNull().default("topic"), // topic | subtopic | button | section
  label: text("label").notNull(),
  description: text("description"),
  // ID of the parent node within the same roadmap (null for top-level nodes)
  parentNodeId: text("parent_node_id"),
  order: integer("order").notNull().default(0),
  // Lesson mapping: FK + denormalized fields for fallback matching
  lessonId: text("lesson_id").references(() => lesson.id, { onDelete: "set null" }),
  dimension: text("dimension"), // denormalized from lesson
  difficulty: text("difficulty"), // denormalized from lesson
}, (t) => [
  unique("roadmap_catalog_node_unique").on(t.roadmapId, t.nodeId),
  unique("roadmap_catalog_node_lesson_unique").on(t.roadmapId, t.lessonId),
]);

export const roadmapCatalogContent = pgTable("roadmap_catalog_content", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .references(() => roadmapCatalogNode.id, { onDelete: "cascade" }),
  // article | video | course | official | opensource
  type: text("type").notNull().default("article"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
});

export const userRoadmapNodeProgress = pgTable("user_roadmap_node_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  catalogNodeId: text("catalog_node_id")
    .notNull()
    .references(() => roadmapCatalogNode.id, { onDelete: "cascade" }),
  // done | in-progress | skip
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [unique("user_roadmap_node_progress_unique").on(t.userId, t.catalogNodeId)]);

export const roadmapCatalogRelations = relations(roadmapCatalog, ({ many }) => ({
  nodes: many(roadmapCatalogNode),
}));

export const roadmapCatalogNodeRelations = relations(roadmapCatalogNode, ({ one, many }) => ({
  roadmap: one(roadmapCatalog, { fields: [roadmapCatalogNode.roadmapId], references: [roadmapCatalog.id] }),
  content: many(roadmapCatalogContent),
  userProgress: many(userRoadmapNodeProgress),
}));

export const roadmapCatalogContentRelations = relations(roadmapCatalogContent, ({ one }) => ({
  node: one(roadmapCatalogNode, { fields: [roadmapCatalogContent.nodeId], references: [roadmapCatalogNode.id] }),
}));

export const userRoadmapNodeProgressRelations = relations(userRoadmapNodeProgress, ({ one }) => ({
  user: one(user, { fields: [userRoadmapNodeProgress.userId], references: [user.id] }),
  catalogNode: one(roadmapCatalogNode, { fields: [userRoadmapNodeProgress.catalogNodeId], references: [roadmapCatalogNode.id] }),
}));

// --- System Settings (admin-controlled key/value flags) ---

export const systemSetting = pgTable("system_setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Tracks (DB-driven, admin-managed) ---

export type TrackMarketData = {
  roleNames: string[];
  responsibilities: string[];
  salaryRange: { min: number; max: number; currency: string; period: string; source: string };
  hiringContext: string;
  curriculumPreview: string[];
};

export type LiveJobData = {
  companies: string[];     // unique hiring companies from recent posts
  jobCount: number;        // total jobs found across sources
  sampleTitles: string[];  // 3-5 job title variations
  jobListings?: Array<{    // detailed job listings with source links
    id: string;
    company: string;
    title: string;
    sourceUrl?: string;
    source: "remotive" | "remoteok" | "gulf-search" | "arbeitnow";
  }>;
  regionalSalary?: Record<string, {  // regional salary data from market research
    min: number;
    max: number;
    currency: string;
    period: "year";
    source: string;
  }>;
  fetchedAt: string;       // ISO timestamp
  sources: string[];       // e.g. ["remotive", "remoteok", "github", "devto", "stackoverflow"]
};

export const track = pgTable("track", {
  id:          text("id").primaryKey(),
  value:       text("value").notNull().unique(),
  label:       text("label").notNull(),
  description: text("description").notNull(),
  icon:        text("icon").notNull().default("code"),
  enabled:     boolean("enabled").notNull().default(false),
  recommended: boolean("recommended").notNull().default(false),
  order:       integer("order").notNull().default(0),
  // jsonb array of strings e.g. ["TypeScript", "Python"]
  languages:   jsonb("languages").$type<string[]>().notNull().default([]),
  // jsonb array of {key: string, label: string}
  dimensions:  jsonb("dimensions").$type<{ key: string; label: string }[]>().notNull().default([]),
  // job market context shown to users before they pick this track
  marketData:  jsonb("market_data").$type<TrackMarketData>(),
  // live job market data refreshed by the job feed cron
  liveJobData: jsonb("live_job_data").$type<LiveJobData>(),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

// --- Free Courses Catalog (admin-managed, public) ---

export const course = pgTable("course", {
  id:            text("id").primaryKey(),
  slug:          text("slug").notNull().unique(),
  title:         text("title").notNull(),
  description:   text("description").notNull(),
  provider:      text("provider").notNull(),
  imageUrl:      text("image_url"),
  courseUrl:     text("course_url").notNull(),
  level:         text("level").notNull().default("beginner"),
  category:      text("category").notNull(),
  tags:          jsonb("tags").$type<string[]>().notNull().default([]),
  durationHours: integer("duration_hours"),
  studentCount:  integer("student_count"),
  rating:        real("rating"),
  isFree:        boolean("is_free").notNull().default(true),
  isPublished:   boolean("is_published").notNull().default(false),
  order:         integer("order").notNull().default(0),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
});

export const courseRelations = relations(course, () => ({}));

// --- Blog Posts (admin-managed, file-based to DB migration) ---

export const blogPost = pgTable("blog_post", {
  id:          text("id").primaryKey(),
  slug:        text("slug").notNull().unique(),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  author:      text("author").notNull().default("GradifyHub"),
  content:     text("content").notNull(),
  tags:        jsonb("tags").$type<string[]>().notNull().default([]),
  readingTime: integer("reading_time").notNull().default(1),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

// --- English Immersion Platform ---

export const vocabularySource = pgTable("vocabulary_source", {
  id:          uuid("id").defaultRandom().primaryKey(),
  userId:      text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  kind:        text("kind").notNull(),
  url:         text("url"),
  title:       text("title"),
  transcript:  text("transcript"),
  language:    text("language").notNull().default("en"),
  status:      text("status").notNull().default("pending"),
  itemCount:   integer("item_count").notNull().default(0),
  processedAt: timestamp("processed_at"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const vocabularyItem = pgTable("vocabulary_item", {
  id:                 uuid("id").defaultRandom().primaryKey(),
  phrase:             text("phrase").notNull(),
  meaning:            text("meaning").notNull(),
  difficulty:         text("difficulty").notNull(),
  category:           text("category").notNull(),
  example:            text("example"),
  ipaPronunciation:   text("ipa_pronunciation"),
  frequencyScore:     integer("frequency_score").notNull().default(0),
  technicalRelevance: integer("technical_relevance").notNull().default(0),
  sourceId:           uuid("source_id").references(() => vocabularySource.id, { onDelete: "set null" }),
  createdByUserId:    text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt:          timestamp("created_at").notNull().defaultNow(),
});

export const userVocabulary = pgTable("user_vocabulary", {
  id:                uuid("id").defaultRandom().primaryKey(),
  userId:            text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  vocabularyId:      uuid("vocabulary_id").notNull().references(() => vocabularyItem.id, { onDelete: "cascade" }),
  stability:         numeric("stability", { precision: 8, scale: 4 }).notNull().default("0"),
  difficulty:        numeric("difficulty", { precision: 4, scale: 2 }).notNull().default("5.0"),
  state:             text("state").notNull().default("new"),
  reps:              integer("reps").notNull().default(0),
  lapses:            integer("lapses").notNull().default(0),
  lastReviewedAt:    timestamp("last_reviewed_at"),
  nextReviewAt:      timestamp("next_review_at").notNull().defaultNow(),
  addedFromSourceId: uuid("added_from_source_id").references(() => vocabularySource.id, { onDelete: "set null" }),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
}, (t) => [unique().on(t.userId, t.vocabularyId)]);

export const vocabularyReview = pgTable("vocabulary_review", {
  id:               uuid("id").defaultRandom().primaryKey(),
  userId:           text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  userVocabularyId: uuid("user_vocabulary_id").notNull().references(() => userVocabulary.id, { onDelete: "cascade" }),
  reviewType:       text("review_type").notNull(),
  response:         text("response"),
  grade:            integer("grade").notNull(),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
});

export const shadowingSession = pgTable("shadowing_session", {
  id:                uuid("id").defaultRandom().primaryKey(),
  userId:            text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  sourcePhrase:      text("source_phrase").notNull(),
  referenceAudioUrl: text("reference_audio_url"),
  userAudioUrl:      text("user_audio_url"),
  userTranscript:    text("user_transcript"),
  accuracyScore:     integer("accuracy_score"),
  pacingScore:       integer("pacing_score"),
  clarityScore:      integer("clarity_score"),
  naturalnessScore:  integer("naturalness_score"),
  aiFeedbackJson:    jsonb("ai_feedback_json"),
  status:            text("status").notNull().default("pending"),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
});

export const speakingSession = pgTable("speaking_session", {
  id:              uuid("id").defaultRandom().primaryKey(),
  userId:          text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  mode:            text("mode").notNull(),
  scenarioId:      text("scenario_id"),
  modality:        text("modality").notNull().default("text"),
  transcriptJson:  jsonb("transcript_json"),
  fluencyScore:    integer("fluency_score"),
  grammarScore:    integer("grammar_score"),
  vocabScore:      integer("vocab_score"),
  aiFeedbackJson:  jsonb("ai_feedback_json"),
  durationSeconds: integer("duration_seconds"),
  status:          text("status").notNull().default("active"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  completedAt:     timestamp("completed_at"),
});

export const englishLearningStats = pgTable("english_learning_stats", {
  userId:                text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  wordsLearned:          integer("words_learned").notNull().default(0),
  wordsDue:              integer("words_due").notNull().default(0),
  currentStreak:         integer("current_streak").notNull().default(0),
  longestStreak:         integer("longest_streak").notNull().default(0),
  totalSpeakingSeconds:  integer("total_speaking_seconds").notNull().default(0),
  totalListeningSeconds: integer("total_listening_seconds").notNull().default(0),
  shadowingSessionsDone: integer("shadowing_sessions_done").notNull().default(0),
  speakingSessionsDone:  integer("speaking_sessions_done").notNull().default(0),
  lastActivityAt:        timestamp("last_activity_at"),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
});

export const blogPostRelations = relations(blogPost, () => ({}))
