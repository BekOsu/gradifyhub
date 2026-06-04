CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"tutor_id" text NOT NULL,
	"student_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"approval_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skill_group_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tutor_skill_group" (
	"id" text PRIMARY KEY NOT NULL,
	"tutor_id" text NOT NULL,
	"skill_group_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tutor_skill_group_unique" UNIQUE("tutor_id","skill_group_id")
);
--> statement-breakpoint
ALTER TABLE "roadmap" ADD COLUMN "approval_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "roadmap" ADD COLUMN "approved_by_tutor_id" text;--> statement-breakpoint
ALTER TABLE "roadmap" ADD COLUMN "approval_required" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "skill_group_id" text;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_tutor_id_user_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_skill_group" ADD CONSTRAINT "tutor_skill_group_tutor_id_user_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_skill_group" ADD CONSTRAINT "tutor_skill_group_skill_group_id_skill_group_id_fk" FOREIGN KEY ("skill_group_id") REFERENCES "public"."skill_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_approved_by_tutor_id_user_id_fk" FOREIGN KEY ("approved_by_tutor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_skill_group_id_skill_group_id_fk" FOREIGN KEY ("skill_group_id") REFERENCES "public"."skill_group"("id") ON DELETE no action ON UPDATE no action;