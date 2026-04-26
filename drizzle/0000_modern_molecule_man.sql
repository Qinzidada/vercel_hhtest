CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenario" text NOT NULL,
	"final_score" integer NOT NULL,
	"result" text NOT NULL,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_check" (
	"id" serial NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "game_records" ADD CONSTRAINT "game_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "game_records_user_id_idx" ON "game_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_records_played_at_idx" ON "game_records" USING btree ("played_at");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");