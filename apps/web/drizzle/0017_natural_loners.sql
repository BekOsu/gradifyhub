CREATE TABLE "roadmap_catalog" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"node_count" integer DEFAULT 0 NOT NULL,
	"raw_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_catalog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "roadmap_catalog_content" (
	"id" text PRIMARY KEY NOT NULL,
	"node_id" text NOT NULL,
	"type" text DEFAULT 'article' NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_catalog_node" (
	"id" text PRIMARY KEY NOT NULL,
	"roadmap_id" text NOT NULL,
	"node_id" text NOT NULL,
	"type" text DEFAULT 'topic' NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"parent_node_id" text,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "roadmap_catalog_node_unique" UNIQUE("roadmap_id","node_id")
);
--> statement-breakpoint
CREATE TABLE "user_roadmap_node_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"catalog_node_id" text NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roadmap_node_progress_unique" UNIQUE("user_id","catalog_node_id")
);
--> statement-breakpoint
ALTER TABLE "roadmap_catalog_content" ADD CONSTRAINT "roadmap_catalog_content_node_id_roadmap_catalog_node_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."roadmap_catalog_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_catalog_node" ADD CONSTRAINT "roadmap_catalog_node_roadmap_id_roadmap_catalog_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmap_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmap_node_progress" ADD CONSTRAINT "user_roadmap_node_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmap_node_progress" ADD CONSTRAINT "user_roadmap_node_progress_catalog_node_id_roadmap_catalog_node_id_fk" FOREIGN KEY ("catalog_node_id") REFERENCES "public"."roadmap_catalog_node"("id") ON DELETE cascade ON UPDATE no action;