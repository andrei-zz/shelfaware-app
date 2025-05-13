import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { getItems, getTag } from "~/actions/select.server";
import { updateTag, updateTagSchema } from "~/actions/update.server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DateTime } from "luxon";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    { title: `Edit Tag${params.tagId ? " " + params.tagId : ""} - ShelfAware` },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const tag = await getTag(Number(params.tagId));
  const items = await getItems();
  return { tag, items };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
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

const TagId = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-tag" });

  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Edit Tag</h2>
      </div>
      {loaderData.tag == null ? (
        <div className="h-full w-full p-1 flex flex-col space-y-4 overflow-y-scroll scrollbar">
          Tag not found
        </div>
      ) : (
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
                    {item.id}: {item.name}, {item.currentWeight} g
                    {item.tag == null
                      ? null
                      : ` (attached to ${item.tag.name}, UID: ${item.tag.uid})`}
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
                  ? DateTime.fromMillis(
                      loaderData?.tag?.createdAt
                    ).toISODate() ?? undefined
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
                  ? DateTime.fromMillis(
                      loaderData?.tag?.attachedAt
                    ).toISODate() ?? undefined
                  : undefined
              }
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Button className="w-fit">Edit</Button>
          </div>
        </fetcher.Form>
      )}
    </main>
  );
};
export default TagId;
