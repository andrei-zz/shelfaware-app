import { eq, sql } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "~/database/db.server";
import { images, items, tags } from "~/database/schema";

export const updateItemSchema = createUpdateSchema(items)
  .omit({
    createdAt: true,
    deletedAt: true,
    updatedAt: true,
  })
  .partial()
  .required({ id: true });
// Only fields that update only the items table are allowed here
export const updateItem = async ({
  id,
  ...data
}: z.infer<typeof updateItemSchema>) =>
  id == null
    ? null
    : await db
        .update(items)
        .set({
          ...data,
          updatedAt: sql`now()`,
        })
        .where(eq(items.id, id))
        .returning()
        .then((value) => value[0]);

export const updateTagSchema = createUpdateSchema(tags)
  .omit({
    createdAt: true,
    attachedAt: true,
  })
  .partial();
export const updateTag = async ({
  id,
  uid,
  ...data
}: z.infer<typeof updateTagSchema>) => {
  const condition =
    id != null ? eq(tags.id, id) : uid != null ? eq(tags.uid, uid) : undefined;

  if (!condition) {
    return null;
  }

  const existing = await db
    .select({ itemId: tags.itemId })
    .from(tags)
    .where(condition)
    .then((rows) => rows[0]);

  if (!existing) {
    throw new Error(`Tag with id ${id} not found`);
  }

  let attachedAt;
  if (existing.itemId !== data.itemId) {
    if (data.itemId != null) {
      await db
        .update(tags)
        .set({ itemId: null, attachedAt: null })
        .where(eq(tags.itemId, data.itemId));
    }

    // Update old item
    if (existing.itemId != null) {
      await db
        .update(items)
        .set({ updatedAt: sql`now()` })
        .where(eq(items.id, existing.itemId));
    }

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
  }

  return await db
    .update(tags)
    .set({
      ...data,
      ...(attachedAt == null ? {} : { attachedAt }),
    })
    .where(condition)
    .returning()
    .then((value) => value[0]);
};

export const updateImageSchema = createUpdateSchema(images)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .required({ id: true });
export const updateImage = async ({
  id,
  ...data
}: z.infer<typeof updateImageSchema>) =>
  id == null
    ? null
    : await db
        .update(images)
        .set(data)
        .where(eq(images.id, id))
        .returning()
        .then((value) => value[0]);
