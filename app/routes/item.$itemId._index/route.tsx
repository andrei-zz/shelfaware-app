import { getItem } from "~/actions/select.server";
import type { Route } from "./+types/route";
import { redirect, useFetcher } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { createImageSchema, createImage } from "~/actions/insert.server";
import { updateItem, updateItemSchema } from "~/actions/update.server";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const item = await getItem(Number(params.itemId));
  return { item };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
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
    id: Number(params.itemId),
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
    imageId: newImage?.id ?? undefined,
  };

  // console.log(
  //   itemData.originalWeight,
  //   itemData.currentWeight,
  //   itemData.originalWeight != null && itemData.currentWeight == null
  // );

  if (itemData.originalWeight != null && itemData.currentWeight == null) {
    itemData.currentWeight = itemData.originalWeight;
  }

  // console.log("itemData", itemData);

  const parsed = updateItemSchema.parse(itemData);
  // console.log(parsed.originalWeight, parsed.currentWeight);

  const newItem = await updateItem(parsed);

  return redirect("/");
};

const ItemId = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-item" });

  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Edit Item</h2>
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
            value={loaderData?.item?.id}
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
            defaultValue={loaderData?.item?.name}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            defaultValue={loaderData?.item?.description ?? undefined}
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
            defaultValue={
              loaderData?.item?.expireAt != null
                ? new Date(loaderData?.item?.expireAt)
                    .toISOString()
                    .split("T")[0]
                : undefined
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="originalWeight">Original weight (in grams)</Label>
          <Input
            type="number"
            id="originalWeight"
            name="originalWeight"
            defaultValue={loaderData?.item?.originalWeight ?? undefined}
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
            defaultValue={loaderData?.item?.currentWeight ?? undefined}
            className="w-full"
          />
        </div>
        {/* <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="itemTypeId">Item type ID</Label>
          <Input
            type="number"
            id="itemTypeId"
            name="itemTypeId"
            defaultValue={loaderData?.item?.itemTypeId ?? undefined}
            className="w-full"
          />
        </div> */}
        <div className="flex w-full items-center space-x-2">
          <Checkbox
            id="isPresent"
            name="isPresent"
            defaultChecked={loaderData?.item?.isPresent ?? true}
          />
          <Label htmlFor="isPresent">
            Mark item as currently in the fridge
          </Label>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="expireAt">Item creation date</Label>
          <Input
            type="date"
            id="createdAt"
            readOnly
            disabled
            defaultValue={
              loaderData?.item?.createdAt != null
                ? new Date(loaderData?.item?.createdAt)
                    .toISOString()
                    .split("T")[0]
                : undefined
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="expireAt">Last updated date</Label>
          <Input
            type="date"
            id="updatedAt"
            readOnly
            disabled
            defaultValue={
              loaderData?.item?.updatedAt != null
                ? new Date(loaderData?.item?.updatedAt)
                    .toISOString()
                    .split("T")[0]
                : undefined
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="image">Image</Label>
          {loaderData?.item?.image ? (
            <div className="w-48 h-48 flex justify-center items-center">
              <img
                className="max-w-full max-h-full contain-layout"
                src={loaderData.item.image.data}
              />
            </div>
          ) : null}
          <Input type="file" accept="image/*" id="image" name="image" />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Edit</Button>
        </div>
      </fetcher.Form>
    </main>
  );
};
export default ItemId;
