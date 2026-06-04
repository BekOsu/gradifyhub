CREATE TABLE "skill_group_approval_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"skill_group_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_by" text NOT NULL,
	"approved_by" text,
	"rejection_reason" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skill_group" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" ADD CONSTRAINT "skill_group_approval_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" ADD CONSTRAINT "skill_group_approval_request_skill_group_id_skill_group_id_fk" FOREIGN KEY ("skill_group_id") REFERENCES "public"."skill_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" ADD CONSTRAINT "skill_group_approval_request_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" ADD CONSTRAINT "skill_group_approval_request_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;