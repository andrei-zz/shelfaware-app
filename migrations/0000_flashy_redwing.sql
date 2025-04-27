CREATE TABLE "item_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"event_type" varchar(10) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
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
	"image_base64" text,
	"original_weight" real,
	"current_weight" real,
	"age" integer,
	"item_type_id" integer,
	"is_present" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"uid" varchar(32) NOT NULL,
	"item_id" integer,
	"attached_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "item_events" ADD CONSTRAINT "item_events_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_item_type_id_item_types_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "public"."item_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;