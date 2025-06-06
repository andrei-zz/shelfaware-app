import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  customType,
  serial,
  text,
  integer,
  real,
  boolean,
  varchar,
  uniqueIndex,
  index,
  check,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { DateTime } from "luxon";
import { z } from "zod/v4";

// Types

const unixTimestamp = customType<{
  data: number;
  driverData: Date | string;
  columnType: "timestamp";
}>({
  dataType() {
    return "timestamp";
  },
  fromDriver(value) {
    if (typeof value === "string") {
      return DateTime.fromSQL(value, { zone: "utc" }).toMillis();
    } else {
      return value?.getTime();
    }
  },
  toDriver(value) {
    return new Date(value ?? "");
  },
});

const bytea = customType<{
  data: Buffer;
  driverData: Buffer;
  columnType: "bytea";
}>({
  dataType: () => "bytea",
  toDriver: (value) => Buffer.from(value),
  fromDriver: (value) => Buffer.from(value),
});

export const uidSchema = z.string().regex(/^[0-9a-f]+$/, {
  message: "UID must be lowercase hex (0-9, a-f only)",
});

// Tables and relations

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    itemTypeId: integer("item_type_id").references(() => itemTypes.id, {
      onDelete: "set null",
    }),
    description: text("description"),
    expireAt: unixTimestamp("expire_at"),
    originalWeight: real("original_weight"),
    currentWeight: real("current_weight"),
    imageId: integer("image_id").references(() => images.id, {
      onDelete: "set null",
    }),
    isPresent: boolean("is_present").default(true),
    plate: integer("plate"),
    row: integer("row"),
    col: integer("col"),
    createdAt: unixTimestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: unixTimestamp("updated_at")
      .notNull()
      .default(sql`now()`),
    deletedAt: unixTimestamp("deleted_at"),
  },
  (table) => [
    check("check_current_weight", sql`${table.currentWeight} >= 0`),
    index("idx_items_is_present_updated_at").on(
      table.isPresent,
      table.updatedAt
    ),
  ]
);

export const itemsRelations = relations(items, ({ one, many }) => ({
  type: one(itemTypes, {
    fields: [items.itemTypeId],
    references: [itemTypes.id],
  }),
  events: many(itemEvents),
  tag: one(tags),
  image: one(images, {
    fields: [items.imageId],
    references: [images.id],
  }),
}));

export const itemTypes = pgTable("item_types", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description"),
  createdAt: unixTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: unixTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const itemTypesRelations = relations(itemTypes, ({ many }) => ({
  items: many(items),
}));

export const eventTypeEnum = pgEnum("event_type", ["in", "out", "moved"]);

export const itemEvents = pgTable(
  "item_events",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    eventType: eventTypeEnum("event_type").notNull(),
    timestamp: unixTimestamp("timestamp")
      .notNull()
      .default(sql`now()`),
    weight: real("weight"),
    plate: integer("plate"),
    row: integer("row"),
    col: integer("col"),
    imageId: integer("image_id").references(() => images.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("idx_item_events_item_id").on(table.itemId),
    index("idx_item_events_timestamp").on(table.timestamp),
    index("idx_item_events_item_id_timestamp").on(
      table.itemId,
      table.timestamp
    ),
  ]
);

export const itemEventsRelations = relations(itemEvents, ({ one }) => ({
  item: one(items, {
    fields: [itemEvents.itemId],
    references: [items.id],
  }),
  image: one(images, {
    fields: [itemEvents.imageId],
    references: [images.id],
  }),
}));

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    uid: varchar("uid", { length: 32 }).notNull().unique(),
    itemId: integer("item_id").references(() => items.id, {
      onDelete: "set null",
    }),
    createdAt: unixTimestamp("created_at")
      .notNull()
      .default(sql`now()`),
    attachedAt: unixTimestamp("attached_at"),
    updatedAt: unixTimestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    check("uid_is_lower_hex", sql`${table.uid} ~ '^[0-9a-f]+$'`),
    uniqueIndex("unique_nonnull_item_id")
      .on(table.itemId)
      .where(sql`${table.itemId} IS NOT NULL`),
  ]
);

export const tagsRelations = relations(tags, ({ one }) => ({
  item: one(items, {
    fields: [tags.itemId],
    references: [items.id],
  }),
}));

export const images = pgTable(
  "images",
  {
    id: serial("id").primaryKey(),
    s3Key: uuid("s3_key").unique().notNull(),
    title: text("title"),
    description: text("description"),
    mimeType: text("mime_type").notNull(),
    replacedById: integer("replaced_by_id").references(
      (): AnyPgColumn => images.id,
      {
        onDelete: "set null",
      }
    ),
    createdAt: unixTimestamp("created_at")
      .notNull()
      .default(sql`now()`),
    replacedAt: unixTimestamp("replaced_at"),
  },
  (table) => [index("idx_images_replaced_by_id").on(table.replacedById)]
);

export const imagesRelations = relations(images, ({ one, many }) => ({
  replacedBy: one(images, {
    fields: [images.replacedById],
    references: [images.id],
  }),
  items: many(items),
  itemEvents: many(itemEvents),
}));
