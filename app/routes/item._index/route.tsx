import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";
import {
  createImage,
  createImageSchema,
  createItem,
  createItemSchema,
} from "~/actions/insert.server";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return;
  }

  const formData = await request.formData();

  const imageFormData: Record<string, FormDataEntryValue | null> = {};
  const imageFile = formData.get("image");
  // console.log("imageFile", imageFile, typeof imageFile);
  if (imageFile instanceof File && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    imageFormData.data = `data:${imageFile.type};base64,${Buffer.from(
      buffer
    ).toString("base64")}`;
  }

  let newImage: Awaited<ReturnType<typeof createImage>> | null = null;
  if (imageFormData.data) {
    // console.log("imageFormData.data", imageFormData.data);
    const parsed = createImageSchema.parse(imageFormData);
    newImage = await createImage(parsed);
  }
  // console.log("newImage", newImage);

  const itemFormData: Record<string, FormDataEntryValue | null> = {};
  itemFormData.name = formData.get("name");
  itemFormData.description = formData.get("description");
  itemFormData.expireAt = formData.get("expireAt");
  itemFormData.originalWeight = formData.get("originalWeight");
  itemFormData.currentWeight = formData.get("currentWeight");
  itemFormData.itemTypeId = formData.get("itemTypeId");
  itemFormData.isPresent = formData.get("isPresent");
  itemFormData.imageId = formData.get("imageId");

  const itemData: Record<string, unknown> = {
    ...itemFormData,
    expireAt:
      typeof itemFormData.expireAt === "string" && itemFormData.expireAt
        ? new Date(itemFormData.expireAt).getTime()
        : null,
    originalWeight:
      itemFormData.originalWeight != null && itemFormData.originalWeight !== ""
        ? Number(itemFormData.originalWeight)
        : null,
    currentWeight:
      itemFormData.currentWeight != null && itemFormData.currentWeight !== ""
        ? Number(itemFormData.currentWeight)
        : null,
    isPresent: Boolean(itemFormData.isPresent),
    imageId: newImage?.id ?? null,
  };

  if (itemData.originalWeight != null && itemData.currentWeight == null) {
    itemData.currentWeight = itemData.originalWeight;
  }

  // console.log("itemData", itemData);

  const parsed = createItemSchema.parse(itemData);

  const newItem = await createItem(parsed);

  return redirect("/");
};

const ItemIndex = () => {
  const fetcher = useFetcher({ key: "create-item" });

  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Create Item</h2>
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
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="expireAt">Expiration date</Label>
          <Input
            type="date"
            id="expireAt"
            name="expireAt"
            // min={new Date().toISOString().split("T")[0]}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="originalWeight">Original weight (in grams)</Label>
          <Input
            type="number"
            id="originalWeight"
            name="originalWeight"
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="currentWeight">Current weight (in grams)</Label>
          <Input
            type="number"
            id="currentWeight"
            name="currentWeight"
            placeholder="Same as original weight"
            className="w-full"
          />
        </div>
        {/* <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="itemTypeId">Item type ID</Label>
          <Input
            type="number"
            id="itemTypeId"
            name="itemTypeId"
            className="w-full"
          />
        </div> */}
        <div className="flex w-full items-center space-x-2">
          <Checkbox id="isPresent" name="isPresent" defaultChecked />
          <Label htmlFor="isPresent">
            Mark item as currently in the fridge
          </Label>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input type="file" accept="image/*" id="image" name="image" />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Create</Button>
        </div>
      </fetcher.Form>
    </main>
  );
};
export default ItemIndex;
