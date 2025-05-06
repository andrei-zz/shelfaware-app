import {
  type SQLWrapper,
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lt,
  lte,
  SQL,
} from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { db } from "~/database/db.server";
import { items, itemTypes, itemEvents, tags, images } from "~/database/schema";

// items

// Get (almost) full item data by item id
export const getItem = async (itemId: number) =>
  await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      type: true,
      tag: true,
      image: true,
    },
  });

// export const getItemId = async ({tagId, uid, itemEventId}) => {};

// Get (almost) full item data from tag id
export const getItemByTagId = async (tagId: number) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: true,
        },
      },
    },
  });
  return tag?.item;
};

// Get (almost) full item data from tag UID
export const getItemByUid = async (tagUid: string) => {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.uid, tagUid),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: true,
        },
      },
    },
  });
  return tag?.item;
};

export const getItems = async (conditions?: SQLWrapper[], orderBy?: SQL) =>
  await db.query.items.findMany({
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    with: {
      type: true,
      tag: true,
      image: true,
    },
    orderBy,
  });

export const getRawItems = async (conditions?: SQLWrapper[], orderBy?: SQL) =>
  await db.query.items.findMany({
    where:
      conditions != null && conditions.length > 0
        ? and(...conditions)
        : undefined,
    orderBy,
  });

// List of currently present items, sorted by updatedAt (ascending)
export const getPresentItems = async () =>
  await getItems([eq(items.isPresent, true)], desc(items.updatedAt));

// List of items at a specific time
// Quite expensive to run
export const getPresentItemsAtTime = async (timestamp: number) => {
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

  const itemsAtTime = await getItems(
    [inArray(items.id, presentItemIds)],
    desc(items.updatedAt)
  );

  return itemsAtTime;
};

// itemTypes

const selectItemTypesSchema = createSelectSchema(itemTypes);
export type ItemType = z.infer<typeof selectItemTypesSchema> & {
  children: ItemType[];
};
// Build full type hierarchy
export const getAllItemTypes = async () => {
  const types = await db.select().from(itemTypes).orderBy(asc(itemTypes.id));

  // Build a tree (basic version)
  const typeMap = new Map<number, ItemType>();
  const roots: ItemType[] = [];

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
export const getItemEvents = async (
  start?: number,
  end?: number,
  conditions?: SQLWrapper[]
) => {
  const allConditions: SQLWrapper[] = [];
  if (conditions != null) {
    allConditions.push(...conditions);
  }
  if (start != null) {
    allConditions.push(gte(itemEvents.timestamp, start));
  }
  if (end != null) {
    allConditions.push(lte(itemEvents.timestamp, end));
  }

  return await db.query.itemEvents.findMany({
    where: allConditions.length > 0 ? and(...allConditions) : undefined,
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: true,
        },
      },
    },
    orderBy: desc(itemEvents.timestamp),
  });
};

// Get all events for a specific item
export const getItemEventsOf = async (itemId: number) =>
  await db.query.itemEvents.findMany({
    where: eq(itemEvents.itemId, itemId),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: true,
        },
      },
    },
    orderBy: desc(itemEvents.timestamp),
  });

export const getItemEvent = async (itemEventId: number) =>
  await db.query.itemEvents.findFirst({
    where: eq(itemEvents.id, itemEventId),
    with: {
      item: {
        with: {
          type: true,
          tag: true,
          image: true,
        },
      },
    },
  });

// tags

export const getAllTags = async () =>
  await db.query.tags.findMany({
    with: {
      item: {
        with: {
          type: true,
          image: true,
        },
      },
    },
    orderBy: desc(tags.createdAt),
  });

export const getTag = async (tagId: number) =>
  await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          type: true,
          image: true,
        },
      },
    },
  });

export const getTagByItemId = async (itemId: number) =>
  await db.query.tags.findFirst({
    where: eq(tags.itemId, itemId),
    with: {
      item: {
        with: {
          type: true,
          image: true,
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
          image: true,
        },
      },
    },
  });

// images

export const getImage = async (imageId: number) =>
  await db.query.images.findFirst({
    where: eq(images.id, imageId),
  });

export const getImageByItemId = async (itemId: number) => {
  const itemWithImage = await db.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      image: true,
    },
  });
  return itemWithImage?.image ?? null;
};

export const getImageByTagId = async (tagId: number) => {
  const tagWithItem = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
    with: {
      item: {
        with: {
          image: true,
        },
      },
    },
  });
  return tagWithItem?.item?.image ?? null;
};

export const getImageByUid = async (tagUid: string) => {
  const tagWithItem = await db.query.tags.findFirst({
    where: eq(tags.uid, tagUid),
    with: {
      item: {
        with: {
          image: true,
        },
      },
    },
  });
  return tagWithItem?.item?.image ?? null;
};
