import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tables

export const itemTypes = pgTable("item_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageBase64: text("image_base64"),
  expirationDate: timestamp("expiration_date"),
  originalWeight: real("original_weight"),
  currentWeight: real("current_weight"),
  itemTypeId: integer("item_type_id").references(() => itemTypes.id),
  isPresent: boolean("is_present").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const eventTypeEnum = pgEnum("event_type", ["in", "out", "moved"]);

export const itemEvents = pgTable("item_events", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .references(() => items.id)
    .notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  weight: real("weight"),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  uid: varchar("uid", { length: 32 }).notNull().unique(),
  itemId: integer("item_id").references(() => items.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  attachedAt: timestamp("attached_at").defaultNow(),
});

export type InsertItemTypes = typeof itemTypes.$inferInsert;
export type SelectItemTypes = typeof itemTypes.$inferSelect;

export type InsertItems = typeof items.$inferInsert;
export type SelectItems = typeof items.$inferSelect;

export type InsertItemEvents = typeof itemEvents.$inferInsert;
export type SelectItemEvents = typeof itemEvents.$inferSelect;

export type InsertTags = typeof tags.$inferInsert;
export type SelectTags = typeof tags.$inferSelect;

// Relations

export const itemTypesRelations = relations(itemTypes, ({ one, many }) => ({
  parent: one(itemTypes, {
    fields: [itemTypes.parentId],
    references: [itemTypes.id],
  }),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  type: one(itemTypes, {
    fields: [items.itemTypeId],
    references: [itemTypes.id],
  }),
  events: many(itemEvents),
  tags: one(tags),
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
