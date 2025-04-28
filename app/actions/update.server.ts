import { eq, sql } from "drizzle-orm";
import { db } from "~/../server/db";
import {
  type InsertItems,
  type InsertTags,
  items,
  tags,
} from "~/../database/schema";

export const updateItem = async (
  itemId: number,
  data: Partial<
    Omit<InsertItems, "id" | "createdAt" | "deletedAt" | "updatedAt">
  >
) =>
  await db
    .update(items)
    .set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(items.id, itemId))
    .returning();

// Update item weight (e.g., after partial consumption)
export const updateItemWeight = async (itemId: number, newWeight: number) =>
  await db
    .update(items)
    .set({ currentWeight: newWeight, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(items.id, itemId))
    .returning();

export const updateTag = async (
  tagId: number,
  data: Partial<Omit<InsertTags, "id" | "uid" | "createdAt" | "attachedAt">>
) => await db.update(tags).set(data).where(eq(tags.id, tagId)).returning();

// Attach an existing tag to an item
export const attachTagToItem = async (tagUid: string, itemId: number) =>
  await db
    .update(tags)
    .set({ itemId, attachedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(tags.uid, tagUid))
    .returning();

// Detach a tag (set itemId to NULL)
export const detachTag = async (tagUid: string) =>
  await db
    .update(tags)
    .set({ itemId: null })
    .where(eq(tags.uid, tagUid))
    .returning();
