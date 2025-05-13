CREATE TYPE "public"."event_type" AS ENUM('in', 'out', 'moved');--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"data" "bytea" NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"event_type" "event_type" NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"weight" real
);
--> statement-breakpoint
CREATE TABLE "item_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"expire_at" timestamp,
	"original_weight" real,
	"current_weight" real,
	"item_type_id" integer,
	"is_present" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"image_id" integer
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"uid" varchar(32) NOT NULL,
	"item_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"attached_at" timestamp,
	CONSTRAINT "tags_uid_unique" UNIQUE("uid"),
	CONSTRAINT "uid_is_lower_hex" CHECK ("tags"."uid" ~ '^[0-9a-f]+$')
);
--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_item_type_id_item_types_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "public"."item_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_nonnull_item_id" ON "tags" USING btree ("item_id") WHERE "tags"."item_id" IS NOT NULL;