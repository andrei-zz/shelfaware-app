CREATE TYPE "public"."event_type" AS ENUM('in', 'out', 'moved');--> statement-breakpoint
ALTER TABLE "item_events" ALTER COLUMN "event_type" SET DATA TYPE "public"."event_type" USING "event_type"::"public"."event_type";--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "expiration_date" timestamp;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN "age";