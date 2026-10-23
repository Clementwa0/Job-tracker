DO $$ BEGIN
  CREATE TYPE "public"."resource_type" AS ENUM('article', 'guide', 'template', 'checklist', 'video');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."resource_status" AS ENUM('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resource_categories" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "resource_categories_name_unique" UNIQUE("name"),
  CONSTRAINT "resource_categories_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resources" (
  "id" uuid PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "category_id" uuid NOT NULL,
  "type" "resource_type" DEFAULT 'article' NOT NULL,
  "content" text DEFAULT '' NOT NULL,
  "cover_image" jsonb,
  "attachment" jsonb,
  "external_url" text,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "featured" boolean DEFAULT false NOT NULL,
  "status" "resource_status" DEFAULT 'draft' NOT NULL,
  "views" integer DEFAULT 0 NOT NULL,
  "seo_title" text DEFAULT '' NOT NULL,
  "seo_description" text DEFAULT '' NOT NULL,
  "published_at" timestamp with time zone,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "resources_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resource_bookmarks" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "resource_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "resource_bookmarks_user_resource_unique" UNIQUE("user_id","resource_id")
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "resources" ADD CONSTRAINT "resources_category_id_resource_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."resource_categories"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "resources" ADD CONSTRAINT "resources_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "resource_bookmarks" ADD CONSTRAINT "resource_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "resource_bookmarks" ADD CONSTRAINT "resource_bookmarks_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resource_categories_order_idx" ON "resource_categories" USING btree ("order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resources_status_published_idx" ON "resources" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resources_category_idx" ON "resources" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resources_featured_idx" ON "resources" USING btree ("featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resources_created_at_idx" ON "resources" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resource_bookmarks_user_created_idx" ON "resource_bookmarks" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resource_bookmarks_resource_idx" ON "resource_bookmarks" USING btree ("resource_id");
