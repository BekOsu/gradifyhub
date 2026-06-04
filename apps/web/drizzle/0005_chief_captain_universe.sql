CREATE TABLE "interview_prep_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"interview_date" timestamp NOT NULL,
	"job_description" text NOT NULL,
	"linkedin_url" text,
	"cv_text" text,
	"target_company" text,
	"target_role" text,
	"parsed_cv" jsonb,
	"company_research" jsonb,
	"gap_analysis" jsonb,
	"prep_plan" jsonb,
	"mock_questions" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_prep_session" ADD CONSTRAINT "interview_prep_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;