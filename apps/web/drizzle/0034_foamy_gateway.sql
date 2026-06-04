CREATE TABLE "english_learning_stats" (
	"user_id" text PRIMARY KEY NOT NULL,
	"words_learned" integer DEFAULT 0 NOT NULL,
	"words_due" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_speaking_seconds" integer DEFAULT 0 NOT NULL,
	"total_listening_seconds" integer DEFAULT 0 NOT NULL,
	"shadowing_sessions_done" integer DEFAULT 0 NOT NULL,
	"speaking_sessions_done" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shadowing_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source_phrase" text NOT NULL,
	"reference_audio_url" text,
	"user_audio_url" text,
	"user_transcript" text,
	"accuracy_score" integer,
	"pacing_score" integer,
	"clarity_score" integer,
	"naturalness_score" integer,
	"ai_feedback_json" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mode" text NOT NULL,
	"scenario_id" text,
	"modality" text DEFAULT 'text' NOT NULL,
	"transcript_json" jsonb,
	"fluency_score" integer,
	"grammar_score" integer,
	"vocab_score" integer,
	"ai_feedback_json" jsonb,
	"duration_seconds" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"stability" numeric(8, 4) DEFAULT '0' NOT NULL,
	"difficulty" numeric(4, 2) DEFAULT '5.0' NOT NULL,
	"state" text DEFAULT 'new' NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp,
	"next_review_at" timestamp DEFAULT now() NOT NULL,
	"added_from_source_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_vocabulary_user_id_vocabulary_id_unique" UNIQUE("user_id","vocabulary_id")
);
--> statement-breakpoint
CREATE TABLE "vocabulary_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phrase" text NOT NULL,
	"meaning" text NOT NULL,
	"difficulty" text NOT NULL,
	"category" text NOT NULL,
	"example" text,
	"ipa_pronunciation" text,
	"frequency_score" integer DEFAULT 0 NOT NULL,
	"technical_relevance" integer DEFAULT 0 NOT NULL,
	"source_id" uuid,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_vocabulary_id" uuid NOT NULL,
	"review_type" text NOT NULL,
	"response" text,
	"grade" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"url" text,
	"title" text,
	"transcript" text,
	"language" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "english_learning_stats" ADD CONSTRAINT "english_learning_stats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shadowing_session" ADD CONSTRAINT "shadowing_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_session" ADD CONSTRAINT "speaking_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_vocabulary_id_vocabulary_item_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_added_from_source_id_vocabulary_source_id_fk" FOREIGN KEY ("added_from_source_id") REFERENCES "public"."vocabulary_source"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_item" ADD CONSTRAINT "vocabulary_item_source_id_vocabulary_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."vocabulary_source"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_item" ADD CONSTRAINT "vocabulary_item_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_review" ADD CONSTRAINT "vocabulary_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_review" ADD CONSTRAINT "vocabulary_review_user_vocabulary_id_user_vocabulary_id_fk" FOREIGN KEY ("user_vocabulary_id") REFERENCES "public"."user_vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_source" ADD CONSTRAINT "vocabulary_source_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;