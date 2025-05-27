import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { DateTime } from "luxon";

import {
  getImages,
  getItem,
  getItemTypes,
  getTagsWithRawItems,
} from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { PositionFieldset } from "~/components/form/position-fieldset";
import { TagField } from "~/components/form/tag-field";
import { ImageField } from "~/components/form/image-field";
import { ItemTypeField } from "~/components/form/item-type-field";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    {
      title: `Edit Item${
        params.itemId ? " #" + params.itemId : ""
      } - ShelfAware`,
    },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const item = await getItem(Number(params.itemId));
  const tags = await getTagsWithRawItems();
  const images = await getImages();
  const itemTypes = await getItemTypes();

  return { item, tags, images, itemTypes };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const itemEndpoint = "/api/item";
  const itemApiUrl = new URL(itemEndpoint, request.url).toString();

  if (request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();
  formData.append("id", params.itemId);

  const res = await fetch(itemApiUrl, {
    method: request.method,
    body: formData,
  });

  if (!res.ok) {
    if (
      (
        res.headers.get("Content-Type") ?? res.headers.get("content-type")
      )?.startsWith("application/json")
    ) {
      const resError = await res.json();
      return Response.json(resError, { status: res.status });
    } else {
      return new Response(res.body, { status: res.status });
    }
  }

  const newItem = await res.json();

  if (!newItem || !newItem.id) {
    return new Response(`${itemEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return null;
};

const EditItemPage = ({ params, loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-item" });

  return (
    <Main>
      {loaderData.item == null ? (
        <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Item${
              params.itemId ? " #" + params.itemId : ""
            }`}</h2>
          </div>
          <span>Item not found</span>
        </div>
      ) : (
        <Form
          fetcherKey="edit-item"
          method="PATCH"
          encType="multipart/form-data"
          navigate={false}
        >
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Item${
              params.itemId ? " #" + params.itemId : ""
            }`}</h2>
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="name">ID</Label>
            <Input
              type="number"
              id="id"
              autoComplete="off"
              readOnly
              disabled
              value={loaderData.item?.id}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              autoComplete="off"
              required
              defaultValue={loaderData.item?.name}
              className="w-full"
            />
          </div>
          <ItemTypeField
            itemTypeIdFieldName="itemTypeId"
            itemTypeNameFieldName="itemTypeName"
            label="Type"
            itemType={loaderData.item?.type ?? undefined}
            itemTypes={loaderData.itemTypes ?? undefined}
          />
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              autoComplete="off"
              defaultValue={loaderData.item?.description ?? undefined}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="expireAt">Expiration date</Label>
            <Input
              type="date"
              id="expireAt"
              name="expireAt"
              // min={DateTime.now().toISODate()}
              defaultValue={
                loaderData.item?.expireAt != null
                  ? DateTime.fromMillis(
                      loaderData.item?.expireAt
                    ).toISODate() ?? undefined
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
              defaultValue={loaderData.item?.originalWeight ?? undefined}
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
              defaultValue={loaderData.item?.currentWeight ?? undefined}
              className="w-full"
            />
          </div>
          <div className="my-0.5 flex w-full items-center space-x-2">
            <Checkbox
              id="isPresent"
              name="isPresent"
              defaultChecked={loaderData.item?.isPresent ?? true}
            />
            <Label htmlFor="isPresent">
              Mark item as currently in the fridge
            </Label>
          </div>
          <PositionFieldset
            floorInputProps={{
              defaultValue: loaderData.item?.floor ?? undefined,
            }}
            rowInputProps={{ defaultValue: loaderData.item?.row ?? undefined }}
            colInputProps={{ defaultValue: loaderData.item?.col ?? undefined }}
          />
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="createdAt">Item creation date</Label>
            <Input
              type="date"
              id="createdAt"
              readOnly
              disabled
              defaultValue={
                loaderData.item?.createdAt != null
                  ? DateTime.fromMillis(
                      loaderData.item?.createdAt
                    ).toISODate() ?? undefined
                  : undefined
              }
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="updatedAt">Last updated date</Label>
            <Input
              type="date"
              id="updatedAt"
              readOnly
              disabled
              defaultValue={
                loaderData.item?.updatedAt != null
                  ? DateTime.fromMillis(
                      loaderData.item?.updatedAt
                    ).toISODate() ?? undefined
                  : undefined
              }
              className="w-full"
            />
          </div>
          <TagField
            name="tagId"
            tags={loaderData.tags}
            tag={loaderData.item.tag}
          />
          <ImageField
            imageFileFieldName="image"
            imageIdFieldName="imageId"
            label="Image"
            image={loaderData.item?.image ?? undefined}
            images={loaderData.images}
          />
          <div className="flex flex-col w-full space-y-2">
            <Button className="w-fit">Edit</Button>
          </div>
        </Form>
      )}
    </Main>
  );
};
export default EditItemPage;
