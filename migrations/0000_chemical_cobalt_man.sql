CREATE TYPE "public"."event_type" AS ENUM('in', 'out', 'moved');--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"s3_key" uuid NOT NULL,
	"title" text,
	"description" text,
	"mime_type" text NOT NULL,
	"replaced_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"replaced_at" timestamp,
	CONSTRAINT "images_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
CREATE TABLE "item_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"event_type" "event_type" NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"weight" real,
	"floor" integer,
	"row" integer,
	"col" integer,
	"image_id" integer
);
--> statement-breakpoint
CREATE TABLE "item_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "item_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"item_type_id" integer,
	"description" text,
	"expire_at" timestamp,
	"original_weight" real,
	"current_weight" real,
	"image_id" integer,
	"is_present" boolean DEFAULT true,
	"floor" integer,
	"row" integer,
	"col" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "check_current_weight" CHECK ("items"."current_weight" >= 0)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"uid" varchar(32) NOT NULL,
	"item_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"attached_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_uid_unique" UNIQUE("uid"),
	CONSTRAINT "uid_is_lower_hex" CHECK ("tags"."uid" ~ '^[0-9a-f]+$')
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_replaced_by_id_images_id_fk" FOREIGN KEY ("replaced_by_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_item_type_id_item_types_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "public"."item_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_images_replaced_by_id" ON "images" USING btree ("replaced_by_id");--> statement-breakpoint
CREATE INDEX "idx_item_events_item_id" ON "item_events" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_item_events_timestamp" ON "item_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_item_events_item_id_timestamp" ON "item_events" USING btree ("item_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_items_is_present_updated_at" ON "items" USING btree ("is_present","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_nonnull_item_id" ON "tags" USING btree ("item_id") WHERE "tags"."item_id" IS NOT NULL;