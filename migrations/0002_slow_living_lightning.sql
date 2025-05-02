ALTER TABLE "items" RENAME COLUMN "expiration_date" TO "expire_at";--> statement-breakpoint
ALTER TABLE "item_events" DROP CONSTRAINT "item_events_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "items" DROP CONSTRAINT "items_item_type_id_item_types_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "item_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_item_id_unique" UNIQUE("item_id");