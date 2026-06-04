ALTER TABLE "user" DROP CONSTRAINT "user_skill_group_id_skill_group_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_skill_group_id_skill_group_id_fk" FOREIGN KEY ("skill_group_id") REFERENCES "public"."skill_group"("id") ON DELETE set null ON UPDATE no action;