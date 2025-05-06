import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { getRawItems, getTag } from "~/actions/select.server";
import { updateTag, updateTagSchema } from "~/actions/update.server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// export const tags = pgTable(
//   "tags",
//   {
//     id: serial("id").primaryKey(),
//     name: text("name").notNull(),
//     uid: varchar("uid", { length: 32 }).notNull().unique(),
//     itemId: integer("item_id").references(() => items.id, {
//       onDelete: "set null",
//     }),
//     createdAt: unixTimestamp("created_at")
//       .notNull()
//       .default(sql`now()`),
//     attachedAt: unixTimestamp("attached_at"),
//   },
//   (table) => [
//     check("uid_is_lower_hex", sql`${table.uid} ~ '^[0-9a-f]+$'`),
//     uniqueIndex("unique_nonnull_item_id")
//       .on(table.itemId)
//       .where(sql`${table.itemId} IS NOT NULL`),
//   ]
// );
// export const tagsRelations = relations(tags, ({ one }) => ({
//   item: one(items, {
//     fields: [tags.itemId],
//     references: [items.id],
//   }),
// }));
// export const createTagSchema = createInsertSchema(tags).omit({
//   id: true,
//   createdAt: true,
//   attachedAt: true,
// });
// export const createTag = async (data: z.infer<typeof createTagSchema>) => {
//   const attachedAt = data.itemId != null ? sql`now()` : null;

//   if (data.itemId != null) {
//     await db
//       .update(items)
//       .set({ updatedAt: sql`now()` })
//       .where(eq(items.id, data.itemId));
//   }

//   return await db
//     .insert(tags)
//     .values({ ...data, attachedAt })
//     .returning()
//     .then((value) => value[0]);
// };

export const loader = async ({ params }: Route.LoaderArgs) => {
  const tag = await getTag(Number(params.tagId));
  const items = await getRawItems();
  return { tag, items };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return;
  }

  const formData = await request.formData();

  const tagFormData: Record<string, FormDataEntryValue | null> = {};
  tagFormData.name = formData.get("name");
  tagFormData.itemId = formData.get("itemId");

  const tagData: Record<string, unknown> = {
    ...tagFormData,
    id: Number(params.tagId),
    itemId:
      tagFormData.itemId != null && tagFormData.itemId !== ""
        ? Number(tagFormData.itemId)
        : null,
  };

  // console.log("itemData", itemData);

  const parsed = updateTagSchema.parse(tagData);

  const newItem = await updateTag(parsed);

  return redirect("/");
};

const ItemId = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-tag" });

  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Edit Tag</h2>
      </div>
      <fetcher.Form
        method="POST"
        encType="multipart/form-data"
        className="h-full w-full p-1 flex flex-col space-y-4 overflow-y-scroll scrollbar"
      >
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="name">ID</Label>
          <Input
            type="number"
            id="id"
            readOnly
            disabled
            defaultValue={loaderData?.tag?.id}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={loaderData?.tag?.name}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="uid">UID (in hex)</Label>
          <Input
            type="text"
            id="uid"
            readOnly
            disabled
            placeholder="DE AD BE EF"
            defaultValue={loaderData?.tag?.uid}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label id="itemId-label">Attached item</Label>
          <Select
            name="itemId"
            defaultValue={loaderData?.tag?.itemId?.toString() ?? undefined}
          >
            <SelectTrigger aria-labelledby="itemId-label" className="w-full">
              <SelectValue placeholder="Unattached" />
            </SelectTrigger>
            <SelectContent>
              {loaderData.items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.id}: {item.name} ({item.currentWeight} g)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="createdAt">Creation date</Label>
          <Input
            type="date"
            id="createdAt"
            readOnly
            disabled
            defaultValue={
              loaderData?.tag?.createdAt != null
                ? new Date(loaderData?.tag?.createdAt)
                    .toISOString()
                    .split("T")[0]
                : undefined
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="attachedAt">Attached date</Label>
          <Input
            type="date"
            id="attachedAt"
            readOnly
            disabled
            defaultValue={
              loaderData?.tag?.attachedAt != null
                ? new Date(loaderData?.tag?.attachedAt)
                    .toISOString()
                    .split("T")[0]
                : undefined
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Edit</Button>
        </div>
      </fetcher.Form>
    </main>
  );
};
export default ItemId;
