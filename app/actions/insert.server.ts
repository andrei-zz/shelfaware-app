import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "~/database/db.server";
import { items, itemTypes, itemEvents, tags, images } from "~/database/schema";

export const createItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const createItem = async (
  // Exclude the id and timestamps
  data: z.infer<typeof createItemSchema>
) => {
  if (data.originalWeight != null && data.currentWeight == null) {
    data.currentWeight = data.originalWeight;
  }

  return await db
    .insert(items)
    .values(data)
    .returning()
    .then((value) => value[0]);
};

export const createItemTypeSchema = createInsertSchema(itemTypes).omit({
  id: true,
});
export const createItemType = async (
  data: z.infer<typeof createItemTypeSchema>
) =>
  await db
    .insert(itemTypes)
    .values(data)
    .returning()
    .then((value) => value[0]);

export const createItemEventSchema = createInsertSchema(itemEvents).omit({
  id: true,
  timestamp: true,
});
export const createItemEvent = async (
  data: z.infer<typeof createItemEventSchema>
) => {
  // Always insert the event
  const [event] = await db.insert(itemEvents).values(data).returning();

  const updates: Record<string, unknown> = {};

  if (data.eventType === "in") {
    updates.isPresent = true;
    updates.updatedAt = sql`now()`;
    if (data.weight != null) {
      updates.currentWeight = data.weight;
    }
  }

  if (data.eventType === "out") {
    updates.isPresent = false;
    updates.updatedAt = sql`now()`;
    if (data.weight != null) {
      updates.currentWeight = data.weight;
    }
  }

  if (data.eventType === "moved" && data.weight != null) {
    updates.currentWeight = data.weight;
    updates.updatedAt = sql`now()`;
  }

  if (Object.keys(updates).length > 0) {
    await db.update(items).set(updates).where(eq(items.id, data.itemId));
  }

  return event;
};

export const createTagSchema = createInsertSchema(tags)
  .omit({
    id: true,
    createdAt: true,
    attachedAt: true,
  })
  .extend({
    uid: z.string().regex(/^[0-9a-f]+$/, {
      message: "UID must be lowercase hex (0-9, a-f only)",
    }),
  });
export const createTag = async (data: z.infer<typeof createTagSchema>) => {
  const attachedAt = data.itemId != null ? sql`now()` : null;

  if (data.itemId != null) {
    await db
      .update(items)
      .set({ updatedAt: sql`now()` })
      .where(eq(items.id, data.itemId));
  }

  return await db
    .insert(tags)
    .values({ ...data, attachedAt })
    .returning()
    .then((value) => value[0]);
};

export const createImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});
export const createImage = async (data: z.infer<typeof createImageSchema>) =>
  await db
    .insert(images)
    .values(data)
    .returning()
    .then((value) => value[0]);
