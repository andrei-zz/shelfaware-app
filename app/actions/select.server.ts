import { and, asc, eq, gte, inArray, lt, lte } from "drizzle-orm";
import { db } from "~/database/db.server";
import {
  type SelectItemTypes,
  items,
  itemTypes,
  itemEvents,
  tags,
} from "~/database/schema";

// items

// Get (almost) full item data by item id
export const getItemFromId = async (itemId: number) =>
  await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      type: true,
      tag: true,
    },
  });

// Get (almost) full item data from tag id
export const getItemFromTagId = async (tagId: number) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
        },
      },
    },
  });
  return tag?.item;
};

// Get (almost) full item data from tag UID
export const getItemFromUid = async (uid: string) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.uid, uid),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
        },
      },
    },
  });
  return tag?.item;
};

// List of currently present items, sorted by updatedAt (ascending)
export const getCurrentItems = async () =>
  await db.query.items.findMany({
    where: eq(items.isPresent, true),
    with: {
      type: true,
      tag: true,
    },
    orderBy: asc(items.updatedAt),
  });

// List of items at a specific time
export const getItemsAtTime = async (timestamp: number) => {
  // Get all item events up to targetTime
  const events = await db
    .select()
    .from(itemEvents)
    .where(lt(itemEvents.timestamp, timestamp))
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

  const itemsAtTime = await db.query.items.findMany({
    where: inArray(items.id, presentItemIds),
    with: {
      type: true,
      tag: true,
    },
    orderBy: asc(items.updatedAt),
  });

  return itemsAtTime;
};

// itemTypes

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

// itemEvents

// Get all item events, optionally between start and end
export const getItemEvents = async (start?: number, end?: number) => {
  let conditions = [];
  if (start != null) {
    conditions.push(gte(itemEvents.timestamp, start));
  }
  if (end != null) {
    conditions.push(lte(itemEvents.timestamp, end));
  }

  return await db.query.itemEvents.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      item: true,
    },
    orderBy: asc(itemEvents.timestamp),
  });
};

// Get all events for a specific item
export const getItemEventsOf = async (itemId: number) =>
  await db
    .select()
    .from(itemEvents)
    .where(eq(itemEvents.itemId, itemId))
    .orderBy(asc(itemEvents.timestamp));

// tags

export const getAllTags = async () =>
  await db.query.tags.findMany({
    with: {
      item: true,
    },
    orderBy: asc(tags.createdAt),
  });

export const getTagById = async (tagId: number) =>
  await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          type: true,
        },
      },
    },
  });

export const getTagByUid = async (uid: string) =>
  await db.query.tags.findFirst({
    where: eq(tags.uid, uid),
    with: {
      item: {
        with: {
          type: true,
        },
      },
    },
  });
