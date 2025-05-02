ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_item_id_unique";--> statement-breakpoint
ALTER TABLE "item_events" ALTER COLUMN "timestamp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "attached_at" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_nonnull_item_id" ON "tags" USING btree ("item_id") WHERE "tags"."item_id" IS NOT NULL;