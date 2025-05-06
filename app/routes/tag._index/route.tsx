import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createTag, createTagSchema } from "~/actions/insert.server";
import { getRawItems } from "~/actions/select.server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const items = await getRawItems();
  return { items };
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return;
  }

  const formData = await request.formData();

  const tagFormData: Record<string, FormDataEntryValue | null> = {};
  tagFormData.name = formData.get("name");
  tagFormData.uid = formData.get("uid");
  tagFormData.itemId = formData.get("itemId");

  const tagData: Record<string, unknown> = {
    ...tagFormData,
    uid:
      typeof tagFormData.uid === "string"
        ? tagFormData.uid.replace(/\s+/g, "").toLowerCase()
        : null,
    itemId:
      tagFormData.itemId != null && tagFormData.itemId !== ""
        ? Number(tagFormData.itemId)
        : null,
  };

  // console.log("itemData", itemData);

  const parsed = createTagSchema.parse(tagData);

  const newItem = await createTag(parsed);

  return redirect("/");
};

const ItemIndex = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "create-tag" });

  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Create Tag</h2>
      </div>
      <fetcher.Form
        method="POST"
        encType="multipart/form-data"
        className="h-full w-full p-1 flex flex-col space-y-4 overflow-y-scroll scrollbar"
      >
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="uid">UID (in hex)</Label>
          <Input
            type="text"
            id="uid"
            name="uid"
            required
            placeholder="DE AD BE EF"
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label id="itemId-label">Attached item</Label>
          <Select name="itemId">
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
          <Button className="w-fit">Create</Button>
        </div>
      </fetcher.Form>
    </main>
  );
};
export default ItemIndex;
