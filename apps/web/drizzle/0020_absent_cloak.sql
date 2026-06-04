ALTER TABLE "admin_audit_log" DROP CONSTRAINT "admin_audit_log_admin_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" DROP CONSTRAINT "skill_group_approval_request_requested_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" DROP CONSTRAINT "skill_group_approval_request_approved_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" ADD CONSTRAINT "skill_group_approval_request_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_group_approval_request" ADD CONSTRAINT "skill_group_approval_request_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;