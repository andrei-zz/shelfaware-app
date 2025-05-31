import { type SQL, type SQLWrapper, and, eq, sql } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { db } from "~/database/db.server";
import {
  images,
  itemEvents,
  items,
  itemTypes,
  tags,
  uidSchema,
} from "~/database/schema";
import { createImage } from "./insert.server";
import { getTags } from "./select.server";
import type { DrizzleTx } from "./drizzle-utils";

export const updateItemSchema = createUpdateSchema(items)
  .omit({
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .partial()
  .required({ id: true });
// Only fields that update only the items table are allowed here
export const updateItem = async (
  { id, ...data }: z.infer<typeof updateItemSchema>,
  tx?: typeof db | DrizzleTx
) => {
  const database = tx ?? db;

  if (data.originalWeight != null && data.originalWeight < 0) {
    data.originalWeight = null;
  }
  if (data.currentWeight != null && data.currentWeight < 0) {
    data.currentWeight = null;
  }

  const updatedItems = await database
    .update(items)
    .set({
      ...data,
      updatedAt: sql`now()`,
    })
    .where(eq(items.id, id))
    .returning();
  if (updatedItems.length !== 1) {
    throw new Error("Updated != 1 items");
  }
  return updatedItems[0];
};

const updateItemsSchema = createUpdateSchema(items)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .partial();
export const updateItems = async (
  data: z.infer<typeof updateItemsSchema>,
  conditions: [SQLWrapper, ...SQLWrapper[]],
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

  return await database
    .update(items)
    .set({
      ...data,
      updatedAt: sql`now()`,
    })
    .where(
      conditions?.length != null && conditions.length > 0
        ? and(...conditions)
        : undefined
    )
    .returning();
};

export const updateItemTypeSchema = createUpdateSchema(itemTypes)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({ id: true });
export const updateItemType = async ({
  id,
  ...data
}: z.infer<typeof updateItemTypeSchema>) => {
  return await db
    .update(itemTypes)
    .set({
      ...data,
      updatedAt: sql`now()`,
    })
    .where(eq(itemTypes.id, id))
    .returning()
    .then((value) => value[0]);
};

export const updateTagSchema = createUpdateSchema(tags)
  .omit({
    createdAt: true,
    attachedAt: true,
    updatedAt: true,
  })
  .extend({ uid: uidSchema.optional() })
  .partial();
export const updateTagHelper = async (
  { id, uid, ...data }: z.infer<typeof updateTagSchema>,
  tx?: typeof db | DrizzleTx
) => {
  const database = tx ?? db;

  const condition =
    id != null ? eq(tags.id, id) : uid != null ? eq(tags.uid, uid) : undefined;

  if (!condition) {
    throw new Error("Either id or uid must be provided");
  }

  const [existing] = await getTags(
    [condition],
    undefined,
    { itemId: true },
    database
  );

  if (!existing) {
    throw new Error(
      `Tag${
        id != null ? ` with id: #${id}` : uid != null ? ` with uid: ${uid}` : ""
      } not found`
    );
  }

  let attachedAt: SQL<"now()"> | undefined = undefined;
  if (existing.itemId !== data.itemId) {
    if (data.itemId != null) {
      await database
        .update(tags)
        .set({ itemId: null, attachedAt: null, updatedAt: sql`now()` })
        .where(eq(tags.itemId, data.itemId));
    }

    // Update old item
    if (existing.itemId != null) {
      await updateItem({ id: existing.itemId }, database);
    }

    if (data.itemId == null) {
      attachedAt = undefined;
    } else {
      attachedAt = sql`now()`;

      // Update new item
      await updateItem({ id: data.itemId }, database);
    }
  }

  return await database
    .update(tags)
    .set({
      ...data,
      attachedAt,
      updatedAt: sql`now()`,
    })
    .where(condition)
    .returning()
    .then((value) => value[0]);
};
export const updateTag = async (
  data: z.infer<typeof updateTagSchema>,
  tx?: typeof db | DrizzleTx
) => await db.transaction(async (tx) => updateTagHelper(data, tx));

export const updateImageSchema = createUpdateSchema(images)
  .omit({
    s3Key: true,
    createdAt: true,
    replacedAt: true,
  })
  .partial()
  .required({ id: true });
export const updateImage = async ({
  id,
  ...data
}: z.infer<typeof updateImageSchema>) =>
  await db
    .update(images)
    .set(data)
    .where(eq(images.id, id))
    .returning()
    .then((value) => {
      const { s3Key, ...image } = value[0];
      return image;
    });

export const replaceImageSchema = createUpdateSchema(images)
  .omit({
    createdAt: true,
    replacedAt: true,
  })
  .required({ id: true, s3Key: true, mimeType: true });
export const replaceImage = async ({
  id,
  ...data
}: z.infer<typeof replaceImageSchema>) => {
  return await db.transaction(async (tx) => {
    const { s3Key: _s3Key, mimeType: _mimeType, ...updateImageData } = data;
    const newImage = await createImage(data, tx);

    await Promise.all([
      tx
        .update(images)
        .set({
          ...updateImageData,
          replacedById: newImage.id,
          replacedAt: sql`now()`,
        })
        .where(eq(images.id, id)),

      // db.update(items).set({ imageId: newImage.id }).where(eq(items.imageId, id)),
      updateItems({ imageId: newImage.id }, [eq(items.imageId, id)], tx),

      tx
        .update(itemEvents)
        .set({ imageId: newImage.id })
        .where(eq(itemEvents.imageId, id)),
    ]);

    return newImage;
  });
};
