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
  data: Omit<InsertItems, "id" | "createdAt" | "updatedAt" | "deletedAt">
) => await db.insert(items).values(data).returning();

export const createItemType = async (data: Omit<InsertItemTypes, "id">) =>
  await db.insert(itemTypes).values(data).returning();

export const createItemEvent = async (data: Omit<InsertItemEvents, "id">) =>
  await db.insert(itemEvents).values(data).returning();

export const createTag = async (
  data: Omit<InsertTags, "id" | "createdAt" | "attachedAt">
) => await db.insert(tags).values(data).returning();
