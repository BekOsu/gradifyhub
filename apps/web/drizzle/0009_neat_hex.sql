CREATE TABLE "blog_bookmark" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_bookmark_unique" UNIQUE("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "blog_like" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_like_unique" UNIQUE("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "blog_reaction" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_reaction_unique" UNIQUE("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "community_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"body" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_poll" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"question" text NOT NULL,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_poll_option" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"label" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_poll_vote" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"option_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_poll_vote_unique" UNIQUE("poll_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "community_reaction" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_reaction_unique" UNIQUE("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "inspire_like" (
	"id" text PRIMARY KEY NOT NULL,
	"inspire_post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inspire_like_unique" UNIQUE("inspire_post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "inspire_post" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'daily' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author_id" text,
	"featured" boolean DEFAULT false NOT NULL,
	"scheduled_for" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follow" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_follow_unique" UNIQUE("follower_id","following_id")
);
--> statement-breakpoint
ALTER TABLE "blog_comment" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "community_post" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "community_post" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "community_post" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "community_post" ADD COLUMN "is_poll" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "community_post" ADD COLUMN "pinned_at" timestamp;--> statement-breakpoint
ALTER TABLE "community_post" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_bookmark" ADD CONSTRAINT "blog_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_like" ADD CONSTRAINT "blog_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_reaction" ADD CONSTRAINT "blog_reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_post_id_community_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_parent_id_community_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_poll" ADD CONSTRAINT "community_poll_post_id_community_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_poll_option" ADD CONSTRAINT "community_poll_option_poll_id_community_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."community_poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_poll_vote" ADD CONSTRAINT "community_poll_vote_poll_id_community_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."community_poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_poll_vote" ADD CONSTRAINT "community_poll_vote_option_id_community_poll_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."community_poll_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_poll_vote" ADD CONSTRAINT "community_poll_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reaction" ADD CONSTRAINT "community_reaction_post_id_community_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reaction" ADD CONSTRAINT "community_reaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspire_like" ADD CONSTRAINT "inspire_like_inspire_post_id_inspire_post_id_fk" FOREIGN KEY ("inspire_post_id") REFERENCES "public"."inspire_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspire_like" ADD CONSTRAINT "inspire_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspire_post" ADD CONSTRAINT "inspire_post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follow" ADD CONSTRAINT "user_follow_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follow" ADD CONSTRAINT "user_follow_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_parent_id_blog_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_comment"("id") ON DELETE cascade ON UPDATE no action;