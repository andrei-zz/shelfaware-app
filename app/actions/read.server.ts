import { asc, eq, inArray, lt } from "drizzle-orm";
import { db } from "~/../server/db";
import {
  type SelectItemTypes,
  items,
  itemTypes,
  itemEvents,
  tags,
} from "~/../database/schema";

// Build full type hierarchy
export const getAllItemTypes = async () => {
  const types = await db.select().from(itemTypes).orderBy(asc(itemTypes.id));

  // Build a tree (basic version)
  type ItemTypes = SelectItemTypes & { children: ItemTypes[] };
  const typeMap = new Map<number, ItemTypes>();
  const roots: ItemTypes[] = [];

  types.forEach((type) => {
    typeMap.set(type.id, { ...type, children: [] });
  });

  typeMap.forEach((type) => {
    if (type.parentId !== null) {
      const parent = typeMap.get(type.parentId);
      parent?.children.push(type);
    } else {
      roots.push(type);
    }
  });

  return roots;
};

// Get full item data by item id
export const getItemFromId = async (itemId: number) =>
  await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      tags: true,
    },
  });

// Get full item data from tag id
export const getItemFromTagId = async (tagId: number) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          tags: true,
        },
      },
    },
  });
  return tag?.item;
};

// Get full item data from tag UID
export const getItemFromUid = async (uid: string) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.uid, uid),
    with: {
      item: {
        with: {
          tags: true,
        },
      },
    },
  });
  return tag?.item;
};

// List of currently present items, sorted by updatedAt (ascending)
export const getCurrentItems = async () =>
  await db
    .select()
    .from(items)
    .where(eq(items.isPresent, true))
    .orderBy(asc(items.updatedAt));

// List of items at a specific time
export const getItemsAtTime = async (targetTime: Date) => {
  // Get all item events up to targetTime
  const events = await db
    .select()
    .from(itemEvents)
    .where(lt(itemEvents.timestamp, targetTime))
    .orderBy(asc(itemEvents.timestamp));

  // Build item presence map
  const itemPresence = new Map<
    number,
    { isPresent: boolean; weight: number | null }
  >();

  for (const event of events) {
    if (event.eventType === "in" || event.eventType === "moved") {
      itemPresence.set(event.itemId, { isPresent: true, weight: event.weight });
    }
    if (event.eventType === "out") {
      itemPresence.set(event.itemId, {
        isPresent: false,
        weight: event.weight,
      });
    }
  }

  // Return items that were present
  const presentItemIds = Array.from(itemPresence.entries())
    .filter(([, data]) => data.isPresent)
    .map(([itemId]) => itemId);

  const itemsAtTime = await db
    .select()
    .from(items)
    .where(inArray(items.id, presentItemIds))
    .orderBy(asc(items.updatedAt));

  return itemsAtTime;
};

// Get all item events, optionally before a certain time
export const getItemEvents = async (until?: Date) => {
  const query = db.select().from(itemEvents).orderBy(asc(itemEvents.timestamp));
  if (until) {
    query.where(lt(itemEvents.timestamp, until));
  }
  return await query;
};

// Get all events for a specific item
export const getItemEventsOf = async (itemId: number) =>
  await db
    .select()
    .from(itemEvents)
    .where(eq(itemEvents.itemId, itemId))
    .orderBy(asc(itemEvents.timestamp));

export const getAllTags = async () =>
  await db.select().from(tags).orderBy(asc(tags.createdAt));

export const getTagById = async (tagId: number) =>
  await db
    .select()
    .from(tags)
    .where(eq(tags.id, tagId))
    .then((rows) => rows[0] ?? null);

export const getTagByUid = async (uid: string) =>
  await db
    .select()
    .from(tags)
    .where(eq(tags.uid, uid))
    .then((rows) => rows[0] ?? null);
