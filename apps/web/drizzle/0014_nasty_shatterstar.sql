ALTER TABLE "attempt" ADD COLUMN "paused_at" timestamp;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "status" text DEFAULT 'in-progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "current_question_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "total_pause_ms" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "response" ADD COLUMN "skipped" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "response" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;