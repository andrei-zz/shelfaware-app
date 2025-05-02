import { customType, uniqueIndex } from "drizzle-orm/pg-core";
import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Typescript types

export type InsertItemTypes = typeof itemTypes.$inferInsert;
export type SelectItemTypes = typeof itemTypes.$inferSelect;

export type InsertItems = typeof items.$inferInsert;
export type SelectItems = typeof items.$inferSelect;

export type InsertItemEvents = typeof itemEvents.$inferInsert;
export type SelectItemEvents = typeof itemEvents.$inferSelect;

export type InsertTags = typeof tags.$inferInsert;
export type SelectTags = typeof tags.$inferSelect;

// Types

const unixTimestamp = customType<{
  data: number;
  driverData: Date;
  columnType: "timestamp";
}>({
  dataType() {
    return "timestamp";
  },
  fromDriver(value: Date) {
    return value.getTime();
  },
  toDriver(value: number) {
    return new Date(value);
  },
});

// Tables

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  expireAt: unixTimestamp("expire_at"),
  originalWeight: real("original_weight"),
  currentWeight: real("current_weight"),
  itemTypeId: integer("item_type_id"),
  isPresent: boolean("is_present").default(true),
  createdAt: unixTimestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: unixTimestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  deletedAt: unixTimestamp("deleted_at"),
  imageBase64: text("image_base64"),
});

export const itemTypes = pgTable("item_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
});

export const eventTypeEnum = pgEnum("event_type", ["in", "out", "moved"]);

export const itemEvents = pgTable("item_events", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  timestamp: unixTimestamp("timestamp")
    .notNull()
    .default(sql`now()`),
  weight: real("weight"),
});

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    uid: varchar("uid", { length: 32 }).notNull().unique(),
    itemId: integer("item_id"),
    createdAt: unixTimestamp("created_at")
      .notNull()
      .default(sql`now()`),
    attachedAt: unixTimestamp("attached_at"),
  },
  (table) => [
    uniqueIndex("unique_nonnull_item_id")
      .on(table.itemId)
      .where(sql`${table.itemId} IS NOT NULL`),
  ]
);

// Relations

export const itemsRelations = relations(items, ({ one, many }) => ({
  type: one(itemTypes, {
    fields: [items.itemTypeId],
    references: [itemTypes.id],
  }),
  events: many(itemEvents),
  tag: one(tags),
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
    fields: [itemEvents.id],
    references: [items.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  item: one(items, {
    fields: [tags.itemId],
    references: [items.id],
  }),
}));
