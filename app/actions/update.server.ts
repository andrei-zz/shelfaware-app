import { eq, sql } from "drizzle-orm";
import { db } from "~/database/db.server";
import {
  type InsertItems,
  type InsertTags,
  items,
  tags,
} from "~/database/schema";

// Only fields that update only the items table are allowed here
export const updateItem = async (
  itemId: number,
  data: Partial<
    Omit<
      InsertItems,
      | "id"
      | "createdAt"
      | "deletedAt"
      | "updatedAt"
      | "originalWeight"
      | "currentWeight"
      | "isPresent"
    >
  >
) =>
  await db
    .update(items)
    .set({
      ...data,
      updatedAt: sql`now()`,
    })
    .where(eq(items.id, itemId))
    .returning();

export const updateTag = async (
  tagId: number,
  data: Partial<Omit<InsertTags, "id" | "uid" | "createdAt">>
) => {
  const existing = await db
    .select({ itemId: tags.itemId })
    .from(tags)
    .where(eq(tags.id, tagId))
    .then((rows) => rows[0]);

  if (!existing) {
    throw new Error(`Tag with id ${tagId} not found`);
  }

  let attachedAt;
  if (existing.itemId !== data.itemId) {
    if (data.itemId == null) {
      attachedAt = null;
    } else {
      attachedAt = sql`now()`;

      // Update new item
      await db
        .update(items)
        .set({ updatedAt: sql`now()` })
        .where(eq(items.id, data.itemId));
    }

    // Update old item
    if (existing.itemId != null) {
      await db
        .update(items)
        .set({ updatedAt: sql`now()` })
        .where(eq(items.id, existing.itemId));
    }
  }

  return await db
    .update(tags)
    .set({
      ...data,
      ...(attachedAt !== undefined ? { attachedAt } : {}),
    })
    .where(eq(tags.id, tagId))
    .returning();
};
