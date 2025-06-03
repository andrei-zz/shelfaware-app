import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { db } from "~/database/db.server";
import {
  uidSchema,
  items,
  itemTypes,
  itemEvents,
  tags,
  images,
} from "~/database/schema";
import { updateItem } from "./update.server";
import type { DrizzleTx } from "./drizzle-utils";

export const createItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const createItem = async (
  // Exclude the id and timestamps
  data: z.infer<typeof createItemSchema>,
  tx?: typeof db | DrizzleTx
) => {
  const database = tx ?? db;

  if (data.currentWeight == null) {
    data.currentWeight = data.originalWeight;
  }

  if (data.originalWeight != null && data.originalWeight < 0) {
    data.originalWeight = null;
  }
  if (data.currentWeight != null && data.currentWeight < 0) {
    data.currentWeight = null;
  }

  const createdItems = await database.insert(items).values(data).returning();
  if (createdItems.length !== 1) {
    throw new Error("Created != 1 items");
  }
  return createdItems[0];
};

export const createItemTypeSchema = createInsertSchema(itemTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const createItemType = async (
  data: z.infer<typeof createItemTypeSchema>
) => {
  const createdItemTypes = await db.insert(itemTypes).values(data).returning();
  if (createdItemTypes.length !== 1) {
    throw new Error("Created != 1 item types");
  }
  return createdItemTypes[0];
};

export const createItemEventSchema = createInsertSchema(itemEvents).omit({
  id: true,
  timestamp: true,
});
export const createItemEvent = async (
  data: z.infer<typeof createItemEventSchema>
) =>
  await db.transaction(async (tx) => {
    if (data.weight != null && data.weight < 0) {
      data.weight = undefined;
    }

    // Always insert the event
    const createdEvents = await tx.insert(itemEvents).values(data).returning();
    if (createdEvents.length !== 1) {
      throw new Error("Created != 1 item events");
    }
    const event = createdEvents[0];

    const updates: Record<string, unknown> = {};

    if (data.eventType === "in") {
      updates.isPresent = true;
      updates.updatedAt = sql`now()`;
    }

    if (data.eventType === "out") {
      updates.isPresent = false;
      updates.updatedAt = sql`now()`;
    }

    if (data.weight != null) {
      updates.currentWeight = data.weight;
      updates.updatedAt = sql`now()`;
    }

    if (data.plate != null) {
      updates.plate = data.plate;
      updates.updatedAt = sql`now()`;
    }
    if (data.row != null) {
      updates.row = data.row;
      updates.updatedAt = sql`now()`;
    }
    if (data.col != null) {
      updates.col = data.col;
      updates.updatedAt = sql`now()`;
    }

    if (Object.keys(updates).length > 0) {
      await updateItem({ id: data.itemId, ...updates }, tx);
    }

    return event;
  });

export const createTagSchema = createInsertSchema(tags)
  .omit({
    id: true,
    createdAt: true,
    attachedAt: true,
    updatedAt: true,
  })
  .extend({
    uid: uidSchema,
  });
const createTagHelper = async (
  data: z.infer<typeof createTagSchema>,
  tx?: typeof db | DrizzleTx
) => {
  const database = tx ?? db;

  const attachedAt = data.itemId != null ? sql`now()` : null;

  if (data.itemId != null) {
    await Promise.all([
      database
        .update(tags)
        .set({ itemId: null, attachedAt: null, updatedAt: sql`now()` })
        .where(eq(tags.itemId, data.itemId)),

      updateItem({ id: data.itemId }, tx),
    ]);
  }

  const createdTags = await database
    .insert(tags)
    .values({ ...data, attachedAt, updatedAt: sql`now()` })
    .returning();
  if (createdTags.length !== 1) {
    throw new Error("Created != 1 tags");
  }
  return createdTags[0];
};
export const createTag = async (data: z.infer<typeof createTagSchema>) => {
  return await db.transaction(async (tx) => createTagHelper(data, tx));
};

export const createItemAndTagByUidSchema = createItemEventSchema
  .omit({ itemId: true })
  .extend({ uid: uidSchema });
export const createItemAndTagByUid = async (
  data: z.infer<typeof createItemAndTagByUidSchema>
) => {
  return await db.transaction(async (tx) => {
    if (data.weight != null && data.weight < 0) {
      data.weight = null;
    }

    const item = await createItem(
      {
        name: `Item ${data.uid}`,
        originalWeight: data.weight,
        isPresent: data.eventType === "in" || data.eventType === "moved",
      },
      tx
    );

    const tag = await createTagHelper(
      {
        name: `Tag ${data.uid}`,
        uid: data.uid,
        itemId: item.id,
      },
      tx
    );

    return { item, tag };
  });
};

export const createImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
  replacedAt: true,
});
export const createImage = async (
  data: z.infer<typeof createImageSchema>,
  tx?: typeof db | DrizzleTx
) => {
  const database = tx ?? db;

  const createdImages = await database.insert(images).values(data).returning();
  if (createdImages.length !== 1) {
    throw new Error("Created != 1 images");
  }
  return createdImages[0];
};
