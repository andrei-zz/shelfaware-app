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
  check,
} from "drizzle-orm/pg-core";
import type { Resolved } from "~/lib/types";

// Types

const unixTimestamp = customType<{
  data: number | null;
  driverData: Date | null;
  columnType: "timestamp";
}>({
  dataType() {
    return "timestamp";
  },
  fromDriver(value) {
    return typeof value === "string" ? new Date(value).getTime() : null;
  },
  toDriver(value) {
    return typeof value === "number" ? new Date(value) : null;
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

// Tables

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  expireAt: unixTimestamp("expire_at"),
  originalWeight: real("original_weight"),
  currentWeight: real("current_weight"),
  itemTypeId: integer("item_type_id").references(() => itemTypes.id, {
    onDelete: "restrict",
  }),
  isPresent: boolean("is_present").default(true),
  createdAt: unixTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: unixTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  deletedAt: unixTimestamp("deleted_at"),
  imageId: integer("image_id").references(() => images.id, {
    onDelete: "set null",
  }),
});
export type ItemObj = Resolved<typeof items.$inferSelect>;

// TODO: make name unique, get rid of the hierarchies
export const itemTypes = pgTable("item_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
});
export type ItemType = Resolved<typeof itemTypes.$inferSelect>;

export const eventTypeEnum = pgEnum("event_type", ["in", "out", "moved"]);
export type EventType = Resolved<typeof eventTypeEnum.enumValues>[number];

// add image
export const itemEvents = pgTable("item_events", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  timestamp: unixTimestamp("timestamp")
    .notNull()
    .default(sql`now()`),
  weight: real("weight"),
});
export type ItemEvent = Resolved<typeof itemEvents.$inferSelect>;

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
  },
  (table) => [
    check("uid_is_lower_hex", sql`${table.uid} ~ '^[0-9a-f]+$'`),
    uniqueIndex("unique_nonnull_item_id")
      .on(table.itemId)
      .where(sql`${table.itemId} IS NOT NULL`),
  ]
);
export type Tag = Resolved<typeof tags.$inferSelect>;

// Move data to S3,
// insert and select only, no updates,
// deletedAt
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  data: bytea("data").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: unixTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: unixTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});
export type ImageMeta = Resolved<typeof images.$inferSelect>;

// Relations

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

export const itemTypesRelations = relations(itemTypes, ({ one, many }) => ({
  parent: one(itemTypes, {
    fields: [itemTypes.parentId],
    references: [itemTypes.id],
  }),
  items: many(items),
}));

export const itemEventsRelations = relations(itemEvents, ({ one }) => ({
  item: one(items, {
    fields: [itemEvents.itemId],
    references: [items.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  item: one(items, {
    fields: [tags.itemId],
    references: [items.id],
  }),
}));

export const imagesRelations = relations(images, ({ many }) => ({
  items: many(items),
}));
