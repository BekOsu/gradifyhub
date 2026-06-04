ALTER TABLE "roadmap_catalog_node" ADD COLUMN "lesson_id" text;--> statement-breakpoint
ALTER TABLE "roadmap_catalog_node" ADD COLUMN "dimension" text;--> statement-breakpoint
ALTER TABLE "roadmap_catalog_node" ADD COLUMN "difficulty" text;--> statement-breakpoint
ALTER TABLE "roadmap_catalog_node" ADD CONSTRAINT "roadmap_catalog_node_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_catalog_node" ADD CONSTRAINT "roadmap_catalog_node_lesson_unique" UNIQUE("roadmap_id","lesson_id");