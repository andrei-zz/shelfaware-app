import { eq, sql } from "drizzle-orm";
import { db } from "~/database/db.server";
import {
  type InsertItems,
  type InsertItemTypes,
  type InsertItemEvents,
  type InsertTags,
  items,
  itemTypes,
  itemEvents,
  tags,
} from "~/database/schema";

export const createItem = async (
  // Exclude the id and timestamps
  data: Omit<InsertItems, "id" | "createdAt" | "updatedAt" | "deletedAt">
) => await db.insert(items).values(data).returning();

export const createItemType = async (data: Omit<InsertItemTypes, "id">) =>
  await db.insert(itemTypes).values(data).returning();

export const createItemEvent = async (
  data: Omit<InsertItemEvents, "id" | "timestamp">
) => {
  // Always insert the event
  const [event] = await db.insert(itemEvents).values(data).returning();

  const updates: Record<string, unknown> = {};

  if (data.eventType === "in") {
    updates.isPresent = true;
    updates.updatedAt = sql`now()`;
    if (data.weight != null) updates.currentWeight = data.weight;
  }

  if (data.eventType === "out") {
    updates.isPresent = false;
    updates.updatedAt = sql`now()`;
    if (data.weight != null) updates.currentWeight = data.weight;
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

export const createTag = async (
  data: Omit<InsertTags, "id" | "createdAt" | "attachedAt">
) => {
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
    .returning();
};
