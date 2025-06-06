CREATE TYPE "public"."image_type" AS ENUM('item', 'item_event', 'avatar');--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "type" "image_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_image_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_image_id_images_id_fk" FOREIGN KEY ("avatar_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "avatar";